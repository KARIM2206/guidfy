'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuizByLessonId,
  getQuizById,
  updateQuizSettings,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitQuiz,
  getMyAttempts,
  getAllAttempts,
} from '@/services/quiz';

// ─── Query Keys ───
export const quizKeys = {
  all: () => ['quizzes'],
  byLesson: (lessonId) => ['quizzes', 'lesson', lessonId],
  detail: (id) => ['quizzes', 'detail', id],
  attempts: (quizId) => ['quizzes', 'attempts', quizId],
  myAttempts: (quizId) => ['quizzes', 'my-attempts', quizId],
};

// ─── useQuizByLessonId ───
export function useQuizByLessonId(lessonId, options = {}) {
  return useQuery({
    queryKey: quizKeys.byLesson(lessonId),
    queryFn: () => getQuizByLessonId(lessonId),
    enabled: !!lessonId && options.enabled !== false,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── useQuizById ───
export function useQuizById(id, options = {}) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => getQuizById(id),
    enabled: !!id && options.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── useEditQuizSettings ───
export function useEditQuizSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateQuizSettings(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.all() });
    },
  });
}

// ─── useAddQuestion ───
export function useAddQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }) => addQuestion(quizId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all() });
    },
  });
}

// ─── useUpdateQuestion ───
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }) => updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all() });
    },
  });
}

// ─── useDeleteQuestion ───
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all() });
    },
  });
}

// ─── useSubmitQuiz ───
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers }) => submitQuiz(quizId, answers),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.myAttempts(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.attempts(quizId) });
    },
  });
}

// ─── useMyAttempts ───
export function useMyAttempts(quizId) {
  return useQuery({
    queryKey: quizKeys.myAttempts(quizId),
    queryFn: () => getMyAttempts(quizId),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── useAllAttempts ───
export function useAllAttempts(quizId) {
  return useQuery({
    queryKey: quizKeys.attempts(quizId),
    queryFn: () => getAllAttempts(quizId),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 2,
  });
}