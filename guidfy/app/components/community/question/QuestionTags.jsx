// components/question/QuestionTags.jsx
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

const QuestionTags = ({ tags = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <motion.button
          key={tag}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/40 rounded-lg text-sm font-medium transition-all group"
        >
          <Hash size={12} />
          <span>{tag}</span>
          <span className="text-xs text-blue-600/70 dark:text-blue-400/70 group-hover:text-blue-600 dark:group-hover:text-blue-300">
            {Math.floor(Math.random() * 1000) + 100}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuestionTags;