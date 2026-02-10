// components/question/QuestionHeader.jsx
import { motion } from 'framer-motion';
import { User, Clock, Edit, Award } from 'lucide-react';

const QuestionHeader = ({
  title,
  author,
  createdAt,
  updatedAt,
  views
}) => {
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
      >
        {title}
      </motion.h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Author Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            {author.badges?.includes('gold') && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Award size={10} className="text-white" />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {author.name}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                {author.reputation.toLocaleString()} rep
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Asked {createdAt}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {updatedAt && updatedAt !== createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Edit size={14} />
              <span>Edited {updatedAt}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={14} />
            <span>Active today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionHeader;