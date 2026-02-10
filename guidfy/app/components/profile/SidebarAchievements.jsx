// components/profile/SidebarAchievements.jsx
import { motion } from 'framer-motion';
import { Trophy, Award, Star } from 'lucide-react';

const SidebarAchievements = ({ badges = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy size={18} />
          Achievements
        </h4>
        <Award size={16} className="text-gray-400" />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg"
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <span className="text-xs font-medium text-gray-900 dark:text-white text-center line-clamp-2">
              {badge.name}
            </span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            12 more achievements to unlock
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarAchievements;