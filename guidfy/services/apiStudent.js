// ✅ استبدال كامل
// بدل localStorage + Bearer token، نستخدم apiClient اللي بيبعت الـ cookie تلقائي

import apiClient from '@/lib/apiClient';

const api = {
  get:    (url, config) => apiClient.get(`/student${url}`, config),
  post:   (url, data, config) => apiClient.post(`/student${url}`, data, config),
  put:    (url, data, config) => apiClient.put(`/student${url}`, data, config),
  delete: (url, config) => apiClient.delete(`/student${url}`, config),
};

export default api;