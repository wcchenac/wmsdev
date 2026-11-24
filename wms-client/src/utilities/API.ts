import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import store from '../store';
import { SET_Current_User } from '../types';
import { DuplicateRequestError, buildWriteRequestKey } from './requestDedup';

declare global {
    interface Window {
        __WMS_CONFIG__?: { apiBaseUrl?: string };
    }
}

type RuntimeConfig = { apiBaseUrl?: string };
type BuildTimeEnv = { VITE_API_BASE_URL?: string; REACT_APP_API_BASE_URL?: string };

const SAME_ORIGIN = '/';

/**
 * Resolve the API origin used by axios.
 *
 * Order:
 * 1. window.__WMS_CONFIG__.apiBaseUrl, written to public/config.js at container
 *    start (docker/frontend/40-runtime-config.sh). When it is a string it always
 *    wins: an empty string means "same origin" (nginx proxies /api) and must not
 *    fall through to a URL baked in at build time.
 * 2. VITE_API_BASE_URL or REACT_APP_API_BASE_URL baked in at build time
 *    (.env.development / .env.production), used only when apiBaseUrl is not set.
 * 3. "/" so requests stay on this origin and a reverse proxy (nginx) can forward /api
 */
export const resolveApiBaseUrl = (
    runtimeConfig: RuntimeConfig | undefined = typeof window !== 'undefined'
        ? window.__WMS_CONFIG__
        : undefined,
    env: BuildTimeEnv = import.meta.env,
): string => {
    const runtimeBase = runtimeConfig?.apiBaseUrl;
    if (typeof runtimeBase === 'string') {
        return runtimeBase.trim() || SAME_ORIGIN;
    }

    const buildTimeBase = [env.VITE_API_BASE_URL, env.REACT_APP_API_BASE_URL]
        .map((value) => value?.trim())
        .find(Boolean);
    return buildTimeBase || SAME_ORIGIN;
};

const API: AxiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
    responseEncoding: 'utf8',
    timeout: 30000, // 30 second timeout
});

export const SESSION_EXPIRED_MESSAGE = '登入已逾時，請重新登入';
/** How long the message stays on screen before the page moves to /login. */
export const SESSION_EXPIRED_REDIRECT_DELAY_MS = 2000;

/** A wrong password on the login page also gets 401; the login form shows that one. */
const LOGIN_URL = '/api/user/login';

/** Set once the session-expired message is up and /login is on its way. */
let redirectingToLogin = false;

// Response interceptor for error handling (kept at handlers[0] for session-expiry handling)
API.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network Error: Please check your connection');
        }
        // Any other 401 means the user is no longer signed in: the JWT expired mid-session, or
        // the token is already gone (signed out in another tab). Pages leave 401s to this
        // handler (isSessionExpired), so it always tells the user and goes to /login. Requests
        // failing at the same time show the message and schedule the redirect only once.
        if (error.response && error.response.status === 401 && error.config?.url !== LOGIN_URL) {
            localStorage.removeItem('jwtToken');
            delete API.defaults.headers.common['Authorization'];
            store.dispatch({
                type: SET_Current_User,
                payload: {},
            });
            if (!redirectingToLogin) {
                redirectingToLogin = true;
                toast.error(SESSION_EXPIRED_MESSAGE, { toastId: 'session-expired' });
                setTimeout(() => {
                    redirectingToLogin = false;
                    window.location.href = '/login';
                }, SESSION_EXPIRED_REDIRECT_DELAY_MS);
            }
        }
        return Promise.reject(error);
    }
);

const inFlightWrites = new Set<string>();

function runDeduplicatedWrite<R>(
    config: AxiosRequestConfig,
    execute: () => Promise<R>
): Promise<R> {
    let key: string | null;
    try {
        key = buildWriteRequestKey(
            {
                baseURL: API.defaults.baseURL,
                ...config,
            },
            API.defaults.method
        );
    } catch (err) {
        return Promise.reject(err);
    }
    if (key === null) {
        return execute();
    }
    if (inFlightWrites.has(key)) {
        return Promise.reject(new DuplicateRequestError());
    }
    inFlightWrites.add(key);
    let promise: Promise<R>;
    try {
        promise = execute();
    } catch (err) {
        inFlightWrites.delete(key);
        return Promise.reject(err);
    }
    return Promise.resolve(promise).finally(() => {
        inFlightWrites.delete(key);
    });
}

// Wrap write-capable Axios shorthands directly (axios.create binds each method to its internal context)
// so concurrent identical mutations are blocked synchronously and always released on settlement.
const baseRequest = API.request.bind(API);
API.request = (function deduplicatedRequest<T = unknown, R = AxiosResponse<T>, D = unknown>(
    configOrUrl: AxiosRequestConfig<D> | string,
    maybeConfig?: AxiosRequestConfig<D>
) {
    const resolvedConfig: AxiosRequestConfig<D> =
        typeof configOrUrl === 'string'
            ? { ...maybeConfig, url: configOrUrl }
            : (configOrUrl ?? {});
    return runDeduplicatedWrite(resolvedConfig, () =>
        baseRequest<T, R, D>(resolvedConfig)
    );
}) as typeof API.request;

const wrapDataWrite = (
    method: 'post' | 'put' | 'patch',
    key: 'post' | 'put' | 'patch' | 'postForm' | 'putForm' | 'patchForm'
) => {
    const baseFn = API[key].bind(API);
    API[key] = (function <T = unknown, R = AxiosResponse<T>, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ) {
        return runDeduplicatedWrite({ ...config, method, url, data }, () =>
            baseFn<T, R, D>(url, data, config)
        );
    }) as typeof API[typeof key];
};

wrapDataWrite('post', 'post');
wrapDataWrite('put', 'put');
wrapDataWrite('patch', 'patch');
wrapDataWrite('post', 'postForm');
wrapDataWrite('put', 'putForm');
wrapDataWrite('patch', 'patchForm');

const baseDelete = API.delete.bind(API);
API.delete = (function <T = unknown, R = AxiosResponse<T>, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>
) {
    return runDeduplicatedWrite({ ...config, method: 'delete', url }, () =>
        baseDelete<T, R, D>(url, config)
    );
}) as typeof API.delete;

type RequestExecutor = <T = unknown, R = AxiosResponse<T>, D = unknown>(
    configOrUrl: AxiosRequestConfig<D> | string,
    maybeConfig?: AxiosRequestConfig<D>
) => Promise<R>;

// Also intercept callable invocations like API({ method: 'post', url, data }) or API(url, config).
const deduplicatedAPI = new Proxy(API, {
    apply(_target, _thisArg, argArray: [AxiosRequestConfig | string, AxiosRequestConfig?]) {
        return (API.request as unknown as RequestExecutor)(argArray[0], argArray[1]);
    },
});

export default deduplicatedAPI;
