// app/dashboard/lessons/[lessonId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Clock,
  Award,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Save,
  X,
  Trash2,
} from 'lucide-react';
import { useLessonContext } from '@/app/CONTEXT/LessonProvider';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import Button from '@/app/components/ui/Button';
import QuizBuilder from '@/app/components/admin/dashboard/roadmap/lessons/QuizBuilder';
import LessonForm from '@/app/components/admin/dashboard/roadmap/lessons/LessonForm'; // ✅ Import LessonForm
import { toast } from 'react-toastify';

// Helper: copy button
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      title="Copy link"
    >
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
    </button>
  );
};

// ─── Quiz Taker Component (for students) ─────────────────
const QuizTaker = ({ quiz, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { submitQuizAttempt } = useLessonContext();

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quiz.id, answers);
      setResult(res.data);
      setSubmitted(true);
      if (onComplete) onComplete(res.data);
      toast.success(res.data.passed ? '🎉 You passed the quiz!' : '❌ You did not pass. Try again?');
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 text-center"
      >
        <div className={`inline-flex p-3 rounded-full ${result.passed ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
          {result.passed ? <CheckCircle size={32} className="text-green-600" /> : <X size={32} className="text-red-600" />}
        </div>
        <h3 className="text-2xl font-bold mb-2">{result.passed ? 'Congratulations!' : 'Not this time'}</h3>
        <p className="text-gray-600 mb-4">
          Your score: <span className="font-bold text-blue-600">{result.score}%</span>
          {quiz.passingScore && ` (Passing: ${quiz.passingScore}%)`}
        </p>
        {!result.passed && (
          <Button onClick={() => { setSubmitted(false); setAnswers({}); }} variant="outline">
            Try Again
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-800 mb-3">
            {idx + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  answers[q.id] === opt.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleAnswerChange(q.id, opt.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Lesson Page ───────────────────────────────────
export default function LessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    currentLesson,
    fetchLessonById,
    currentQuiz,
    fetchQuizByLessonId,
    quizLoading,
    editLessonProgress,
    stepProgress,
    removeLesson,           // ✅ delete lesson action
  } = useLessonContext();

  const [loading, setLoading] = useState(true);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ✅ edit modal state
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch lesson and quiz data
  useEffect(() => {
    if (!lessonId) return;
    const load = async () => {
      setLoading(true);
      try {
        const lesson = await fetchLessonById(lessonId);
        if (lesson?.type === 'QUIZ') {
          await fetchQuizByLessonId(lessonId);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId, fetchLessonById, fetchQuizByLessonId]);

  const lesson = currentLesson;
  const isCompleted = stepProgress?.completedLessons?.includes(lessonId);

  const handleMarkComplete = async () => {
    if (isCompleted) return;
    setCompleting(true);
    try {
      await editLessonProgress({ lessonId, completed: true });
      toast.success('Lesson marked as complete!');
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setCompleting(false);
    }
  };

  // ✅ Delete lesson handler
  const handleDeleteLesson = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await removeLesson(lessonId);
      toast.success('Lesson deleted successfully');
      router.back(); // Navigate back to step page
    } catch (err) {
      toast.error(err.message || 'Failed to delete lesson');
    } finally {
      setDeleting(false);
    }
  };

  // Render loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Lesson not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const typeConfig = {
    VIDEO: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Video Lesson' },
    ARTICLE: { icon: FileText, color: 'text-green-600', bg: 'bg-green-100', label: 'Article' },
    QUIZ: { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Quiz' },
  };
  const TypeIcon = typeConfig[lesson.type]?.icon || FileText;
  const typeLabel = typeConfig[lesson.type]?.label || lesson.type;

  // We need to get stepId for the LessonForm (for creation only, not needed for edit)
  // For edit, we pass the lesson object; stepId is optional.
  const stepId = lesson.stepId; // adjust according to your data structure

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button and admin actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="gap-1"
                leftIcon={<Edit size={14} />}
              >
                Edit Lesson
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteLesson}
                disabled={deleting}
                className="gap-1"
                leftIcon={<Trash2 size={14} />}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className={`p-6 ${typeConfig[lesson.type]?.bg} border-b border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white shadow-sm ${typeConfig[lesson.type]?.color}`}>
                <TypeIcon size={24} />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{typeLabel}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{lesson.title}</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {lesson.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} /> <span>{lesson.duration} minutes</span>
              </div>
            )}
            {lesson.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
            )}
            {/* Progress toggle for students */}
            {!isAdmin && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {isCompleted ? '✅ Completed' : 'Not completed yet'}
                </span>
                {!isCompleted && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkComplete}
                    disabled={completing}
                  >
                    {completing ? 'Marking...' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6">
            {/* VIDEO TYPE */}
            {lesson.type === 'VIDEO' && (
              <div className="space-y-4">
                {lesson.video?.isExternal || lesson.externalLink ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <ExternalLink size={16} className="text-gray-400" />
                    <a
                      href={lesson.externalLink || lesson.video?.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 truncate flex-1 hover:underline"
                    >
                      {lesson.externalLink || lesson.video?.videoUrl}
                    </a>
                    <CopyButton text={lesson.externalLink || lesson.video?.videoUrl || ''} />
                  </div>
                ) : (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      src={`http://localhost:8000${lesson.video?.videoUrl}`}
                      controls
                      poster={lesson.video?.thumbnail}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ARTICLE TYPE */}
          {/* ARTICLE TYPE */}
{lesson.type === 'ARTICLE' && (
  <div className="prose prose-blue max-w-none">
    {lesson.article?.isExternal || lesson.externalLink ? (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <ExternalLink size={16} className="text-gray-400" />
        <a
          href={lesson.externalLink || lesson.article?.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 truncate flex-1 hover:underline"
        >
          {lesson.externalLink || lesson.article?.content}
        </a>
        <CopyButton text={lesson.externalLink || lesson.article?.content || ''} />
      </div>
    ) : (
      <div 
        className="article-content-wrapper relative group"
        style={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: lesson.article?.content || '' }}
          className="article-content"
        />
        {/* Optional tooltip on hover (shows full content) */}
        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-md shadow-lg z-50 whitespace-normal max-w-xs">
          {lesson.article?.content?.replace(/<[^>]*>/g, '') || 'No content'}
        </div>
      </div>
    )}
  </div>
)}

            {/* QUIZ TYPE */}
            {lesson.type === 'QUIZ' && (
              <>
                {isAdmin ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Quiz Management</h3>
                      <Button variant="outline" onClick={() => setShowQuizBuilder(true)}>
                        <Edit size={16} className="mr-1" /> Edit Quiz
                      </Button>
                    </div>
                    {currentQuiz && (
                      <div className="bg-purple-50 p-4 rounded-xl space-y-2">
                        <p><strong>Title:</strong> {currentQuiz.title || 'Untitled'}</p>
                        <p><strong>Time limit:</strong> {currentQuiz.timeLimit || 'No limit'} min</p>
                        <p><strong>Passing score:</strong> {currentQuiz.passingScore || 60}%</p>
                        <p><strong>Questions:</strong> {currentQuiz.questions?.length || 0}</p>
                      </div>
                    )}
                    {quizLoading && <p>Loading quiz...</p>}
                  </div>
                ) : (
                  <div>
                    {currentQuiz ? (
                      <QuizTaker quiz={currentQuiz} />
                    ) : (
                      <p className="text-gray-500">No quiz available for this lesson.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quiz Builder Modal (admin only) */}
      {isAdmin && showQuizBuilder && lesson.type === 'QUIZ' && (
        <QuizBuilder
          isOpen={showQuizBuilder}
          onClose={() => setShowQuizBuilder(false)}
          lessonId={lessonId}
        />
      )}

      {/* Lesson Edit Modal */}
      {isAdmin && showEditModal && (
        <LessonForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            // Refresh lesson data after edit
            fetchLessonById(lessonId);
          }}
          stepId={stepId}   // may be optional, but edit doesn't need it
          lesson={lesson}   // pass existing lesson for edit
        />
      )}
    </div>
  );
}