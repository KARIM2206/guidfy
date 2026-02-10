// components/profile/SidebarTracks.jsx
import { motion } from 'framer-motion';
import { TrendingUp, ChevronRight } from 'lucide-react';

const SidebarTracks = ({ tracks = [] }) => {
  const getColorClass = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      black: 'from-gray-800 to-gray-600',
      pink: 'from-pink-500 to-rose-500',
      green: 'from-green-500 to-emerald-500'
    };
    return colorMap[color] || 'from-blue-500 to-cyan-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} />
          Enrolled Tracks
        </h4>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {tracks.map((track) => (
          <div key={track.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {track.name}
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {track.progress}%
              </span>
            </div>
            
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${track.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full bg-gradient-to-r ${getColorClass(track.color)}`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
        View All Tracks
      </button>
    </motion.div>
  );
};

export default SidebarTracks;