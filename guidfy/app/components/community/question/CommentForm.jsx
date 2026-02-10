// components/question/CommentForm.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

const CommentForm = ({ onSubmit, onCancel, placeholder = "Add a comment..." }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-4"
    >
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          rows={3}
          autoFocus
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Keep comments respectful and on-topic.
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium text-sm transition-colors flex items-center gap-1"
            >
              <X size={14} />
              <span>Cancel</span>
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={!comment.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${comment.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={14} />
              <span>Post</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default CommentForm;