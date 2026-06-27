import axios from 'axios';
import apiClient from '../lib/apiClient';

const adminApi = axios.create({
  baseURL: 'http://localhost:8000/api/admin',
  withCredentials: true,        // ✅ الكوكيز هتتبعت تلقائياً
  timeout: 1200000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor (نفس apiClient) ───
adminApi.interceptors.request.use(
  (config) => {
    config.headers['X-API-Version'] = '1.0';
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (نفس apiClient بالظبط) ───
const SKIP_REFRESH_URLS = ['/auth/me', '/auth/refresh', '/auth/login'];

adminApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isSkipped = SKIP_REFRESH_URLS.some((url) =>
        originalRequest.url?.includes(url)
      );
      if (isSkipped) return Promise.reject(error);

      originalRequest._retry = true;

      try {
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return adminApi(originalRequest);
      } catch (refreshError) {
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) console.error('❌ Forbidden');
    if (error.response?.status === 500) console.error('❌ Server Error');

    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default adminApi;