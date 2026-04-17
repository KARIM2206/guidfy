import api from "../api";

// ➕ Create Lesson داخل Step (dynamic: VIDEO, ARTICLE, QUIZ)
export const addLesson = async (stepId, lessonData) => {
  try {
    let data;
console.log(lessonData, 'lessonData in add lesson');

    // لو فيه فيديو أو FormData
    if (lessonData.videoFile) {
      data = new FormData();
      data.append("title", lessonData.title);
      if (lessonData.description) data.append("description", lessonData.description);
      data.append("type", lessonData.type);

      if (lessonData.content) data.append("content", lessonData.content); // ARTICLE
      data.append("video", lessonData.videoFile); // VIDEO
    } else {
      // JSON payload
      data = { ...lessonData };
    }

    const response = await api.post(`/lessons/step/${stepId}`, data, {
      headers: lessonData.videoFile
        ? { "Content-Type": "multipart/form-data" }
        : {},
    });

    return response.data;
  } catch (error) {
    console.error("Error adding lesson:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 📄 Get All Lessons By Step
export const getLessonsByStep = async (stepId) => {
  try {
    console.log('stepId in getLessonsByStep', stepId);
    
    const response = await api.get(`/lessons/step/${stepId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 🔍 Get Single Lesson
export const getLessonById = async (id) => {
  try {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ✏️ Update Lesson (dynamic + optional video)
export const updateLesson = async (id, lessonData) => {
  try {
    let data;

    if (lessonData.videoFile) {
      data = new FormData();
      if (lessonData.title) data.append("title", lessonData.title);
      if (lessonData.description) data.append("description", lessonData.description);
      if (lessonData.type) data.append("type", lessonData.type);
      if (lessonData.content) data.append("content", lessonData.content); // ARTICLE
      data.append("video", lessonData.videoFile); // VIDEO
    } else {
      data = { ...lessonData };
    }

    const response = await api.put(`/lessons/${id}`, data, {
      headers: lessonData.videoFile
        ? { "Content-Type": "multipart/form-data" }
        : {},
    });

    return response.data;
  } catch (error) {
    console.error("Error updating lesson:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ❌ Delete Lesson
export const deleteLesson = async (id) => {
  try {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lesson:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 🔄 Reorder Lessons (Drag & Drop)
export const reorderLesson = async (lessonId, newOrder) => {
  try {
    const response = await api.put(`/lessons/reorder`, {
      lessonId,
      newOrder,
    });
    return response.data;
  } catch (error) {
    console.error("Error reordering lesson:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};