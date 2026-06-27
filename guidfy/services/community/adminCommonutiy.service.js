import apiClient from '@/lib/apiClient';

// ═══════════════════════════════════════════════════
//  ADMIN ONLY — /api/admin/...
//  (Admin manages their assigned communities)
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
//  MY COMMUNITIES
// ═══════════════════════════════════════════════════

export const getAdminCommunities = (params = {}) =>
  apiClient.get('/admin/communities', { params });

export const getAdminCommunity = (slug) =>
  apiClient.get(`/admin/community/${slug}`);

export const updateAdminCommunity = (slug, data) =>
  apiClient.put(`/admin/community/${slug}`, data);

// ═══════════════════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════════════════

export const getAdminMembers = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/members`, { params });

export const banMember = (slug, userId, data) =>
  apiClient.post(`/admin/community/${slug}/members/${userId}/ban`, data);

export const unbanMember = (slug, userId) =>
  apiClient.post(`/admin/community/${slug}/members/${userId}/unban`);

export const removeMemberByAdmin = (slug, userId) =>
  apiClient.delete(`/admin/community/${slug}/members/${userId}`);

// ═══════════════════════════════════════════════════
//  POSTS
// ═══════════════════════════════════════════════════

export const getAdminPosts = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/posts`, { params });

export const deletePostByAdmin = (slug, postId, reason) =>
  apiClient.delete(`/admin/community/${slug}/posts/${postId}`, { data: { reason } });

// ═══════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════

export const getAdminQuestions = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/questions`, { params });

export const deleteQuestionByAdmin = (slug, questionId, reason) =>
  apiClient.delete(`/admin/community/${slug}/questions/${questionId}`, { data: { reason } });

// ═══════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════

export const getAdminReports = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/reports`, { params });

export const resolveReportByAdmin = (reportId, data) =>
  apiClient.put(`/admin/reports/${reportId}/resolve`, data);

export const dismissReportByAdmin = (reportId) =>
  apiClient.put(`/admin/reports/${reportId}/dismiss`);

// ═══════════════════════════════════════════════════
//  ANALYTICS & LOGS
// ═══════════════════════════════════════════════════

export const getAdminAnalytics = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/analytics`, { params });

export const getAdminActionLogs = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/logs`, { params });

export const getAdminBannedMembers = (slug, params = {}) =>
  apiClient.get(`/admin/community/${slug}/banned-members`, { params });