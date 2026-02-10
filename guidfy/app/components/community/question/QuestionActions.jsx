// components/question/QuestionActions.jsx
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Bookmark, Share2, Flag, CheckCircle } from 'lucide-react';

const QuestionActions = ({
  votes,
  isUpvoted,
  isDownvoted,
  isBookmarked,
  onVote,
  onBookmark,
  onShare,
  onReport
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Vote Buttons */}
      <div className="flex flex-col items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onVote('up')}
          className={`p-2 rounded-lg ${isUpvoted
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label="Upvote"
        >
          <ChevronUp size={24} />
        </motion.button>
        
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {votes}
        </span>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onVote('down')}
          className={`p-2 rounded-lg ${isDownvoted
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label="Downvote"
        >
          <ChevronDown size={24} />
        </motion.button>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookmark}
          className={`flex items-center justify-center p-2 rounded-lg ${isBookmarked
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Share"
        >
          <Share2 size={20} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReport}
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Report"
        >
          <Flag size={20} />
        </motion.button>
      </div>

      {/* Solved Indicator */}
      {votes > 50 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"
        >
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
        </motion.div>
      )}
    </div>
  );
};

export default QuestionActions;