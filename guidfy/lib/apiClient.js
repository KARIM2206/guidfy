/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECURE AXIOS CLIENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the single source of truth for all API requests. It enforces:
 * - HttpOnly cookie-based authentication (withCredentials: true)
 * - Centralized error handling
 * - Automatic token refresh on 401
 * - Request/response interceptors for security
 * - Environment-based API URL configuration
 *
 * NEVER inject Bearer tokens manually in components. All auth is cookie-based.
 */

import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ CRITICAL: Enable HttpOnly cookie transmission
  timeout: 1200000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // ✅ Cookies are automatically sent by the browser with withCredentials: true
    // ❌ DO NOT manually add Authorization headers here
    // ❌ DO NOT read from localStorage

    // Optional: Add custom headers (e.g., for API versioning)
    config.headers['X-API-Version'] = '1.0';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────────────────────────────────────

// ✅ Endpoints that should NEVER trigger token refresh or redirect
// These are auth-related endpoints — hitting them means auth already failed
const SKIP_REFRESH_URLS = ['/auth/me', '/auth/refresh', '/auth/login'];

apiClient.interceptors.response.use(
  (response) => {
    // ✅ Success: Return response data
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ─── Handle 401 Unauthorized ────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {

      // ✅ FIX: Skip refresh logic for auth endpoints to prevent infinite loop
      const isSkipped = SKIP_REFRESH_URLS.some((url) =>
        originalRequest.url?.includes(url)
      );

      if (isSkipped) {
        // Just reject — let React Query / AuthContext handle it cleanly
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh the token via the refresh endpoint
        // The backend should set a new HttpOnly cookie automatically
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // ✅ Token refreshed successfully, retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // ❌ Refresh failed → redirect to login only if not already there
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // ─── Handle other errors ────────────────────────────────────────────
    if (error.response?.status === 403) {
      console.error('❌ Forbidden: Access denied');
    }

    if (error.response?.status === 500) {
      console.error('❌ Server Error: Internal server error');
    }

    // ✅ Return structured error for React Query to handle
    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;
export { API_URL };