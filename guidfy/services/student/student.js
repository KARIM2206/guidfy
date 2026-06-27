import api from "../apiStudent";

export const getStudentRoadmaps = async (title) => {
  try {
    const response = await api.get(`/roadmaps/title/${title}`);
    return response.data;
  } catch (error) {
    console.error('Get student roadmaps error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get student roadmaps failed');
  }
};

export const getStudentRoadmapStepsByRoadmapId = async (id) => {
  try {
    const response = await api.get(`/steps/roadmap/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get student steps error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get student steps failed');
  }
};

export const getStudentLessonsByStepId = async (id) => {
  try {
    const response = await api.get(`/lessons/step/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get student lessons error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get student lessons failed');
  }
};

export const updateStudentLessonProgress = async ({ lessonId, completed }) => {
  try {
    const response = await api.put(`/lessons/progress`, { lessonId, completed });
    return response.data;
  } catch (error) {
    console.error('Update lesson progress error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Update lesson progress failed');
  }
};

export const updateStudentStepProgress = async ({ stepId, completed }) => {
  try {
    const response = await api.put(`/steps/progress`, { stepId, completed });
    return response.data;
  } catch (error) {
    console.error('Update step progress error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Update step progress failed');
  }
};

export const enrollStudentInLearningPath = async ({ learningPathId }) => {
  try {
    const response = await api.post(`/enroll`, { learningPathId });
    return response.data;
  } catch (error) {
    console.error('Enroll error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Enrollment failed');
  }
};

export const getStudentStepProgress = async (id) => {
  try {
    const response = await api.get(`/steps/${id}/progress`);
    return response.data;
  } catch (error) {
    console.error('Get step progress error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get step progress failed');
  }
};

export const getStudentRoadmapProgress = async (id) => {
  try {
    const response = await api.get(`/roadmaps/${id}/progress`);
    return response.data;
  } catch (error) {
    console.error('Get roadmap progress error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get roadmap progress failed');
  }
};

export const getStudentContent = async (targetType, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/user-content?targetType=${targetType}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get student content error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get student content failed');
  }
};