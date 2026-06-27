/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROADMAPS CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook manages all roadmap-related queries and mutations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

async function fetchRoadmaps(page = 1, limit = 10, filters = {}) {
  const response = await apiClient.get('/roadmaps', {
    params: { page, limit, ...filters },
  });
  return response.data;
}

async function fetchRoadmapById(id) {
  const response = await apiClient.get(`/roadmaps/${id}`);
  return response.data;
}

async function createRoadmap(data) {
  const response = await apiClient.post('/roadmaps', data);
  return response.data;
}

async function updateRoadmap(id, data) {
  const response = await apiClient.put(`/roadmaps/${id}`, data);
  return response.data;
}

async function deleteRoadmap(id) {
  const response = await apiClient.delete(`/roadmaps/${id}`);
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────

export function useRoadmapsQuery(page = 1, limit = 10, filters = {}) {
  return useQuery({
    queryKey: ['roadmaps', page, limit, filters],
    queryFn: () => fetchRoadmaps(page, limit, filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRoadmapById(id) {
  return useQuery({
    queryKey: ['roadmaps', id],
    queryFn: () => fetchRoadmapById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoadmap,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      return data;
    },
  });
}

export function useUpdateRoadmap(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateRoadmap(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmaps', id], data);
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      return data;
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}
