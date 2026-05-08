import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════════
//  SUPER ADMIN COMMUNITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Get all communities (super admin only)
export const getAllCommunitiesSA = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_BASE}/super-admin/communities?${query}`, {
      withCredentials: true,
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get community details (super admin)
export const getCommunityDetailsSA = async (communityId) => {
  try {
    const response = await axios.get(`${API_BASE}/super-admin/community/${communityId}`, {
      withCredentials: true,
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  COMMUNITY LIFECYCLE
// ═══════════════════════════════════════════════════════════════

export const suspendCommunity = async (communityId, reason = '') => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/suspend`,
      { reason },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const activateCommunity = async (communityId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/activate`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCommunitySA = async (communityId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/super-admin/community/${communityId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  COMMUNITY ADMINS
// ═══════════════════════════════════════════════════════════════

export const assignAdminToCommunity = async (communityId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/assign-admin`,
      { userId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeAdminFromCommunity = async (communityId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/remove-admin`,
      { userId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCommunityAdminsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/admins?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  MEMBERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getCommunityMembersSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/members?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const banMemberSA = async (communityId, userId, reason = '') => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/members/${userId}/ban`,
      { reason },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unbanMemberSA = async (communityId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/community/${communityId}/members/${userId}/unban`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  CONTENT MODERATION
// ═══════════════════════════════════════════════════════════════

export const getCommunityPostsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/posts?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePostSA = async (communityId, postId, reason = '') => {
  try {
    const response = await axios.delete(
      `${API_BASE}/super-admin/community/${communityId}/posts/${postId}`,
      {
        data: { reason },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCommunityQuestionsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/questions?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteQuestionSA = async (communityId, questionId, reason = '') => {
  try {
    const response = await axios.delete(
      `${API_BASE}/super-admin/community/${communityId}/questions/${questionId}`,
      {
        data: { reason },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════════════════

export const getCommunityReportsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/reports?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resolveReportSA = async (reportId, action, data = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE}/super-admin/reports/${reportId}/resolve`,
      { action, ...data },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS & INSIGHTS
// ═══════════════════════════════════════════════════════════════

export const getCommunityAnalyticsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/analytics?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCommunitiesAnalyticsSA = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_BASE}/super-admin/communities/analytics?${query}`, {
      withCredentials: true,
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ═══════════════════════════════════════════════════════════════
//  ACTION LOGS
// ═══════════════════════════════════════════════════════════════

export const getCommunityLogsSA = async (communityId, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE}/super-admin/community/${communityId}/logs?${query}`,
      { withCredentials: true }
    );
    return response.data?.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
