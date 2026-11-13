import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

declare global {
    interface Window {
        __WMS_CONFIG__?: { apiBaseUrl?: string };
    }
}

/**
 * Resolve the API origin used by axios.
 *
 * Order:
 * 1. window.__WMS_CONFIG__.apiBaseUrl, written to public/config.js at container
 *    start (docker/frontend/40-runtime-config.sh)
 * 2. VITE_API_BASE_URL or REACT_APP_API_BASE_URL baked in at build time
 *    (.env.development / .env.production)
 * 3. "/" so requests stay on this origin and a reverse proxy (nginx) can forward /api
 */
const resolveApiBaseUrl = (): string => {
    const runtimeBase =
        typeof window !== 'undefined' && typeof window.__WMS_CONFIG__?.apiBaseUrl === 'string'
            ? window.__WMS_CONFIG__.apiBaseUrl.trim()
            : '';

    if (runtimeBase) {
        return runtimeBase;
    }

    const buildTimeBase =
        import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE_URL;
    if (buildTimeBase) {
        return buildTimeBase;
    }

    return '/';
};

const API: AxiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
    responseEncoding: 'utf8',
    timeout: 30000, // 30 second timeout
});

export const SESSION_EXPIRED_MESSAGE = '登入已逾時，請重新登入';
/** How long the message stays on screen before the page moves to /login. */
export const SESSION_EXPIRED_REDIRECT_DELAY_MS = 2000;

// Response interceptor for error handling
API.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network Error: Please check your connection');
        }
        // 401 while signed in: the JWT expired mid-session. (A wrong password on the login
        // page has no stored token and is left to the login form.) The first 401 clears the
        // token, so other requests failing at the same time do not repeat this.
        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                localStorage.removeItem('jwtToken');
                delete API.defaults.headers.common['Authorization'];
                toast.error(SESSION_EXPIRED_MESSAGE, { toastId: 'session-expired' });
                setTimeout(() => {
                    window.location.href = '/login';
                }, SESSION_EXPIRED_REDIRECT_DELAY_MS);
            }
        }
        return Promise.reject(error);
    }
);

export default API;
