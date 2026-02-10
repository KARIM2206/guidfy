// components/profile/EmptyState.jsx
import { motion } from 'framer-motion';
import { FileText, MessageSquare, CheckCircle, Code2, Plus } from 'lucide-react';

const EmptyState = ({ type = 'posts' }) => {
  const emptyStateConfig = {
    posts: {
      icon: FileText,
      title: 'No Posts Yet',
      description: 'Share your knowledge by writing your first post.',
      action: 'Write a Post',
      color: 'from-blue-500 to-cyan-500'
    },
    questions: {
      icon: MessageSquare,
      title: 'No Questions Yet',
      description: 'Ask your first question to get help from the community.',
      action: 'Ask a Question',
      color: 'from-purple-500 to-pink-500'
    },
    answers: {
      icon: CheckCircle,
      title: 'No Answers Yet',
      description: 'Help others by answering their questions.',
      action: 'Browse Questions',
      color: 'from-green-500 to-emerald-500'
    },
    projects: {
      icon: Code2,
      title: 'No Projects Yet',
      description: 'Showcase your work by adding your first project.',
      action: 'Add a Project',
      color: 'from-orange-500 to-amber-500'
    }
  };

  const config = emptyStateConfig[type] || emptyStateConfig.posts;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="relative mb-6">
          <div className={`h-20 w-20 bg-gradient-to-br ${config.color} rounded-full mx-auto flex items-center justify-center`}>
            <Icon size={32} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <Plus size={16} className="text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {config.description}
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 bg-gradient-to-r ${config.color} text-white rounded-lg font-medium transition-all shadow-sm hover:shadow`}
        >
          {config.action}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmptyState;