// api/roadmapApi.js
import api from "../apiCommunity";

/* ===============================
   Add Roadmap
   Accepts: { title, description, category, level, estimatedDuration }
================================= */
export const addRoadmap = async (roadmapData) => {
  try {
    const response = await api.post("/roadmaps", roadmapData);
    return response.data;
  } catch (error) {
    console.error("Error adding roadmap:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/* ===============================
   Get All Roadmaps
   Supports: pagination, search, level, category
================================= */
export const getRoadmaps = async (params = {}) => {
  try {
    const response = await api.get("/roadmaps", { params });
    console.log("Fetched roadmaps:", response.data); // Debugging log
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmaps:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const getMyAssignedRoadmaps = async (params = {}) => {
  try {
    const response = await api.get("/roadmaps/my", { params });
    console.log("Fetched assigned roadmaps:", response.data); // Debugging log
    
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmaps:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/* ===============================
   Get Single Roadmap
   Includes steps, lessons, createdBy, enrolledUsers
================================= */
export const getRoadmapById = async (id) => {
  try {
    const response = await api.get(`/roadmaps/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmap:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/* ===============================
   Update Roadmap
   Accepts: { title, description, category, level, estimatedDuration }
   Automatically updates slug if title changes
================================= */
export const updateRoadmap = async (id, roadmapData) => {
  try {
    const response = await api.put(`/roadmaps/${id}`, roadmapData);
    return response.data;
  } catch (error) {
    console.error("Error updating roadmap:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/* ===============================
   Delete Roadmap
================================= */
export const deleteRoadmap = async (id) => {
  try {
    const response = await api.delete(`/roadmaps/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting roadmap:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
/* ===============================
   Publish / Unpublish Roadmap
================================= */
export const toggleRoadmapPublish = async (id) => {
  try {
    const response = await api.patch(`/roadmaps/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling roadmap publish status:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};



/* ===============================
   Assign Admin to Roadmap
================================= */
export const assignAdminToRoadmap = async (roadmapId, adminId) => {
  try {
    const response = await api.post(`/roadmaps/${roadmapId}/assign`, { adminId });
    return response.data;
  } catch (error) {
    console.error("Error assigning admin:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/* ===============================
   Remove Admin from Roadmap
================================= */
export const removeAdminFromRoadmap = async (roadmapId, adminId) => {
  try {
    const response = await api.delete(`/roadmaps/${roadmapId}/assign/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing admin:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
