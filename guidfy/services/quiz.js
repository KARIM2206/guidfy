// services/admin/quiz.js
import api from "./apiCommunity";

// ── Get Quiz ──────────────────────────────────────────
export const getQuizByLessonId = async (lessonId) => {
  const res = await api.get(`/quiz/lesson/${lessonId}`);
  return res.data;
};

export const getQuizById = async (id) => {
  const res = await api.get(`/quiz/${id}`);
  return res.data;
};

// ── Update Quiz Settings ──────────────────────────────
export const updateQuizSettings = async (id, data) => {
  const res = await api.put(`/quiz/${id}`, data);
  return res.data;
};

// ── Questions ─────────────────────────────────────────
export const addQuestion = async (quizId, data) => {
  const res = await api.post(`/quiz/${quizId}/questions`, data);
  return res.data;
};

export const updateQuestion = async (questionId, data) => {
  const res = await api.put(`/quiz/questions/${questionId}`, data);
  return res.data;
};

export const deleteQuestion = async (questionId) => {
  const res = await api.delete(`/quiz/questions/${questionId}`);
  return res.data;
};

// ── Student Attempts ──────────────────────────────────
export const submitQuiz = async (quizId, answers) => {
  // answers: [{ questionId, optionId }]
  const res = await api.post(`/quiz/${quizId}/submit`, { answers });
  return res.data;
};

export const getMyAttempts = async (quizId) => {
  const res = await api.get(`/quiz/${quizId}/my-attempts`);
  return res.data;
};

export const getAllAttempts = async (quizId) => {
  const res = await api.get(`/quiz/${quizId}/attempts`);
  return res.data;
};