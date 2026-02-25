import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('meetrix_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 — refresh token (skip for auth endpoints)
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || '';
        const isAuthEndpoint = url.startsWith('/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('meetrix_refresh');
                const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                if (data.success) {
                    localStorage.setItem('meetrix_token', data.data.accessToken);
                    localStorage.setItem('meetrix_refresh', data.data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('meetrix_token');
                localStorage.removeItem('meetrix_refresh');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
