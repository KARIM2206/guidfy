'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addStep,
  getStepsByRoadmap,
  getStepById,
  updateStep,
  deleteStep,
} from '@/services/admin/step';

export const stepKeys = {
  all: () => ['steps'],
  lists: () => ['steps', 'list'],
  list: (roadmapId) => ['steps', 'list', roadmapId],
  detail: (id) => ['steps', 'detail', id],
};

export function useStepsByRoadmap(roadmapId) {
  return useQuery({
    queryKey: stepKeys.list(roadmapId),
    queryFn: async () => {
      const response = await getStepsByRoadmap(roadmapId);
      return response?.data ?? response ?? [];
    },
    enabled: !!roadmapId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStepById(id) {
  return useQuery({
    queryKey: stepKeys.detail(id),
    queryFn: async () => {
      const data = await getStepById(id);
      return data?.data ?? data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStep,

    onSuccess: (newStep, variables) => {
      const roadmapId = variables?.roadmapId;

      queryClient.setQueryData(
        stepKeys.list(roadmapId),
        (old = []) => {
          return [...old, newStep];
        }
      );
    },
  });
}

export function useUpdateStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStep(id, data),
    onSuccess: (data, variables) => {
      // ✅ Invalidate specific step detail
      queryClient.invalidateQueries({ 
        queryKey: stepKeys.detail(variables.id) 
      });
      // ✅ Invalidate the roadmap's steps list
      const roadmapId = variables?.data?.roadmapId;
      if (roadmapId) {
        queryClient.invalidateQueries({ 
          queryKey: stepKeys.list(roadmapId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
    },
  });
}

export function useDeleteStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => deleteStep(id), // ✅ استقبل object وابعت id للـ API
    onSuccess: (data, variables) => {
      // ✅ Invalidate the specific roadmap's steps list
      const roadmapId = variables?.roadmapId;
      if (roadmapId) {
        queryClient.invalidateQueries({ 
          queryKey: stepKeys.list(roadmapId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
    },
  });
}