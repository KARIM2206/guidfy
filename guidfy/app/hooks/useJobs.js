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
  getJobsByLearningPath,
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
  getAdminLearningPaths,
} from '@/services/admin/jobs';

export const jobKeys = {
  all: () => ['jobs'],
  lists: () => ['jobs', 'list'],
  list: (params) => ['jobs', 'list', params],
  adminList: (params) => ['jobs', 'admin-list', params],
  detail: (id) => ['jobs', 'detail', id],
  imported: () => ['jobs', 'imported'],
  scraper: {
    status: () => ['scraper', 'status'],
    logs: () => ['scraper', 'logs'],
    history: () => ['scraper', 'history'],
  },
  stats: () => ['jobs', 'stats'],
  n8n: () => ['jobs', 'n8n'],
  recommended: (params) => ['jobs', 'recommended', params],
  learningPath: (id) => ['jobs', 'learning-path', id],
};

export function useJobsList(params = {}) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => getAllJobs(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useAllJobsAdmin(params = {}) {
  return useQuery({
    queryKey: jobKeys.adminList(params),
    queryFn: () => getAllJobsAdmin(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useJobDetail(id) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJobById(id),
    enabled: !!id,
  });
}

export function useJobsByLearningPath(learningPathId) {
  return useQuery({
    queryKey: jobKeys.learningPath(learningPathId),
    queryFn: () => getJobsByLearningPath(learningPathId),
    enabled: !!learningPathId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useImportedJobs(params = {}) {
  return useQuery({
    queryKey: jobKeys.imported(),
    queryFn: () => getImportedJobs(params),
    staleTime: 1000 * 30,
  });
}

export function useScraperStatus() {
  return useQuery({
    queryKey: jobKeys.scraper.status(),
    queryFn: getScraperStatus,
    refetchInterval: 5000,
  });
}

export function useScraperLogs(params = {}) {
  return useQuery({
    queryKey: jobKeys.scraper.logs(),
    queryFn: () => getScraperLogs(params),
    refetchInterval: 3000,
  });
}

export function useScraperHistory(params = {}) {
  return useQuery({
    queryKey: jobKeys.scraper.history(),
    queryFn: () => getScraperHistory(params),
  });
}

export function useJobsStats() {
  return useQuery({
    queryKey: jobKeys.stats(),
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

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useChangeJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => changeJobStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.imported() });
    },
  });
}

export function useApproveImportedJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveImportedJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported() });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useRejectImportedJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectImportedJob(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported() });
    },
  });
}

export function useApproveAllImported() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAllImported,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported() });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useRemoveDuplicates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeDuplicateJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useStartScraper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startScraper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.status() });
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.history() });
    },
  });
}

export function useStopScraper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stopScraper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.scraper.status() });
    },
  });
}

export function useFetchFromN8N() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fetchJobsFromN8N,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.imported() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

// hooks/useJobsQueries.js — أضف الـ hooks دي

