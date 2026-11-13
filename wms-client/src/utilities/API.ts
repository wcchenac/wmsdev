import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

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
 * 2. REACT_APP_API_BASE_URL baked in at build time (.env.development / .env.production)
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

    if (process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }

    return '/';
};

const API: AxiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
    responseEncoding: 'utf8',
    timeout: 30000, // 30 second timeout
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network Error: Please check your connection');
        }
        // Handle 401 Unauthorized - token expired
        if (error.response && error.response.status === 401) {
            // Token might be expired, clear localStorage
            const token = localStorage.getItem('jwtToken');
            if (token) {
                localStorage.removeItem('jwtToken');
                // Optionally redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
