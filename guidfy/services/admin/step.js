import api from "../api";

export const addStep = async (stepData) => {
  try {
    const response = await api.post("/steps", stepData);
    return response.data;
  } catch (error) {
    console.error("Error adding step:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const getStepsByRoadmap = async (roadmapId) => {
  try {
    const response = await api.get(`/steps/roadmap/${roadmapId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching steps:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const getStepById = async (id) => {
  try {
    const response = await api.get(`/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching step:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const updateStep = async (id, stepData) => {
  try {
    const response = await api.put(`/steps/${id}`, stepData);
    return response.data;
  } catch (error) {
    console.error("Error updating step:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const deleteStep = async (id) => {
  try {
    const response = await api.delete(`/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting step:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};