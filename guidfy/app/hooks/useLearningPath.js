'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLearningPaths,
  getLearningPathById,
  addLearningPath,
  updateLearningPath,
  deleteLearningPath,
  toggleLearningPathPublish,
  getLearningPathByTitle,
  assignAdminsToLearningPath,
  getLearningPathsForAdmin,
  recommendLearningPath,
  getMyRecommendations,
  getAllLearningPathsSA,
} from '../../services/superAdmin/learningPath';
import { enrollStudentInLearningPath } from '@/services/student/student';

// ─────────────────────────────────────────────────────────────────────────
// Query Keys Factory
// ─────────────────────────────────────────────────────────────────────────
export const learningPathKeys = {
  all:             () => ['learning-paths'],
  lists:           () => ['learning-paths', 'list'],
  list:            (params) => ['learning-paths', 'list', params],
  saList:          (params) => ['learning-paths', 'sa-list', params],
  detail:          (id) => ['learning-paths', 'detail', id],
  byTitle:         (title) => ['learning-paths', 'title', title],
  adminPaths:      (section) => ['learning-paths', 'admin', section],
  recommendations: () => ['learning-paths', 'my-recommendations'],
};


// ─────────────────────────────────────────────────────────────────────────
// Helper: normalizeRec
// ─────────────────────────────────────────────────────────────────────────
export function normalizeRec(raw) {
  if (!raw) return null;
  return {
    recommendedPath: raw.recommended_path ?? raw.recommendedPath ?? '',
    topPaths:        raw.top_paths        ?? raw.topPaths        ?? [],
    matchedPath:     raw.matched_path     ?? raw.matchedPath     ?? null,
    learningPath:    raw.learningPath     ?? raw.learning_path   ?? raw.matchedPath ?? null,
    experience:      raw.experience       ?? '',
    skills:          raw.skills           ?? [],
    interest:        raw.interest         ?? '',
    hoursPerDay:     raw.hoursPerDay      ?? raw.hours_per_day   ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// useLearningPaths — list with pagination + search
// ─────────────────────────────────────────────────────────────────────────
export function useLearningPaths(params = {}) {
  return useQuery({
    queryKey: learningPathKeys.list(params),
    queryFn: async () => {
      // apiClient interceptor returns response.data directly
      // so `data` = { success, data: [...], pagination: {...} }
      const data = await getLearningPaths(params);
      return {
        data: data.data ?? data,
        pagination: data.pagination ?? {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useLearningPathsSA — for Super Admin (all paths)
// ─────────────────────────────────────────────────────────────────────────
export function useLearningPathsSA(params = {}) {
  return useQuery({
    queryKey: learningPathKeys.saList(params),
    queryFn: async () => {
      const data = await getAllLearningPathsSA(params);
      return {
        data: data.data ?? data,
      };
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useLearningPathById
// ─────────────────────────────────────────────────────────────────────────
export function useLearningPathById(id) {
  return useQuery({
    queryKey: learningPathKeys.detail(id),
    queryFn: async () => {
      const data = await getLearningPathById(id);
      return data?.data ?? data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useLearningPathByTitle
// ─────────────────────────────────────────────────────────────────────────
export function useLearningPathByTitle(title) {
  return useQuery({
    queryKey: learningPathKeys.byTitle(title),
    queryFn: async () => {
      const data = await getLearningPathByTitle(title);
      return data?.data ?? data;
    },
    enabled: !!title,
    staleTime: 1000 * 60 * 10,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useMyRecommendation
// ─────────────────────────────────────────────────────────────────────────
export function useMyRecommendation() {
  return useQuery({
    queryKey: learningPathKeys.recommendations(),
    queryFn: async () => {
      const res = await getMyRecommendations();
 
      // res = { success, data: { ...recommendation, learningPath: {...} | null } }
      const raw = Array.isArray(res?.data) ? res.data[0] : res?.data;
      if (!raw?.recommended_path && !raw?.recommendedPath) return null;
 
      const normalized = normalizeRec(raw);
 
      // ✅ الـ backend بيرجع learningPath مباشرة في الـ recommendation object
      // لو موجودة نحطها في matchedPath عشان باقي الكود يشتغل صح
      if (raw.learningPath && !normalized.matchedPath) {
        normalized.matchedPath  = raw.learningPath;
        normalized.learningPath = raw.learningPath;
      }
 
      return normalized;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
 

// ─────────────────────────────────────────────────────────────────────────
// useAdminLearningPaths
// ─────────────────────────────────────────────────────────────────────────
// export function useAdminLearningPaths(section) {
//   return useQuery({
//     queryKey: learningPathKeys.adminPaths(section),
//     queryFn: async () => {
//       const data = await getLearningPathsForAdmin(section);
//       return data?.data ?? [];
//     },
//     enabled: !!section,
//     staleTime: 1000 * 60 * 5,
//   });
// }

// ─────────────────────────────────────────────────────────────────────────
// useCreateLearningPath
// ─────────────────────────────────────────────────────────────────────────
export function useCreateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningPathKeys.all() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useUpdateLearningPath
// ─────────────────────────────────────────────────────────────────────────
export function useUpdateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLearningPath(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(learningPathKeys.detail(id), data?.data ?? data);
      queryClient.invalidateQueries({ queryKey: learningPathKeys.all() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useDeleteLearningPath
// ─────────────────────────────────────────────────────────────────────────
export function useDeleteLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningPathKeys.all() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useTogglePublish
// ─────────────────────────────────────────────────────────────────────────
export function useTogglePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleLearningPathPublish,
    onSuccess: (data, id) => {
      queryClient.setQueriesData(
        { queryKey: learningPathKeys.lists() },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((lp) =>
              lp.id === id
                ? { ...lp, isPublished: data?.data?.isPublished ?? !lp.isPublished }
                : lp
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: learningPathKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: learningPathKeys.saList() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useEnrollStudent
// ─────────────────────────────────────────────────────────────────────────
export function useEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (learningPathId) =>
      enrollStudentInLearningPath({ learningPathId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningPathKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useAssignAdmins
// ─────────────────────────────────────────────────────────────────────────
export function useAssignAdmins() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ learningPathId, data }) =>
      assignAdminsToLearningPath({ learningPathId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningPathKeys.lists() });
      queryClient.invalidateQueries({ queryKey: learningPathKeys.list({}) });
      queryClient.invalidateQueries({ queryKey: learningPathKeys.adminPaths('JOB') });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// useRecommendPath — submit questionnaire → get + save AI recommendation
// ─────────────────────────────────────────────────────────────────────────
export function useRecommendPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (features) => recommendLearningPath(features),
    onSuccess: (data) => {
      // data = { success, recommended_path, top_paths, matched_path, saved_id }
      // ✅ matched_path هنا هو الـ path object من الـ DB (أو null)
      const normalized = normalizeRec(data);
      
      if (normalized?.recommendedPath) {
        // لو الـ backend رجّع matched_path نحطه صح
        if (data.matched_path) {
          normalized.matchedPath  = data.matched_path;
          normalized.learningPath = data.matched_path;
        }
        queryClient.setQueryData(learningPathKeys.recommendations(), normalized);
      }
      
      queryClient.invalidateQueries({ queryKey: learningPathKeys.recommendations() });
    },
  });
}

export function useAdminLearningPaths(section = 'JOB', options = {}) {
  return useQuery({
    queryKey: learningPathKeys.adminPaths(section),
    queryFn: async () => {
      const data = await getLearningPathsForAdmin(section);
      // ✅ تأكد إن الـ response format صح
      return {
        data: data?.data ?? data ?? [],
        message: data?.message,
      };
    },
    enabled: !!section && (options.enabled !== false),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}