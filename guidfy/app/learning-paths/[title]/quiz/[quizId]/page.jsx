// app/dashboard/quiz/[quizId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLessonContext } from '@/app/CONTEXT/LessonProvider';
// import QuizPlayer from '@/app/components/admin/dashboard/roadmap/lessons/QuizPlayer';
import { toast } from 'react-toastify';
import QuizPlayer from '@/app/components/admin/dashboard/roadmap/lessons/Quizplayer';

export default function QuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { fetchQuizById, currentQuiz, quizLoading } = useLessonContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizId) return;
    const loadQuiz = async () => {
      setLoading(true);
      try {
        console.log(quizId);
        await fetchQuizById(quizId);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
        toast.error('Could not load quiz');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, fetchQuizById]);

  const handlePass = () => {
    // بعد اجتياز الكويز، يمكن توجيه المستخدم إلى صفحة الدرس أو إغلاق الصفحة
    toast.success('Quiz passed! Redirecting...');
    // على سبيل المثال: الرجوع إلى الصفحة السابقة أو إلى لوحة التحكم
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  if (loading || quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !currentQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-600">{error || 'Quiz not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6"
        >
          <QuizPlayer
            quiz={currentQuiz}
            onClose={handleClose}
            onPass={handlePass}
          />
        </motion.div>
      </div>
    </div>
  );
}