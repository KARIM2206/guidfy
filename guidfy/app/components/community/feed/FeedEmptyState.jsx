// components/feed/FeedEmptyState.jsx - النسخة المحدثة
import { motion } from 'framer-motion';
import { Compass, MessageSquare, Code2, FileText, PlusCircle, Hash } from 'lucide-react';

const FeedEmptyState = ({ type = 'questions' }) => {
  const emptyStateConfig = {
    questions: {
      icon: MessageSquare,
      title: 'No Questions Yet',
      description: 'Be the first to ask a question in this community!',
      color: 'blue',
      actionText: 'Ask a Question'
    },
    posts: {
      icon: FileText,
      title: 'No Posts Yet',
      description: 'Share your knowledge and write the first post!',
      color: 'purple',
      actionText: 'Write a Post'
    },
    projects: {
      icon: Code2,
      title: 'No Projects Yet',
      description: 'Start the first open-source project in this community!',
      color: 'green',
      actionText: 'Start a Project'
    },
    default: {
      icon: Compass,
      title: 'No Content Available',
      description: 'There\'s nothing to display here yet.',
      color: 'gray',
      actionText: 'Explore Other'
    }
  };

  const config = emptyStateConfig[type] || emptyStateConfig.default;
  const Icon = config.icon;

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    gray: 'from-gray-500 to-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="relative mb-6">
          <div className={`h-24 w-24 bg-gradient-to-br ${colorClasses[config.color]} rounded-full mx-auto flex items-center justify-center`}>
            <Icon size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 h-12 w-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <PlusCircle size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {config.description}
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 bg-gradient-to-r ${colorClasses[config.color]} text-white rounded-lg font-medium transition-all shadow-sm hover:shadow`}
        >
          <span className="flex items-center justify-center gap-2">
            {config.actionText}
            <PlusCircle size={18} />
          </span>
        </motion.button>

        {/* Quick Tips */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Quick tips to get started:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Check community guidelines',
              'Search for similar topics',
              'Join community discussions',
              'Follow active members'
            ].map((tip, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                <Hash size={12} className="inline mr-1" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedEmptyState;