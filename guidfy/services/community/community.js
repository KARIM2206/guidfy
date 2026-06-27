import apiClient from '@/lib/apiClient';

// NOTE: apiClient interceptor already returns response.data directly.
// So `response` here IS the data — no need for `.data` unwrapping.
const api = {
  get:    (url, config)        => apiClient.get(url, config),
  post:   (url, data, config)  => apiClient.post(url, data, config),
  put:    (url, data, config)  => apiClient.put(url, data, config),
  delete: (url, config)        => apiClient.delete(url, config),
  patch:  (url, data, config)  => apiClient.patch(url, data, config),
};

// ============================
// Community CRUD
// ============================

export const getAllCommunities = async (params = {}) => {
  const response = await api.get('/communities', { params });
  return response; // interceptor already unwrapped .data
};

export const getCommunityBySlug = async (slug) => {
  const response = await api.get(`/communities/${slug}`);
  return response;
};

export const createCommunity = async (data) => {
  const response = await api.post('/communities', data);
  return response;
};

export const updateCommunity = async (communityId, data) => {
  const response = await api.put(`/communities/${communityId}`, data);
  return response;
};

export const deleteCommunity = async (communityId) => {
  const response = await api.delete(`/communities/${communityId}`);
  return response;
};

// ============================
// Community Members
// ============================

export const getCommunityMembers = async (communityId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/members`, { params });
  return response;
};

export const joinCommunity = async (communityId) => {
  const response = await api.post(`/communities/${communityId}/join`);
  return response;
};

export const leaveCommunity = async (communityId) => {
  const response = await api.post(`/communities/${communityId}/leave`);
  return response;
};

export const removeMember = async (communityId, userId) => {
  const response = await api.delete(`/communities/${communityId}/members/${userId}`);
  return response;
};

// ============================
// Community Posts
// ============================

export const getCommunityPosts = async (communityId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/posts`, { params });
  return response;
};

export const createPost = async (communityId, data) => {
  const response = await api.post(`/communities/${communityId}/posts`, data);
  return response;
};

export const deletePost = async (communityId, postId) => {
  const response = await api.delete(`/communities/${communityId}/posts/${postId}`);
  return response;
};

export const updatePost = async (communityId, postId, data) => {
  const response = await api.put(`/communities/${communityId}/posts/${postId}`, data);
  return response;
};

// ============================
// Posts Detailed (Single post & comments)
// ============================

export const getPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response;
};

export const getPostComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response;
};

export const createPostComment = async (postId, data) => {
  const response = await api.post(`/posts/${postId}/comments`, data);
  return response;
};

export const deletePostComment = async (postId, commentId) => {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response;
};


// ============================
// Community Questions
// ============================

export const getCommunityQuestions = async (communityId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/questions`, { params });
  return response;
};

export const getCommunityQuestionById = async (questionId) => {
  const response = await api.get(`/communities/question/${questionId}`);
  return response;
};

export const createQuestion = async (communityId, data) => {
  const response = await api.post(`/communities/${communityId}/questions`, data);
  return response;
};

export const addAnswer = async (communityId, questionId, data) => {
  const response = await api.post(`/communities/${communityId}/questions/${questionId}/answers`, data);
  return response;
};

export const deleteQuestion = async (communityId, questionId) => {
  const response = await api.delete(`/communities/${communityId}/questions/${questionId}`);
  return response;
};

export const updateQuestion = async (communityId, questionId, data) => {
  const response = await api.put(`/communities/${communityId}/questions/${questionId}`, data);
  return response;
};

// ============================
// Answers
// ============================

export const getAnswers = async (communityId, questionId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/questions/${questionId}/answers`, { params });
  return response;
};

export const createAnswer = async (communityId, questionId, data) => {
  const response = await api.post(`/communities/${communityId}/questions/${questionId}/answers`, data);
  return response;
};

export const editAnswer = async (communityId, questionId, answerId, data) => {
  const response = await api.put(`/communities/${communityId}/questions/${questionId}/answers/${answerId}`, data);
  return response;
};

export const deleteAnswer = async (communityId, questionId, answerId) => {
  const response = await api.delete(`/communities/${communityId}/questions/${questionId}/answers/${answerId}`);
  return response;
};

// ============================
// Votes & Views
// ============================

export const getVotes = async (targetId, targetType) => {
  const response = await api.get(`/communities/votes/target/${targetId}/type/${targetType}`);
  return response;
};

export const vote = async (data) => {
  const response = await api.post('/communities/vote', data);
  return response;
};

export const getView = async (targetId, targetType) => {
  const response = await api.get(`/communities/views/target/${targetId}/type/${targetType}`);
  return response;
};

export const incrementView = async (data) => {
  const response = await api.post('/communities/views', data);
  return response;
};

// ============================
// Global Feed
// ============================

export const getGlobalFeed = async (params = {}) => {
  const response = await api.get('/communities/feed', { params });
  return response;
};

export const getPopularTags = async () => {
  const response = await api.get('/communities/tags/popular');
  return response;
};

// ============================
// Reports
// ============================

export const createReport = async (data) => {
  const response = await api.post('/reports', data);
  return response;
};

export const getCommunityReports = async (communityId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/reports`, { params });
  return response;
};

export const resolveReport = async (reportId, data) => {
  const response = await api.put(`/reports/${reportId}/resolve`, data);
  return response;
};

// ============================
// Community Analytics
// ============================

export const getCommunityAnalytics = async (communityId) => {
  const response = await api.get(`/communities/${communityId}/analytics`);
  return response;
};