// components/profile/UserAnswers.jsx
import { motion } from 'framer-motion';
import { CheckCircle, ChevronUp, Clock, Eye, MessageSquare, ChevronDown, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper: format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
};

// Helper: truncate text
const truncate = (text, maxLength = 200) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};

// Answer skeleton (matching the card layout)
const AnswerSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex gap-4">
      {/* Votes skeleton */}
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const UserAnswers = ({ answers = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AnswerSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!answers.length) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No answers yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {answers.map((answer, index) => (
        <motion.article
          key={answer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -2 }}
          className={`
            relative bg-white dark:bg-gray-800 rounded-xl shadow-sm 
            border border-gray-200 dark:border-gray-700 p-6
            transition-all duration-200 hover:shadow-md
            ${answer.isAccepted ? 'border-l-4 border-l-green-500 dark:border-l-green-400' : ''}
          `}
        >
          <div className="flex gap-4">
            {/* Votes & Acceptance */}
            <div className="flex flex-col items-center min-w-[40px]">
              <button
                className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Upvote"
              >
                <ChevronUp size={20} />
              </button>
              <span className="text-lg font-bold text-gray-900 dark:text-white my-1">
                {answer.votes ?? 0}
              </span>
              <button
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Downvote"
              >
                <ChevronDown size={20} />
              </button>
              {answer.isAccepted && (
                <div className="mt-2">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Question link */}
              <div className="mb-2">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {answer.question?.title || 'Untitled Question'}
                </h3>
              </div>

              {/* Answer excerpt */}
              <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {truncate(answer.body, 180)}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {/* Author */}
                  {answer.author && (
                    <div className="flex items-center gap-1">
                      {answer.author.avatar ? (
                        <img
                          src={`http://localhost:8000${answer.author.avatar}`}
                          alt={answer.author.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <User size={14} />
                      )}
                      <span>{answer.author.name}</span>
                    </div>
                  )}
                  {/* Date */}
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(answer.createdAt)}</span>
                  </div>
                </div>

                {/* Accepted badge */}
                {answer.isAccepted && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Accepted
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default UserAnswers;