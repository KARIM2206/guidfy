import api from "../api";

export const addJob = async (jobData) => {
    try {
        console.log("jobData", jobData);
        const response = await api.post("/jobs", jobData);
        return response.data;
    } catch (error) {
        console.error("Error adding job:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateJob = async (id, jobData) => {
    try {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
    } catch (error) {
        console.error("Error updating job:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
export const changeStatus = async (id, status) => {
    try {
        const response = await api.put(`/jobs/status/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Error changing job status:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteJob = async (id) => {
    try {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting job:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getJobs = async () => {
    try {
        const response = await api.get("/jobs");
        return response.data;
    } catch (error) {
        console.error("Error fetching jobs:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
export const getAllJobs = async () => {
    try {
        const response = await api.get("/jobs/all");
        return response.data;
    } catch (error) {
        console.error("Error fetching jobs:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
export const getAlljobsToStudentByLearningPathTitle = async (title) => {
    try {
        const response = await api.get(`/jobs/all/student/learning-path/${title}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching jobs:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getJobById = async (id) => {
    try {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching job:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};