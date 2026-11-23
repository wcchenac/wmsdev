import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import store from '../store';
import { SET_Current_User } from '../types';

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

// Response interceptor for error handling
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

export default API;
