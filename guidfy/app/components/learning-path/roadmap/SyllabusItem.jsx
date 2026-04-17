'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  FileText,
  HelpCircle,
  Lock,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Trophy,
  Award,
} from 'lucide-react';
import { useLessons } from '@/app/hooks/useLesson';
import { useSteps } from '@/app/hooks/useStep';
import { useParams, useRouter } from 'next/navigation';

const typeIcons = {
  VIDEO: Play,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
};

export default function SyllabusItem({ lesson,stepId,roadmapId }) {
 const{editLessonProgress,fetchStudentLessonsByStepId,fetchStepProgressById}=useLessons() 
 const {fetchStudentStepsByRoadmap}=useSteps()
  const {
    id,
    title,
    description,
    duration,
    completed,
    locked,
    type,
    video,
    article,
    quiz,
  } = lesson;
 if (lesson.type === "QUIZ") {
  console.log("Quiz Data:", lesson.quiz);
}
 const {title:learningPathTitle}=useParams()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const Icon = typeIcons[type] || FileText;
  const router=useRouter()
  const handleClick = () => {
    if (locked) return;
    if (type === 'VIDEO' || type === 'ARTICLE') {
      setIsModalOpen(true);
    }
    if (type === 'QUIZ') {
      router.push(`${learningPathTitle}/quiz/${quiz.id}`);
    }
  };
console.log('Lesson in SyllabusItem', lesson);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!locked ? { scale: 1.01, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}}
        className={`
          relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border
          transition-all duration-200
          ${locked ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-indigo-200'}
          ${completed ? 'border-green-500 bg-green-50/30' : 'border-gray-200'}
        `}
        onClick={handleClick}
      >
        {locked && (
          <div className="absolute inset-0 bg-gray-100/50 rounded-xl flex items-center justify-center z-10">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
        )}

        {/* Left icon */}
        <div className="flex-shrink-0 flex items-start gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${type === 'VIDEO' ? 'bg-red-100 text-red-600' : ''}
            ${type === 'ARTICLE' ? 'bg-blue-100 text-blue-600' : ''}
            ${type === 'QUIZ' ? 'bg-purple-100 text-purple-600' : ''}
          `}>
            <Icon size={20} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
            {completed && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {duration}
              </span>
            )}

            {type === 'QUIZ' && quiz && (
              <>
                {quiz.timeLimit && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {quiz.timeLimit} min
                  </span>
                )}
                {quiz.passingScore && (
                  <span className="flex items-center gap-1">
                    <AlertCircle size={14} /> Pass: {quiz.passingScore}%
                  </span>
                )}
               {quiz.attempts?.length > 0 && (
  <span className="flex items-center gap-1">
    <Award size={14} /> Score: {quiz.attempts[quiz.attempts.length - 1].score}
  </span>
)}
              </>
            )}
          </div>
        </div>
      </motion.div>

  {/* Modal */}
<AnimatePresence>
  {isModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* VIDEO */}
        {type === "VIDEO" && video?.videoUrl && (
          <video
            src={`http://localhost:8000${video.videoUrl}`}
            controls
            className="w-full h-auto rounded-lg bg-black mb-6"
          />
        )}

        {/* ARTICLE */}
        {type === "ARTICLE" && article?.content && (
          <div className="prose max-w-full mb-6">
            <p>{article.content}</p>
          </div>
        )}

        {/* ✅ Mark as Completed Button */}
        {!completed && !locked && (
          <button
            onClick={async () => {
              try {
                await editLessonProgress({
                  lessonId: id,
                  completed: true,
                });
              await fetchStudentLessonsByStepId(stepId);
              await fetchStudentStepsByRoadmap(roadmapId);

                setIsModalOpen(false); // يقفل المودال بعد النجاح
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
          >
            Mark as Completed
          </button>
        )}

        {/* لو الدرس مكتمل */}
        {completed && (
          <div className="w-full bg-green-100 text-green-700 py-3 rounded-lg text-center font-medium">
            ✅ Lesson Completed
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}