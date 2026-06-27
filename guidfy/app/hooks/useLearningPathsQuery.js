'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

// ✅ FIX: كل الـ endpoints محتاجة /super-admin prefix
async function fetchLearningPaths(page = 1, limit = 10, filters = {}) {
  const response = await apiClient.get('/super-admin/learning-paths', {
    params: { page, limit, ...filters },
  });
  // ✅ apiClient interceptor بيرجع response.data مباشرة
  // فالـ response هنا = { success, data: [...], pagination: {...} }
  return response;
}

async function fetchLearningPathById(id) {
  const response = await apiClient.get(`/super-admin/learning-paths/${id}`);
  return response;
}

async function createLearningPath(data) {
  const response = await apiClient.post('/super-admin/learning-paths', data);
  return response;
}

async function updateLearningPath(id, data) {
  const response = await apiClient.put(`/super-admin/learning-paths/${id}`, data);
  return response;
}

async function deleteLearningPath(id) {
  const response = await apiClient.delete(`/super-admin/learning-paths/${id}`);
  return response;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────

export function useLearningPathsQuery(page = 1, limit = 10, filters = {}, options = {}) {
  return useQuery({
    queryKey: ['learning-paths', page, limit, filters],
    queryFn: () => fetchLearningPaths(page, limit, filters),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useLearningPathById(id) {
  return useQuery({
    queryKey: ['learning-paths', id],
    queryFn: () => fetchLearningPathById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: (error) => {
      console.error('Failed to create learning path:', error);
    },
  });
}

export function useUpdateLearningPath(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateLearningPath(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['learning-paths', id], data);
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: (error) => {
      console.error('Failed to update learning path:', error);
    },
  });
}

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: (error) => {
      console.error('Failed to delete learning path:', error);
    },
  });
}