import adminApi from '../api';

// ═══════════════════════════════════════════════════
//  JOBS CRUD
// ═══════════════════════════════════════════════════

export const getAllJobs = (params = {}) =>
  adminApi.get('/jobs', { params });

export const getAllJobsAdmin = (params = {}) =>
  adminApi.get('/jobs/all', { params });

export const getJobById = (id) =>
  adminApi.get(`/jobs/${id}`);

export const createJob = (data) =>
  adminApi.post('/jobs', data);

export const updateJob = (id, data) =>
  adminApi.put(`/jobs/${id}`, data);

export const deleteJob = (id) =>
  adminApi.delete(`/jobs/${id}`);

export const changeJobStatus = (id, status) =>
  adminApi.patch(`/jobs/${id}/status`, { status });

// ═══════════════════════════════════════════════════
//  STUDENT / PUBLIC
// ═══════════════════════════════════════════════════

;

export const getAdminJobsByLearningPath = (learningPathId, params = {}) =>
  adminApi.get(`/jobs/learning-path/${learningPathId}/jobs`, { params });

// ═══════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════

export const getJobsStats = () =>
  adminApi.get('/jobs/stats');

// ═══════════════════════════════════════════════════
//  IMPORTED JOBS
// ═══════════════════════════════════════════════════

export const getImportedJobs = (params = {}) =>
  adminApi.get('/jobs/imported', { params });

export const approveImportedJob = (id) =>
  adminApi.post(`/jobs/imported/${id}/approve`);

export const rejectImportedJob = (id, reason) =>
  adminApi.post(`/jobs/imported/${id}/reject`, { reason });

export const approveAllImported = () =>
  adminApi.post('/jobs/imported/approve-all');

export const removeDuplicateJobs = () =>
  adminApi.post('/jobs/remove-duplicates');

// ═══════════════════════════════════════════════════
//  SCRAPER
// ═══════════════════════════════════════════════════

export const getScraperStatus = () =>
  adminApi.get('/jobs/scraper/status');

export const startScraper = (config = {}) =>
  adminApi.post('/jobs/scraper/start', config);

export const stopScraper = () =>
  adminApi.post('/jobs/scraper/stop');

export const getScraperLogs = (params = {}) =>
  adminApi.get('/jobs/scraper/logs', { params });

export const getScraperHistory = (params = {}) =>
  adminApi.get('/jobs/scraper/history', { params });

// ═══════════════════════════════════════════════════
//  EXTERNAL / N8N  ← هنا كان ناقص
// ═══════════════════════════════════════════════════

export const fetchJobsFromN8N = (params) =>
  adminApi.get('/jobs/fetch-from-n8n', { params });

// ═══════════════════════════════════════════════════
//  AI RECOMMENDATIONS
// ═══════════════════════════════════════════════════

export const getRecommendedJobs = (params = {}) =>
  adminApi.get('/jobs/recommended', { params });

// services/admin/jobs.js — أضف الـ functions دي

export const getJobsByLearningPath = async (learningPathId, params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const res = await adminApi.get(
    `/jobs/admin/learning-path/${learningPathId}?${query.toString()}`
  );
  return res;
};

// ═══════════════════════════════════════════════════
//  SAVED JOBS (STUDENT)
// ═══════════════════════════════════════════════════

export const getSavedJobs = () => adminApi.get('/jobs/saved');
export const toggleSavedJob = (jobId) => adminApi.post(`/jobs/${jobId}/save`);
