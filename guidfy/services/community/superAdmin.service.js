import apiClient from '@/lib/apiClient';

// ═══════════════════════════════════════════════════
//  SUPER ADMIN ONLY — /api/super-admin/...
// ═══════════════════════════════════════════════════

// Communities
export const getAllCommunitiesSA = (params = {}) =>
  apiClient.get('/super-admin/communities', { params });

export const getCommunityDetailsSA = (communityId) =>
  apiClient.get(`/super-admin/community/${communityId}`);

export const suspendCommunity = (communityId, reason = '') =>
  apiClient.post(`/super-admin/community/${communityId}/suspend`, { reason });

export const activateCommunity = (communityId) =>
  apiClient.post(`/super-admin/community/${communityId}/activate`);

export const deleteCommunitySA = (communityId) =>
  apiClient.delete(`/super-admin/community/${communityId}`);

// Admin Assignment
export const assignAdminToCommunity = (communityId, userId) =>
  apiClient.post(`/super-admin/community/${communityId}/assign-admin`, { userId });

export const removeAdminFromCommunity = (communityId, userId) =>
  apiClient.post(`/super-admin/community/${communityId}/remove-admin`, { userId });

export const getCommunityAdminsSA = (params = {}) =>
  apiClient.get('/super-admin/admins', { params });

// Members (Super Admin)
export const getCommunityMembersSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/members`, { params });

export const banMemberSA = (communityId, userId, reason = '') =>
  apiClient.post(`/super-admin/community/${communityId}/members/${userId}/ban`, { reason });

export const unbanMemberSA = (communityId, userId) =>
  apiClient.post(`/super-admin/community/${communityId}/members/${userId}/unban`);

// Content (Super Admin)
export const getCommunityPostsSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/posts`, { params });

export const deletePostSA = (communityId, postId, reason = '') =>
  apiClient.delete(`/super-admin/community/${communityId}/posts/${postId}`, { data: { reason } });

export const getCommunityQuestionsSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/questions`, { params });

export const deleteQuestionSA = (communityId, questionId, reason = '') =>
  apiClient.delete(`/super-admin/community/${communityId}/questions/${questionId}`, { data: { reason } });

// Reports (Super Admin)
export const getAllReportsSA = (params = {}) =>
  apiClient.get('/super-admin/reports', { params });

export const getCommunityReportsSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/reports`, { params });

export const resolveReportSA = (reportId, notes = '') =>
  apiClient.post(`/super-admin/reports/${reportId}/resolve`, { notes });

export const dismissReportSA = (reportId) =>
  apiClient.post(`/super-admin/reports/${reportId}/dismiss`);

// Analytics (Super Admin)
export const getPlatformAnalytics = () =>
  apiClient.get('/super-admin/analytics');

export const getCommunityAnalyticsSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/analytics`, { params });

export const getCommunitiesAnalyticsSA = () =>
  apiClient.get('/super-admin/communities/analytics');

// Logs (Super Admin)
export const getCommunityLogsSA = (communityId, params = {}) =>
  apiClient.get(`/super-admin/community/${communityId}/logs`, { params });

export const createCommunity = (data) =>
  apiClient.post('/super-admin/community', data);

export const updateCommunity = (communityId, data) =>
  apiClient.put(`/super-admin/community/${communityId}`, data);

export const deleteCommunity = (communityId) =>
  apiClient.delete(`/super-admin/community/${communityId}`);

