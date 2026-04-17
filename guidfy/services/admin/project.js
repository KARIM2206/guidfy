import api from "../api";

export const addProject = async (projectData) => {
  try {
    const formData = new FormData();

    formData.append("title", projectData.title);
    formData.append("description", projectData.description);
    formData.append("image", projectData.image);
    formData.append("learningPathId", projectData.learningPathId);
    formData.append("githubUrl", projectData.githubUrl);
    formData.append("isFeatured", projectData.isFeatured);
    formData.append("technologies", projectData.technologies);

    const response = await api.post("/projects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding project:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const formData = new FormData();

    formData.append("title", projectData.title);
    formData.append("description", projectData.description);

    if (projectData.image) {
      formData.append("image", projectData.image);
    }

    formData.append("learningPathId", projectData.learningPathId);
    formData.append("githubUrl", projectData.githubUrl);
    formData.append("isFeatured", projectData.isFeatured);
    formData.append("technologies", projectData.technologies);

    const response = await api.put(`/projects/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating project:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
// 🟡 assign Admins Project
export const assignAdminsToProject = async (id, adminIds) => {
  try {
    const response = await api.post(`/projects/learning-paths/${id}/assign`, {adminIds});
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const getProjectsForAdmin = async () => {
  try {
    const response = await api.get(`/learning-paths/admin`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching learning paths for admin:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
// ⚡ Change Project Status (Super Admin only)
export const changeProjectStatus = async (id, status) => {
  try {
    const response = await api.put(`/projects/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error changing project status:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 🔴 Delete Project
export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 📦 Get all Projects created by Admin
export const getProjects = async () => {
  try {
    const response = await api.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 📃 Get all Projects (Super Admin)
export const getAllProjects = async (title) => {
  try {
    const response = await api.get(`/projects/all?title=${title}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all projects:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// 📃 Get Project by ID
export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};