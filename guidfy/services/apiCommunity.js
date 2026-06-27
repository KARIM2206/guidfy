// api/admin.js
import apiClient from "../lib/apiClient";

const adminApi = {
  get: (url, config) => apiClient.get(`/admin${url}`, config),
  post: (url, data, config) => apiClient.post(`/admin${url}`, data, config),
  put: (url, data, config) => apiClient.put(`/admin${url}`, data, config),
  delete: (url, config) => apiClient.delete(`/admin${url}`, config),
  patch: (url, data, config) => apiClient.patch(`/admin${url}`, data, config),
};

export default adminApi;