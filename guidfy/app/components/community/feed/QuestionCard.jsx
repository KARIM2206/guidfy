// components/feed/QuestionCard.jsx
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex gap-4">
          {/* Votes Section */}
          <div className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-green-500 transition-colors"
              aria-label="Upvote"
            >
              <ChevronUp size={20} />
            </motion.button>
            <span className="text-lg font-bold text-gray-900 dark:text-white my-1">
              {votes}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Downvote"
            >
              <ChevronDown size={20} />
            </motion.button>
            {isAnswered && (
              <div className="mt-2 p-1 bg-green-100 dark:bg-green-900/30 rounded">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Community & Time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                  {community}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  {createdAt}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              <Link
                href={`/community/question/${id}`}
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {title}
              </Link>
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              {/* Author */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {author}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={16} />
                  <span className="text-sm">{answers} answers</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Eye size={16} />
                  <span className="text-sm">{views} views</span>
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