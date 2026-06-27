'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoadmaps,
  getRoadmapById,
  addRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleRoadmapPublish,
  getMyAssignedRoadmaps,
  assignAdminToRoadmap,
  removeAdminFromRoadmap,
} from '../../services/admin/roadmap';

export const roadmapKeys = {
  all: () => ['roadmaps'],
  lists: (params) => [...roadmapKeys.all(), 'list', params],
  assigned: (params) => [...roadmapKeys.all(), 'assigned', params],
  detail: (id) => [...roadmapKeys.all(), 'detail', id],
};

export function useRoadmaps(params = {}) {
  return useQuery({
    queryKey: roadmapKeys.lists(params),
    queryFn: async () => {
      const response = await getRoadmaps(params);
      const rawData = response?.data ?? response ?? [];
      return {
        data: Array.isArray(rawData) ? rawData : [],
        pagination: response?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAssignedRoadmaps(params = {}) {
  return useQuery({
    queryKey: roadmapKeys.assigned(params),
    queryFn: async () => {
      const response = await getMyAssignedRoadmaps(params);
      const rawData = response?.data ?? response ?? [];
      return {
        data: Array.isArray(rawData) ? rawData : [],
        pagination: response?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRoadmapById(id) {
  return useQuery({
    queryKey: roadmapKeys.detail(id),
    queryFn: async () => {
      const response = await getRoadmapById(id);
      return response?.data ?? response ?? null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRoadmap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roadmapKeys.all() }),
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateRoadmap(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all() });
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roadmapKeys.all() }),
  });
}

export function useToggleRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleRoadmapPublish,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all() });
    },
  });
}

// ✅ Assign Admin
export function useAssignAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, adminId }) =>
      assignAdminToRoadmap(roadmapId, adminId),
    onSuccess: (_, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all() });
    },
  });
}

// ✅ Remove Admin
export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, adminId }) =>
      removeAdminFromRoadmap(roadmapId, adminId),
    onSuccess: (_, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all() });
    },
  });
}