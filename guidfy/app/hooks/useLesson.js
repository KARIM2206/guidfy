'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLessonById,
  addLesson,
  getLessonsByStep,
  updateLesson,
  deleteLesson,
  reorderLesson,
} from '@/services/admin/lesson';
import { updateStudentLessonProgress } from '@/services/student/student'; // الخدمة من ملف الطالب

// ─── Query Keys Factory ───
export const lessonKeys = {
  all: () => ['lessons'],
  lists: () => ['lessons', 'list'],
  list: (stepId) => ['lessons', 'list', String(stepId)],
  detail: (id) => ['lessons', 'detail', String(id)],
};

// ─── useLessonsByStep ───
export function useLessonsByStep(stepId) {
  return useQuery({
    queryKey: lessonKeys.list(stepId),
    queryFn: async () => {
      const data = await getLessonsByStep(stepId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!stepId && stepId !== 'undefined',
    staleTime: 1000 * 60 * 5,
  });
}

// ─── useLessonById ───
export function useLessonById(id) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: async () => {
      const data = await getLessonById(id);
      return data?.data ?? data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

// ─── useCreateLesson ───
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, data }) => addLesson(stepId, data),
    onSuccess: (_, { stepId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(stepId) });
    },
  });
}

// ─── useUpdateLesson ───
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLesson(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

// ─── useDeleteLesson ───
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all() });
    },
  });
}

// ─── useReorderLesson ───
export function useReorderLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, newOrder }) => reorderLesson(lessonId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

// ✅ التصدير الجديد المطلوب
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, completed }) =>
      updateStudentLessonProgress({ lessonId, completed }),
    onSuccess: () => {
      // إنفاليديت أي كويريز متعلقة بتقدم المستخدم
      queryClient.invalidateQueries({ queryKey: ['user', 'stepProgress'] });
    },
  });
}