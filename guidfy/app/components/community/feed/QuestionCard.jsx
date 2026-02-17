import { motion } from 'framer-motion';
import {
  MessageSquare,
  Eye,
  Clock,
  User,
  CheckCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

const QuestionCard = ({
  id,
  title,
  excerpt,
  tags = [],
  author,
  votes = 0,
  answers = 0,
  views = 0,
  isAnswered = false,
  createdAt = '2 hours ago',
  community = 'Frontend',
}) => {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full"
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Votes Section */}
          <div className="flex flex-row sm:flex-col items-center sm:items-center flex-shrink-0 gap-2 sm:gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 sm:p-2 text-gray-400 hover:text-green-500 transition-colors"
              aria-label="Upvote"
            >
              <ChevronUp size={16} className="sm:w-5 sm:h-5 w-4 h-4" />
            </motion.button>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white my-0.5 sm:my-1">
              {votes}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 sm:p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Downvote"
            >
              <ChevronDown size={16} className="sm:w-5 sm:h-5 w-4 h-4" />
            </motion.button>
            {isAnswered && (
              <div className="mt-1 sm:mt-2 p-1 bg-green-100 dark:bg-green-900/30 rounded">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Community & Time */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-between mb-2 sm:mb-3 gap-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 truncate">
                {community}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {createdAt}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              <Link
                href={`/community/question/${id}`}
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {title}
              </Link>
            </h3>

            {/* Excerpt */}
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
              {excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm rounded-lg truncate"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
              {/* Author */}
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={12} className="sm:w-4 sm:h-4 w-3 h-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                  {author}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <MessageSquare size={14} className="sm:w-4 sm:h-4 w-3 h-3" />
                  <span>{answers} answers</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <Eye size={14} className="sm:w-4 sm:h-4 w-3 h-3" />
                  <span>{views} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default QuestionCard;
