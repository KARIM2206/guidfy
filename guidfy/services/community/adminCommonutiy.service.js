import api from '../apiCommunity'; // تأكد من المسار الصحيح

// ═══════════════════════════════════════════════════
//  COMMUNITY
// ═══════════════════════════════════════════════════

export const getAdminCommunity = (slug) =>
  api.get(`/admin/community/${slug}`).then(res => res.data);

export const updateAdminCommunity = (slug, data) =>
  api.put(`/admin/community/${slug}`, data).then(res => res.data);

// ═══════════════════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════════════════

export const getAdminMembers = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/members`, { params }).then(res => res.data);

export const banMember = (slug, userId, data) =>
  api.post(`/admin/community/${slug}/members/${userId}/ban`, data).then(res => res.data);

export const unbanMember = (slug, userId) =>
  api.post(`/admin/community/${slug}/members/${userId}/unban`, {}).then(res => res.data);

export const removeMemberByAdmin = (slug, userId) =>
  api.delete(`/admin/community/${slug}/members/${userId}`).then(res => res.data);

// ═══════════════════════════════════════════════════
//  POSTS
// ═══════════════════════════════════════════════════

export const getAdminPosts = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/posts`, { params }).then(res => res.data);

export const deletePostByAdmin = (slug, postId, reason) =>
  api.delete(`/admin/community/${slug}/posts/${postId}`, { data: { reason } }).then(res => res.data);

// ═══════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════

export const getAdminQuestions = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/questions`, { params }).then(res => res.data);

export const deleteQuestionByAdmin = (slug, questionId, reason) =>
  api.delete(`/admin/community/${slug}/questions/${questionId}`, { data: { reason } }).then(res => res.data);

// ═══════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════

export const getAdminReports = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/reports`, { params }).then(res => res.data);

export const resolveReportByAdmin = (reportId, data) =>
  api.put(`/admin/reports/${reportId}/resolve`, data).then(res => res.data);

export const dismissReportByAdmin = (reportId) =>
  api.put(`/admin/reports/${reportId}/dismiss`, {}).then(res => res.data);

// ═══════════════════════════════════════════════════
//  ANALYTICS & LOGS
// ═══════════════════════════════════════════════════

export const getAdminAnalytics = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/analytics`, { params }).then(res => res.data);

export const getAdminActionLogs = (slug, params = {}) =>
  api.get(`/admin/community/${slug}/logs`, { params }).then(res => res.data);