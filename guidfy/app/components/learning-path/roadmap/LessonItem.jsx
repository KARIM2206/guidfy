'use client';

import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Video, FileText, HelpCircle, Eye } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

const QuizBuilder = lazy(() => import('./QuizBuilder'));

const typeConfig = {
  VIDEO: {
    icon: <Video size={16} />,
    color: 'bg-blue-100 text-blue-600',
    lightBg: 'hover:bg-blue-50',
  },
  ARTICLE: {
    icon: <FileText size={16} />,
    color: 'bg-green-100 text-green-600',
    lightBg: 'hover:bg-green-50',
  },
  QUIZ: {
    icon: <HelpCircle size={16} />,
    color: 'bg-purple-100 text-purple-600',
    lightBg: 'hover:bg-purple-50',
  },
};

const LessonItem = ({ lesson, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [openQuizBuilder, setOpenQuizBuilder] = useState(false);

  // ✅ استخرج الـ data من الـ structure الصحيح
  const title = lesson?.title || 'Untitled Lesson';
  const description = lesson?.description || '';
  const type = lesson?.type || 'VIDEO';
  const createdAt = lesson?.createdAt;

  // ✅ الـ content حسب الـ type
  const videoData = lesson?.video;
  const articleData = lesson?.article;
  const quizData = lesson?.quiz;

  const typeData = typeConfig[type] || typeConfig.VIDEO;

  const truncateTitle = (text) => {
    if (!text) return '';
    return text.length > 30 ? text.slice(0, 30) + '…' : text;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ Debug
  console.log('🔥 LessonItem lesson:', {
    id: lesson?.id,
    title,
    type,
    hasVideo: !!videoData,
    hasArticle: !!articleData,
    hasQuiz: !!quizData,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${typeData.lightBg} transition-all duration-200`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Left side: icon + content */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeData.color} flex items-center justify-center`}>
              {typeData.icon}
            </div>

            <div className="flex-1 min-w-0">
              {/* ✅ Title */}
              <h6 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {truncateTitle(title)}
              </h6>

              {/* ✅ Description */}
              {description && (
                <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-1">
                  {description}
                </p>
              )}

              {/* ✅ Content preview حسب الـ type */}
              {type === 'VIDEO' && videoData && (
                <p className="text-xs text-blue-600 mt-1 truncate">
                  🎥 {videoData.videoUrl || 'Video'}
                </p>
              )}

              {type === 'ARTICLE' && articleData && (
                <p className="text-xs text-green-600 mt-1">
                  📝 Article
                </p>
              )}

              {type === 'QUIZ' && quizData && (
                <p className="text-xs text-purple-600 mt-1">
                  ❓ Quiz
                </p>
              )}

              {/* ✅ Date */}
              {createdAt && (
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Right side: type badge + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
            <span className={`hidden sm:inline-block text-xs px-3 py-1 rounded-full font-medium ${typeData.color}`}>
              {type}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenPreviewModal(true)}
                className="gap-1 !px-2 !py-1 text-xs"
              >
                <Eye size={14} />
                View
              </Button>

              {isAdmin && (
                <>
                  {type === 'QUIZ' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenQuizBuilder(true)}
                      className="gap-1 !px-2 !py-1 text-xs text-purple-600 hover:bg-purple-50"
                    >
                      <HelpCircle size={14} />
                      Quiz
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lesson)}
                    className="gap-1 !px-2 !py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lesson.id)}
                    className="gap-1 !px-2 !py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {openPreviewModal && (
        <div className="fixed inset-0 bg-red-500/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="font-bold mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            
            {type === 'VIDEO' && videoData && (
              <video src={videoData.videoUrl} controls className="w-full rounded" />
            )}
            
            {type === 'ARTICLE' && articleData && (
              <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: articleData.content }} />
            )}
            
            <Button variant="outline" onClick={() => setOpenPreviewModal(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}

      {isAdmin && type === 'QUIZ' && openQuizBuilder && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white p-4 rounded">Loading...</div></div>}>
          <QuizBuilder
            isOpen={openQuizBuilder}
            onClose={() => setOpenQuizBuilder(false)}
            lessonId={lesson.id}
          />
        </Suspense>
      )}
    </>
  );
};

export default LessonItem;