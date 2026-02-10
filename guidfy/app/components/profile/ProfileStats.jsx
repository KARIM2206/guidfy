// components/profile/ProfileStats.jsx
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Code2, Star, Target, Zap, Award } from 'lucide-react';

const ProfileStats = ({ stats = {} }) => {
  const statCards = [
    {
      icon: Star,
      label: 'Reputation',
      value: stats.reputation || 0,
      color: 'from-yellow-500 to-orange-500',
      change: '+245'
    },
    {
      icon: MessageSquare,
      label: 'Posts',
      value: stats.posts || 0,
      color: 'from-blue-500 to-cyan-500',
      change: '+12'
    },
    {
      icon: Users,
      label: 'Followers',
      value: stats.followers || 0,
      color: 'from-purple-500 to-pink-500',
      change: '+34'
    },
    {
      icon: Target,
      label: 'Solutions',
      value: stats.solutions || 0,
      color: 'from-green-500 to-emerald-500',
      change: '+18'
    },
    {
      icon: Code2,
      label: 'Projects',
      value: stats.projects || 0,
      color: 'from-indigo-500 to-blue-500',
      change: '+3'
    },
    {
      icon: Award,
      label: 'Answers',
      value: stats.answers || 0,
      color: 'from-red-500 to-rose-500',
      change: '+28'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`h-10 w-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                {stat.change && (
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                    {stat.change}
                  </span>
                )}
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Streak Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-yellow-400" />
            <div>
              <div className="text-lg font-bold text-white">42 day streak</div>
              <div className="text-sm text-gray-300">Active for 6 weeks straight</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-xs text-gray-300">Consistency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">#124</div>
              <div className="text-xs text-gray-300">Rank</div>
            </div>
          </div>
        </div>
        
        {/* Streak Visualization */}
        <div className="flex items-center gap-1 mt-4">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${i < 28
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileStats;