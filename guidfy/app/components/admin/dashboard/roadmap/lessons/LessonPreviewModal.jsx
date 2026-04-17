'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Film,
  FileText,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Award,
  Eye,
  Edit,                 // <-- new
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import QuizBuilder from './QuizBuilder';       // <-- import QuizBuilder
import { useAuth } from '@/app/CONTEXT/AuthProvider';  // <-- to get role

// Helper to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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

const LessonPreviewModal = ({ isOpen, onClose, lesson, isAdmin = false, onOpenQuizBuilder }) => {
  const router = useRouter();
  const {roadmapId} = useParams()
  const { user } = useAuth();                     // fallback if isAdmin not passed
  const admin = isAdmin || user?.role === 'ADMIN';
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);  // <-- local state

  useEffect(() => {
    setShowFullDescription(false);
    setShowFullContent(false);
  }, [lesson]);

  if (!lesson) return null;

  const { title, description, type, order, duration, video, article, quiz, externalLink, id: lessonId } = lesson;

  const typeConfig = {
    VIDEO: { icon: Film, color: 'text-blue-600', bg: 'bg-blue-100' },
    ARTICLE: { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    QUIZ: { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  };
  const TypeIcon = typeConfig[type]?.icon || FileText;

  const truncatedDesc = description ? truncateText(description, 200) : '';
  const shouldShowDescToggle = description && description.length > 200;

  const articleContent = article?.content || '';
  const truncatedContent = articleContent ? truncateText(articleContent, 300) : '';
  const shouldShowContentToggle = articleContent.length > 300;

  const linkToCopy = externalLink || (type === 'VIDEO' && video?.isExternal ? video.videoUrl : null) || (type === 'ARTICLE' && article?.isExternal ? article?.content : null);

  const handleOpenFull = () => {
    router.push(`/admin/dashboard/roadmaps/${roadmapId}/steps/${lesson.stepId}/lessons/${lesson.id}`);
    onClose();
  };

  const handleOpenQuizBuilder = () => {
    setIsQuizBuilderOpen(true);
    // If parent provided a callback, call it too (optional)
    if (onOpenQuizBuilder) onOpenQuizBuilder();
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.3 } },
  };

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${typeConfig[type]?.bg} ${typeConfig[type]?.color}`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{title}</h2>
                    {order !== undefined && (
                      <p className="text-xs text-gray-400">Lesson {order}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenFull}
                    className="gap-1 hidden sm:flex"
                    leftIcon={<ExternalLink size={16} />}
                  >
                    Open Full Page
                  </Button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <motion.div
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{duration} min</span>
                  </div>
                )}

                {description && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-700">Description</h3>
                    <p className="text-sm text-gray-600">
                      {showFullDescription ? description : truncatedDesc}
                    </p>
                    {shouldShowDescToggle && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {showFullDescription ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                {type === 'VIDEO' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Video</h3>
                    {video?.isExternal || externalLink ? (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <ExternalLink size={16} className="text-gray-400" />
                        <a
                          href={externalLink || video?.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 truncate flex-1 hover:underline"
                        >
                          {externalLink || video?.videoUrl}
                        </a>
                        <CopyButton text={externalLink || video?.videoUrl || ''} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <video
                          src={`http://localhost:8000${video.videoUrl}`}
                          controls
                          poster={video.thumbnail || ''}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                {type === 'ARTICLE' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Article</h3>
                    {article?.isExternal || externalLink ? (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <ExternalLink size={16} className="text-gray-400" />
                        <a
                          href={externalLink || article?.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 truncate flex-1 hover:underline"
                        >
                          {externalLink || article?.content}
                        </a>
                        <CopyButton text={externalLink || article?.content || ''} />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-600">
                        {showFullContent ? articleContent : truncatedContent}
                        {shouldShowContentToggle && (
                          <button
                            onClick={() => setShowFullContent(!showFullContent)}
                            className="text-xs text-blue-600 hover:underline ml-1"
                          >
                            {showFullContent ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {type === 'QUIZ' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">Quiz</h3>
                      {admin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenQuizBuilder}
                          className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                          leftIcon={<Edit size={14} />}
                        >
                          Manage Quiz
                        </Button>
                      )}
                    </div>
                    {quiz && (
                      <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                        {quiz.title && <p className="font-medium">{quiz.title}</p>}
                        {quiz.timeLimit && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} className="text-purple-600" />
                            <span>Time limit: {quiz.timeLimit} minutes</span>
                          </div>
                        )}
                        {quiz.passingScore && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award size={16} className="text-purple-600" />
                            <span>Passing score: {quiz.passingScore}%</span>
                          </div>
                        )}
                        {quiz.questionsCount && (
                          <p className="text-sm text-gray-600">
                            {quiz.questionsCount} questions
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 italic">
                      Full quiz editor available via "Manage Quiz" button.
                    </p>
                  </div>
                )}

                {linkToCopy && !(type === 'VIDEO' && !video?.isExternal) && !(type === 'ARTICLE' && !article?.isExternal) && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <ExternalLink size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 truncate flex-1">{linkToCopy}</span>
                    <CopyButton text={linkToCopy} />
                  </div>
                )}
              </motion.div>

              <div className="p-4 border-t border-gray-100 sm:hidden">
                <Button
                  variant="primary"
                  onClick={handleOpenFull}
                  className="w-full gap-2"
                  leftIcon={<Eye size={18} />}
                >
                  Open Full Page
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render QuizBuilder modal inside preview */}
      {admin && (
        <QuizBuilder
          isOpen={isQuizBuilderOpen}
          onClose={() => setIsQuizBuilderOpen(false)}
          lessonId={lessonId}
        />
      )}
    </>,
    document.body
  );
};

export default LessonPreviewModal;