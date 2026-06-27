'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentRoadmaps,
  updateStudentLessonProgress,
  enrollStudentInLearningPath,
} from '@/services/student/student';

export const studentKeys = {
  all:      () => ['student'],
  roadmaps: (title) => ['student', 'roadmaps', title],
};

// ─────────────────────────────────────────────────────────────────────────
// useStudentRoadmaps — مع Logging
// ─────────────────────────────────────────────────────────────────────────
export function useStudentRoadmaps(title) {
  return useQuery({
    queryKey: studentKeys.roadmaps(title),
    queryFn: async () => {
      console.log('[useStudentRoadmaps] Fetching...');
      const res = await getStudentRoadmaps(title);
      const data = res?.data ?? res;
      
      // ✅ Log الـ Progress الأول Lesson
      const firstRoadmap = data?.roadmaps?.[0];
      const firstStep = firstRoadmap?.roadmap?.steps?.[0];
      const firstLesson = firstStep?.lessons?.[0];
      console.log('[useStudentRoadmaps] First Lesson:', {
        id: firstLesson?.id,
        completed: firstLesson?.completed,
        progress: firstLesson?.progress,
      });
      
      return data;
    },
    enabled: !!title,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useUpdateLessonProgress — مع Logging و Refetch قوي
// ─────────────────────────────────────────────────────────────────────────
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, completed }) => {
      console.log('[useUpdateLessonProgress] Sending:', { lessonId, completed });
      const res = await updateStudentLessonProgress({ lessonId, completed });
      console.log('[useUpdateLessonProgress] API Response:', res);
      return res;
    },
    onSuccess: async (data) => {
      console.log('[useUpdateLessonProgress] Success, invalidating...');
      
      // ✅ Invalidate كل الـ queries
      await queryClient.invalidateQueries({ queryKey: studentKeys.all() });
      
      // ✅ امسح الـ Cache القديم
      queryClient.removeQueries({ queryKey: studentKeys.all(), type: 'inactive' });
      
      // ✅ انتظر شوية عشان الـ DB تكتب
      await new Promise(r => setTimeout(r, 300));
      
      // ✅ Refetch Active queries
      await queryClient.refetchQueries({
        queryKey: studentKeys.all(),
        type: 'active',
        exact: false,
      });
      
      console.log('[useUpdateLessonProgress] Refetch done');
    },
    onError: (error) => {
      console.error('[useUpdateLessonProgress] Error:', error);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useEnrollStudent
// ─────────────────────────────────────────────────────────────────────────
export function useEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollStudentInLearningPath,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.all() });
      await queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
  });
}