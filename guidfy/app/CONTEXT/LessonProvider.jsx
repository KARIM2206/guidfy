'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  getLessonsByStep,
  getLessonById,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLesson,
} from '@/services/admin/lesson';
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
import {
  getStudentLessonsByStepId,
  getStudentRoadmapProgress,
  getStudentStepProgress,
  updateStudentLessonProgress,
} from '@/services/student/student';

const LessonContext = createContext();

export const LessonProvider = ({ children }) => {
  // ── Lesson State ──────────────────────────────────────
  const [lessons,        setLessons]        = useState([]);
  const [studentLessons, setStudentLessons] = useState([]);
  const [currentLesson,  setCurrentLesson]  = useState(null);
  const [lessonsByStep,  setLessonsByStep]  = useState({});
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [stepProgress,   setStepProgress]   = useState({});
  const [roadmapProgress,setRoadmapProgress]= useState({});

  // ── Quiz State ────────────────────────────────────────
  const [currentQuiz,    setCurrentQuiz]    = useState(null);  // { id, title, timeLimit, passingScore, questions: [] }
  const [quizAttempts,   setQuizAttempts]   = useState([]);    // محاولات الطالب
  const [lastAttemptResult, setLastAttemptResult] = useState(null); // نتيجة آخر محاولة
  const [quizLoading,    setQuizLoading]    = useState(false);

  // ═══════════════════════════════════════════════════════
  //  LESSON ACTIONS
  // ═══════════════════════════════════════════════════════
  const fetchLessonsByStep = useCallback(async (stepId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLessonsByStep(stepId);
      setLessonsByStep((prev) => ({ ...prev, [stepId]: res?.lessons || [] }));
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch lessons');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentLessonsByStepId = useCallback(async (stepId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentLessonsByStepId(stepId);
      await fetchStepProgressById(stepId);
      setStudentLessons(res?.data || []);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch lessons');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLessonById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLessonById(id);
      setCurrentLesson(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStepProgressById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res  = await getStudentStepProgress(id);
      const data = res?.data;
      setStepProgress(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch step progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoadmapProgressById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res  = await getStudentRoadmapProgress(id);
      const data = res?.data;
      setRoadmapProgress(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmap progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(async (stepId, lessonData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await addLesson(stepId, lessonData);
      if (res.success) {
        setRefreshTrigger((prev) => !prev);
        await fetchLessonsByStep(stepId);
      }
      return res;
    } catch (err) {
      setError(err.message || 'Failed to create lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLessonsByStep]);

  const editLesson = useCallback(async (id, lessonData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateLesson(id, lessonData);
      setLessons((prev) => prev.map((l) => (l.id === id ? res : l)));
      if (currentLesson?.id === id) setCurrentLesson(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to update lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentLesson]);

  const editLessonProgress = useCallback(async ({ lessonId, completed }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateStudentLessonProgress({ lessonId, completed });
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to update lesson progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeLesson = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      if (currentLesson?.id === id) setCurrentLesson(null);
    } catch (err) {
      setError(err.message || 'Failed to delete lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentLesson]);

  const reorderLessons = useCallback(async (lessonId, newOrder) => {
    setLoading(true);
    setError(null);
    try {
      await reorderLesson(lessonId, newOrder);
      setLessons((prev) => {
        const item   = prev.find((l) => l.id === lessonId);
        if (!item) return prev;
        const others = prev.filter((l) => l.id !== lessonId);
        others.splice(newOrder - 1, 0, item);
        return others;
      });
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || 'Failed to reorder lessons');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  //  QUIZ ACTIONS
  // ═══════════════════════════════════════════════════════

  /** جيب الـ quiz بتاع lesson معين */
  const fetchQuizByLessonId = useCallback(async (lessonId) => {
    setQuizLoading(true);
    setError(null);
    try {
      const res = await getQuizByLessonId(lessonId);
      setCurrentQuiz(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** جيب الـ quiz بـ id */
  const fetchQuizById = useCallback(async (id) => {
    setQuizLoading(true);
    setError(null);
    try {
      const res = await getQuizById(id);
      setCurrentQuiz(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** تعديل settings الـ quiz (title, timeLimit, passingScore) */
  const editQuizSettings = useCallback(async (quizId, data) => {
    setQuizLoading(true);
    try {
      const res = await updateQuizSettings(quizId, data);
      setCurrentQuiz((prev) => prev ? { ...prev, ...res.data } : res.data);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to update quiz');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** إضافة سؤال */
  const addQuizQuestion = useCallback(async (quizId, questionData) => {
    setQuizLoading(true);
    try {
      const res = await addQuestion(quizId, questionData);
      // أضف السؤال للـ state فوراً
      setCurrentQuiz((prev) => {
        if (!prev) return prev;
        return { ...prev, questions: [...(prev.questions || []), res.data] };
      });
      return res;
    } catch (err) {
      setError(err.message || 'Failed to add question');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** تعديل سؤال */
  const editQuizQuestion = useCallback(async (questionId, questionData) => {
    setQuizLoading(true);
    try {
      const res = await updateQuestion(questionId, questionData);
      setCurrentQuiz((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? res.data : q
          ),
        };
      });
      return res;
    } catch (err) {
      setError(err.message || 'Failed to update question');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** حذف سؤال */
  const removeQuizQuestion = useCallback(async (questionId) => {
    setQuizLoading(true);
    try {
      await deleteQuestion(questionId);
      setCurrentQuiz((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
        };
      });
    } catch (err) {
      setError(err.message || 'Failed to delete question');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** تقديم الـ quiz (student) */
  const submitQuizAttempt = useCallback(async (quizId, answers) => {
    setQuizLoading(true);
    try {
      const res = await submitQuiz(quizId, answers);
      setLastAttemptResult(res.data);
      // أضف المحاولة للـ list
      setQuizAttempts((prev) => [
        { id: res.data.attemptId, score: res.data.score, passed: res.data.passed, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** جيب محاولاتي */
  const fetchMyAttempts = useCallback(async (quizId) => {
    setQuizLoading(true);
    try {
      const res = await getMyAttempts(quizId);
      setQuizAttempts(res.data || []);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch attempts');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  /** جيب كل المحاولات (admin) */
  const fetchAllAttempts = useCallback(async (quizId) => {
    setQuizLoading(true);
    try {
      const res = await getAllAttempts(quizId);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to fetch all attempts');
      throw err;
    } finally {
      setQuizLoading(false);
    }
  }, []);

  // ── Value ─────────────────────────────────────────────
  const value = {
    // Lesson state
    lessons,
    studentLessons,
    currentLesson,
    lessonsByStep,
    loading,
    error,
    refreshTrigger,
    setRefreshTrigger,
    stepProgress,
    roadmapProgress,

    // Lesson actions
    fetchLessonsByStep,
    fetchStudentLessonsByStepId,
    fetchLessonById,
    fetchStepProgressById,
    fetchRoadmapProgressById,
    createLesson,
    editLesson,
    editLessonProgress,
    removeLesson,
    reorderLessons,

    // Quiz state
    currentQuiz,
    quizAttempts,
    lastAttemptResult,
    quizLoading,

    // Quiz actions
    fetchQuizByLessonId,
    fetchQuizById,
    editQuizSettings,
    addQuizQuestion,
    editQuizQuestion,
    removeQuizQuestion,
    submitQuizAttempt,
    fetchMyAttempts,
    fetchAllAttempts,
  };

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
};

export const useLessonContext = () => {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLessonContext must be used within LessonProvider');
  return ctx;
};