'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllJobs,
  getAllJobsAdmin,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  changeJobStatus,
  getImportedJobs,
  approveImportedJob,
  rejectImportedJob,
  approveAllImported,
  removeDuplicateJobs,
  getScraperStatus,
  startScraper,
  stopScraper,
  getScraperLogs,
  getScraperHistory,
  getJobsStats,
  fetchJobsFromN8N,
  getRecommendedJobs,
  getJobsByLearningPath,
  getSavedJobs,
  toggleSavedJob,
} from '@/services/admin/jobs';

/* ================================
   🔥 SINGLE SOURCE OF TRUTH KEYS
================================ */
export const jobKeys = {
  all: ['jobs'],

  lists: (params) => ['jobs', 'list', params],
  adminList: (params) => ['jobs', 'admin', params],
  detail: (id) => ['jobs', 'detail', id],

  imported: ['jobs', 'imported'],

  scraper: {
    status: ['scraper', 'status'],
    logs: ['scraper', 'logs'],
    history: ['scraper', 'history'],
  },

  stats: ['jobs', 'stats'],
  n8n: ['jobs', 'n8n'],

  recommended: (params) => ['jobs', 'recommended', params],

  learningPath: (id, params) => ['jobs', 'learning-path', id, params],
  saved: ['jobs', 'saved'],
};

/* ================================
   LIST QUERIES
================================ */

export function useJobsList(params = {}) {
  return useQuery({
    queryKey: jobKeys.lists(params),
    queryFn: () => getAllJobs(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

export function useAllJobsAdmin(params = {}) {
  return useQuery({
    queryKey: jobKeys.adminList(params),
    queryFn: () => getAllJobsAdmin(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

export function useJobDetail(id) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJobById(id),
    enabled: !!id,
  });
}

export function useImportedJobs(params = {}) {
  return useQuery({
    queryKey: jobKeys.imported,
    queryFn: () => getImportedJobs(params),
    staleTime: 1000 * 30,
  });
}

export function useScraperStatus() {
  return useQuery({
    queryKey: jobKeys.scraper.status,
    queryFn: getScraperStatus,
    refetchInterval: 5000,
  });
}

export function useScraperLogs(params = {}) {
  return useQuery({
    queryKey: jobKeys.scraper.logs,
    queryFn: () => getScraperLogs(params),
    refetchInterval: 3000,
  });
}

export function useScraperHistory(params = {}) {
  return useQuery({
    queryKey: jobKeys.scraper.history,
    queryFn: () => getScraperHistory(params),
  });
}

export function useJobsStats() {
  return useQuery({
    queryKey: jobKeys.stats,
    queryFn: getJobsStats,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendedJobs(params = {}) {
  return useQuery({
    queryKey: jobKeys.recommended(params),
    queryFn: () => getRecommendedJobs(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useJobsByLearningPath(learningPathId, params = {}) {
  return useQuery({
    queryKey: jobKeys.learningPath(learningPathId, params),
    queryFn: () => getJobsByLearningPath(learningPathId, params),
    enabled: !!learningPathId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSavedJobs() {
  return useQuery({
    queryKey: jobKeys.saved,
    queryFn: async () => {
      const res = await getSavedJobs();
      return res?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/* ================================
   MUTATIONS (🔥 FIXED INVALIDATION)
================================ */

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
    },
  });
}

/* ================================
   🔥 STATUS CHANGE (OPTIMISTIC FIXED)
================================ */

export function useChangeJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => changeJobStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: jobKeys.all });

      const previousData = queryClient.getQueriesData({
        queryKey: jobKeys.all,
      });

      queryClient.setQueriesData({ queryKey: jobKeys.all }, (old) => {
        if (!old || !old.data) return old;

        // 1. If old.data is directly an array (e.g., standard list)
        if (Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((job) =>
              job.id === id ? { ...job, status } : job
            ),
          };
        }

        // 2. If old.data is a paginated object containing a data array
        if (old.data.data && Array.isArray(old.data.data)) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((job) =>
                job.id === id ? { ...job, status } : job
              ),
            },
          };
        }

        // 3. For any other object (stats, scraper status, single job), return unchanged
        return old;
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (!context?.previousData) return;

      context.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

/* ================================
   IMPORT / BULK ACTIONS
================================ */

export function useApproveImportedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveImportedJob,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
    },
  });
}

export function useRejectImportedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => rejectImportedJob(id, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported });
    },
  });
}

export function useApproveAllImported() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveAllImported,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
    },
  });
}

export function useRemoveDuplicates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeDuplicateJobs,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
    },
  });
}

/* ================================
   SCRAPER
================================ */

export function useStartScraper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startScraper,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.status });
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.history });
    },
  });
}

export function useStopScraper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopScraper,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.status });
    },
  });
}

/* ================================
   N8N
================================ */

export function useFetchFromN8N() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetchJobsFromN8N,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useToggleSavedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSavedJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.saved });
      // Optionally invalidate learningPath jobs to reflect correct bookmark state
      // queryClient.invalidateQueries({ queryKey: jobKeys.learningPath }); 
    },
  });
}