import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════════
//  ADMIN COMMUNITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Get admin's communities
export const getAdminCommunities = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_BASE}/admin/communities?${query}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get community by slug (admin view)
export const getAdminCommunityBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/community/${slug}`, {
      withCredentials: true,
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update community (admin only owned)
export const updateAdminCommunity = async (communityId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE}/admin/community/${communityId}`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  MEMBERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityMembers = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/members?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const banMember = async (communityId, userId, data = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE}/admin/community/${communityId}/members/${userId}/ban`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unbanMember = async (communityId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/admin/community/${communityId}/members/${userId}/unban`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeMember = async (communityId, userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/community/${communityId}/members/${userId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  POSTS MODERATION
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityPosts = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/posts?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAdminPost = async (communityId, postId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/community/${communityId}/posts/${postId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  QUESTIONS MODERATION
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityQuestions = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/questions?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAdminQuestion = async (communityId, questionId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/community/${communityId}/questions/${questionId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  REPORTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityReports = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/reports?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resolveAdminReport = async (reportId, action, data = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE}/admin/reports/${reportId}/resolve`,
      { action, ...data },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityAnalytics = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/analytics?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  ACTION LOGS
// ═══════════════════════════════════════════════════════════════

export const getAdminCommunityLogs = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/admin/community/${communityId}/logs?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
