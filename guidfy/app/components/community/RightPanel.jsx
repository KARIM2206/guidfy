// components/layout/RightPanel.jsx
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Calendar,
  Award,
  Zap,
  ChevronRight,
  Sparkles,
  Clock,
} from 'lucide-react';

const trendingQuestions = [
  { id: 1, title: 'Next.js 14 Server Actions best practices?', votes: 245 },
  { id: 2, title: 'How to optimize React re-renders in 2024?', votes: 189 },
  { id: 3, title: 'Tailwind CSS vs Styled Components?', votes: 167 },
];

const upcomingEvents = [
  { id: 1, title: 'React Conf 2024', date: 'Tomorrow', attendees: 320 },
  { id: 2, title: 'Web Performance Workshop', date: 'Feb 15', attendees: 150 },
  { id: 3, title: 'Open Source Hackathon', date: 'Feb 20', attendees: 540 },
];

const topContributors = [
  { id: 1, name: 'Alex Chen', points: 12450, streak: 42 },
  { id: 2, name: 'Sarah Johnson', points: 9870, streak: 31 },
  { id: 3, name: 'Mike Wilson', points: 8450, streak: 28 },
];

const RightPanel = () => {
  return (
    <div className="space-y-6">
      {/* Trending Questions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp size={20} className="mr-2 text-orange-500" />
            Trending Questions
          </h3>
          <Zap size={16} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {trendingQuestions.map((question, index) => (
            <motion.a
              key={question.id}
              href={`/question/${question.id}`}
              whileHover={{ x: 4 }}
              className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-1 line-clamp-2">
                    {question.title}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <TrendingUp size={12} className="mr-1" />
                      {question.votes} votes
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 mt-1 flex-shrink-0" />
              </div>
            </motion.a>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          View All Trending
        </motion.button>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar size={20} className="mr-2 text-purple-500" />
            Upcoming Events
          </h3>
          <Sparkles size={16} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ x: 4 }}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {event.title}
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={14} className="mr-1" />
                    {event.date}
                  </span>
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users size={14} className="mr-1" />
                    {event.attendees}
                  </span>
                </div>
                <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Contributors */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Award size={20} className="mr-2 text-yellow-500" />
            Top Contributors
          </h3>
          <Users size={16} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {topContributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              whileHover={{ x: 4 }}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold mr-3">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {contributor.name}
                </h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {contributor.points.toLocaleString()} points
                  </span>
                  <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} className="mr-1" />
                    {contributor.streak} day streak
                  </span>
                </div>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          Become a Contributor
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">Community Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">24.5k</div>
            <div className="text-sm text-gray-300">Developers</div>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">18.2k</div>
            <div className="text-sm text-gray-300">Questions</div>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">9.7k</div>
            <div className="text-sm text-gray-300">Projects</div>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">156k</div>
            <div className="text-sm text-gray-300">Solutions</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RightPanel;