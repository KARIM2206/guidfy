// components/layout/SidebarPanel.jsx
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Clock, 
  Users,
  Tag,
  Link2,
  BarChart3,
  Award
} from 'lucide-react';

const SidebarPanel = ({ question }) => {
  const relatedQuestions = [
    { id: 1, title: 'useMemo vs useCallback performance differences', votes: 89 },
    { id: 2, title: 'React.modo best practices with TypeScript', votes: 67 },
    { id: 3, title: 'Debugging React re-renders guide', votes: 145 },
    { id: 4, title: 'Performance optimization patterns 2024', votes: 92 },
  ];

  const trendingTags = [
    { name: 'react', count: 1245 },
    { name: 'performance', count: 890 },
    { name: 'typescript', count: 1567 },
    { name: 'hooks', count: 678 },
    { name: 'optimization', count: 423 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Question Stats
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Eye size={16} />
              <span className="text-sm">Views</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {question.views.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageSquare size={16} />
              <span className="text-sm">Answers</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {question.answers.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TrendingUp size={16} />
              <span className="text-sm">Votes</span>
            </div>
            <span className="font-medium text-green-600 dark:text-green-400">
              {question.votes}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span className="text-sm">Active</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {question.createdAt}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Related Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Related Questions
          </h4>
          <Link2 size={16} className="text-gray-400" />
        </div>
        <div className="space-y-3">
          {relatedQuestions.map((q) => (
            <motion.a
              key={q.id}
              href={`/question/${q.id}`}
              whileHover={{ x: 4 }}
              className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-1 line-clamp-2">
                {q.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <TrendingUp size={10} />
                <span>{q.votes} votes</span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Trending Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Trending Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <motion.button
              key={tag.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              #{tag.name}
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                {tag.count}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-6"
      >
        <h4 className="font-semibold text-white mb-4">Community Insights</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">45.2k</div>
              <div className="text-xs text-gray-300">Developers active</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">92%</div>
              <div className="text-xs text-gray-300">Questions answered</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Award size={18} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">24.5k</div>
              <div className="text-xs text-gray-300">Accepted answers</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarPanel;