import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

/**
 * API Configuration
 * Base URL is configured via environment variables:
 * - Development: .env.development (localhost:8080)
 * - Production: .env.production (server URL)
 */
const API: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
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
