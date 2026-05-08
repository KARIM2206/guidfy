import api from '../apiCommunity';

// ============================
// Community CRUD
// ============================

export const getAllCommunities = async (params = {}) => {
  const response = await api.get('/communities', { params });
  return response.data;
};

export const getCommunityBySlug = async (slug) => {
  const response = await api.get(`/communities/${slug}`);
  return response.data;
};

export const createCommunity = async (data) => {
  const response = await api.post('/communities', data);
  return response.data;
};

export const updateCommunity = async (slug, data) => {
  const response = await api.put(`/communities/${slug}`, data);
  return response.data;
};

export const deleteCommunity = async (slug) => {
  const response = await api.delete(`/communities/${slug}`);
  return response.data;
};

// ============================
// Community Members
// ============================

export const getCommunityMembers = async (slug, params = {}) => {
  const response = await api.get(`/communities/${slug}/members`, { params });
  return response.data;
};

export const joinCommunity = async (slug) => {
  const response = await api.post(`/communities/${slug}/join`);
  return response.data;
};

export const leaveCommunity = async (slug) => {
  const response = await api.post(`/communities/${slug}/leave`);
  return response.data;
};

export const removeMember = async (slug, userId) => {
  const response = await api.delete(`/communities/${slug}/members/${userId}`);
  return response.data;
};

// ============================
// Community Posts
// ============================

export const getCommunityPosts = async (slug, params = {}) => {
  const response = await api.get(`/communities/${slug}/posts`, { params });
  return response.data;
};

export const createPost = async (slug, data) => {
  const response = await api.post(`/communities/${slug}/posts`, data);
  return response.data;
};

export const deletePost = async (slug, postId) => {
  const response = await api.delete(`/communities/${slug}/posts/${postId}`);
  return response.data;
};

// ============================
// Community Questions
// ============================

export const getCommunityQuestions = async (slug, params = {}) => {
  const response = await api.get(`/communities/${slug}/questions`, { params });
  return response.data;
};

export const getCommunityQuestionById = async (questionId) => {
  const response = await api.get(`/communities/question/${questionId}`);
  return response.data;
};

export const createQuestion = async (slug, data) => {
  const response = await api.post(`/communities/${slug}/questions`, data);
  return response.data;
};

export const deleteQuestion = async (slug, questionId) => {
  const response = await api.delete(`/communities/${slug}/questions/${questionId}`);
  return response.data;
};

// ============================
// Answers
// ============================

export const getAnswers = async (slug, questionId, params = {}) => {
  const response = await api.get(`/communities/${slug}/questions/${questionId}/answers`, { params });
  return response.data;
};

export const createAnswer = async (slug, questionId, data) => {
  const response = await api.post(`/communities/${slug}/questions/${questionId}/answers`, data);
  return response.data;
};

export const deleteAnswer = async (slug, questionId, answerId) => {
  const response = await api.delete(`/communities/${slug}/questions/${questionId}/answers/${answerId}`);
  return response.data;
};

// ============================
// Votes & Views
// ============================

export const getVotes = async (targetId, targetType) => {
  const response = await api.get(`/communities/votes/target/${targetId}/type/${targetType}`);
  return response.data;
};

export const vote = async (data) => {
  const response = await api.post('/communities/vote', data);
  return response.data;
};

export const getView = async (targetId, targetType) => {
  const response = await api.get(`/communities/views/target/${targetId}/type/${targetType}`);
  return response.data;
};

export const incrementView = async (data) => {
  const response = await api.post('/communities/views', data);
  return response.data;
};

// ============================
// Global Feed
// ============================

export const getGlobalFeed = async (params = {}) => {
  const response = await api.get('/communities/feed', { params });
  return response.data;
};

// ============================
// Reports (if under /api/reports adjust accordingly)
// ============================

export const createReport = async (data) => {
  const response = await api.post('/reports', data);
  return response.data;
};

export const getCommunityReports = async (slug, params = {}) => {
  const response = await api.get(`/communities/${slug}/reports`, { params });
  return response.data;
};

export const resolveReport = async (reportId, data) => {
  const response = await api.put(`/reports/${reportId}/resolve`, data);
  return response.data;
};

// ============================
// Community Analytics
// ============================

export const getCommunityAnalytics = async (slug) => {
  const response = await api.get(`/communities/${slug}/analytics`);
  return response.data;
};