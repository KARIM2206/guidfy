// components/question/CommentList.jsx
import { motion } from 'framer-motion';
import { User, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';

const CommentList = ({ comments = [], onAddComment }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddComment}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          + Add comment
        </motion.button>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-green-500"
                  aria-label="Upvote comment"
                >
                  <ChevronUp size={12} />
                </motion.button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 my-1">
                  {comment.votes}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  aria-label="Downvote comment"
                >
                  <ChevronDown size={12} />
                </motion.button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;