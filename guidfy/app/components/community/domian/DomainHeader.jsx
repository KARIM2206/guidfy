// components/community/DomainHeader.jsx
import { motion } from 'framer-motion';
import { Users, ChevronRight, Star, Globe } from 'lucide-react';

const DomainHeader = ({
  name,
  description,
  icon = '💻',
  color = 'blue',
  isMember = false,
  onJoin
}) => {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    gray: 'bg-gradient-to-r from-gray-600 to-gray-400'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${colorClasses[color]} opacity-10`} />
      
      {/* Content */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left: Community Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-16 w-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-2xl`}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {name}
                  </h1>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full flex items-center gap-1">
                    <Globe size={12} />
                    Public
                  </span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={18} />
                <span className="text-sm">45k+ members</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Star size={18} />
                <span className="text-sm">4.8/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onJoin}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${isMember
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : `${colorClasses[color]} text-white hover:shadow-md`
                }`}
            >
              {isMember ? '✓ Joined' : 'Join Community'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Guides</span>
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-gradient-to-tr from-white/20 to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default DomainHeader;