// api/learningPathApi.js
import api from "../apiSuperAdmin";

/* ===============================
   Add Learning Path
   Accepts: { 
     title, 
     description, 
     jobs, 
     projects, 
     estimatedDuration, 
     roadmapIds: [] 
   }
================================= */
export const addLearningPath = async (learningPathData) => {
  try {
    const config = learningPathData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post("/learning-paths", learningPathData, config);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Get All Learning Paths
   Supports: pagination, search, published
================================= */
export const getLearningPaths = async (params = {}) => {
  try {
    const response = await api.get("/learning-paths", { params });
  
    
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching learning paths:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Get All Learning Paths for Super Admin
   Supports: pagination, search
================================= */
export const getAllLearningPathsSA = async (params = {}) => {
  try {
    const response = await api.get("/learning-paths/all", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching learning paths for SA:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Get Single Learning Path
   Includes: roadmaps (ordered), createdBy, enrollments
================================= */
export const getLearningPathById = async (id) => {
  try {
    const response = await api.get(`/learning-paths/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
export const getLearningPathByTitle = async (title) => {
  try {
    const response = await api.get(`/learning-paths/title/${title}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Update Learning Path
   Accepts: { 
     title, 
     description, 
     jobs, 
     projects, 
     estimatedDuration, 
     roadmapIds: [] 
   }
================================= */
export const updateLearningPath = async (id, learningPathData) => {
  try {
    const config = learningPathData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.put(`/learning-paths/${id}`, learningPathData, config);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Delete Learning Path
================================= */
export const deleteLearningPath = async (id) => {
  try {
    const response = await api.delete(`/learning-paths/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/* ===============================
   Publish / Unpublish Learning Path
   (Toggle from backend)
================================= */
export const toggleLearningPathPublish = async (id) => {
  try {
    const response = await api.patch(`/learning-paths/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling learning path publish status:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
export const assignAdminsToLearningPath = async ({learningPathId, data}) => {
  console.log('learningPathId in assignAdminsToLearningPath', learningPathId, 'data', data);
  
  try {
    const response = await api.post(`/learning-paths/${learningPathId}/admins`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Error assigning admins to learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
}
// services/superAdmin/learningPath.js
export const getLearningPathsForAdmin = async (section = 'JOB') => {
  const res = await api.get(`/learning-paths/admin?section=${section}`);
  return res.data;
};

// ═══════════════════════════════════════════════════════
// FIX 1: services/superAdmin/learningPath.js
// المشكلة: apiClient interceptor بيرجع response.data مباشرة
// فـ response في الـ service = البيانات نفسها مش الـ axios response
// ═══════════════════════════════════════════════════════

export const recommendLearningPath = async (features) => {
  try {
    console.log('features in recommendLearningPath', features);
    // ✅ apiClient interceptor already returns response.data
    // so `data` here = { success, recommended_path, top_paths, ... }
    const data = await api.post(`/learning-paths/recommend`, features);
    return data; // ← return مباشرة بدون .data تاني
  } catch (error) {
    console.error(
      "Error recommending learning path:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getMyRecommendations = async () => {
  try {
    // ✅ نفس المشكلة — apiClient returns response.data directly
    const data = await api.get(`/learning-paths/my-recommendations`);
    return data; // data = { success, data: [...] } or { success, data: {...} }
  } catch (error) {
    console.error(
      "Error fetching my recommendations:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};