// ✅ استبدال كامل — بدل localStorage + Bearer token
import apiClient from '@/lib/apiClient';

const api = {
  get:    (url, config) => apiClient.get(`/super-admin${url}`, config),
  post:   (url, data, config) => apiClient.post(`/super-admin${url}`, data, config),
  put:    (url, data, config) => apiClient.put(`/super-admin${url}`, data, config),
  patch:  (url, data, config) => apiClient.patch(`/super-admin${url}`, data, config),
  delete: (url, config) => apiClient.delete(`/super-admin${url}`, config),
};

export default api;