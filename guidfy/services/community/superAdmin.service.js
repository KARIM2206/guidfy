import api from '../apiCommunity';

// ═══════════════════════════════════════════════════
// COMMUNITY MANAGEMENT
// ═══════════════════════════════════════════════════

export const getAllCommunitiesSA = (params = {}) =>
  api.get('/super-admin/communities', { params }).then(res => res.data);

export const getCommunityDetailsSA = (communityId) =>
  api.get(`/super-admin/community/${communityId}`).then(res => res.data);

export const suspendCommunity = (communityId, reason = '') =>
  api.post(`/super-admin/community/${communityId}/suspend`, { reason }).then(res => res.data);

export const activateCommunity = (communityId) =>
  api.post(`/super-admin/community/${communityId}/activate`, {}).then(res => res.data);

export const deleteCommunitySA = (communityId) =>
  api.delete(`/super-admin/community/${communityId}`).then(res => res.data);

// ═══════════════════════════════════════════════════
// ADMIN ASSIGNMENT
// ═══════════════════════════════════════════════════

export const assignAdminToCommunity = (communityId, userId) =>
  api.post(`/super-admin/community/${communityId}/assign-admin`, { userId }).then(res => res.data);

export const removeAdminFromCommunity = (communityId, userId) =>
  api.post(`/super-admin/community/${communityId}/remove-admin`, { userId }).then(res => res.data);

export const getCommunityAdminsSA = (params = {}) =>
  api.get('/super-admin/admins', { params }).then(res => res.data);

// ═══════════════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════════════

export const getCommunityMembersSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/members`, { params }).then(res => res.data);

export const banMemberSA = (communityId, userId, reason = '') =>
  api.post(`/super-admin/community/${communityId}/members/${userId}/ban`, { reason }).then(res => res.data);

export const unbanMemberSA = (communityId, userId) =>
  api.post(`/super-admin/community/${communityId}/members/${userId}/unban`, {}).then(res => res.data);

// ═══════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════

export const getCommunityPostsSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/posts`, { params }).then(res => res.data);

export const deletePostSA = (communityId, postId, reason = '') =>
  api.delete(`/super-admin/community/${communityId}/posts/${postId}`, { data: { reason } }).then(res => res.data);

export const getCommunityQuestionsSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/questions`, { params }).then(res => res.data);

export const deleteQuestionSA = (communityId, questionId, reason = '') =>
  api.delete(`/super-admin/community/${communityId}/questions/${questionId}`, { data: { reason } }).then(res => res.data);

// ═══════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════

export const getAllReportsSA = (params = {}) =>
  api.get('/super-admin/reports', { params }).then(res => res.data);

export const getCommunityReportsSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/reports`, { params }).then(res => res.data);

export const resolveReportSA = (reportId, notes = '') =>
  api.post(`/super-admin/reports/${reportId}/resolve`, { notes }).then(res => res.data);

// ═══════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════

export const getPlatformAnalytics = () =>
  api.get('/super-admin/analytics').then(res => res.data);

export const getCommunityAnalyticsSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/analytics`, { params }).then(res => res.data);

export const getCommunitiesAnalyticsSA = () =>
  api.get('/super-admin/communities/analytics').then(res => res.data);

// ═══════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════

export const getCommunityLogsSA = (communityId, params = {}) =>
  api.get(`/super-admin/community/${communityId}/logs`, { params }).then(res => res.data);