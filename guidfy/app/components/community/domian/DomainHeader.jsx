// components/community/DomainHeader.jsx
import { motion } from 'framer-motion';
import { Users, ChevronRight, Star, Globe } from 'lucide-react';

const DomainHeader = ({
  name,
  description,
  icon = '💻',
  color = 'blue',
  isMember = false,
  members,
  onJoin
}) => {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    gray: 'bg-gradient-to-r from-gray-600 to-gray-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  };

  // التأكد من وجود اللون
  const currentColorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${currentColorClass} opacity-10`} />

      {/* Content */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                      p-4 sm:p-6 md:p-8">

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

          {/* Left */}
          <div className="flex-1 min-w-0">

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">

              {/* Icon */}
              <div className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 
                              ${currentColorClass} 
                              rounded-xl sm:rounded-2xl 
                              flex items-center justify-center 
                              text-lg sm:text-xl md:text-2xl flex-shrink-0 text-white`}>
                {icon}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                                 font-bold 
                                 text-gray-900 dark:text-white 
                                 truncate">
                    {name}
                  </h1>

                  <span className="px-2 py-1 sm:px-3 
                                   bg-green-100 dark:bg-green-900/30 
                                   text-green-700 dark:text-green-400 
                                   text-xs sm:text-sm 
                                   font-medium 
                                   rounded-full 
                                   flex items-center gap-1">
                    <Globe size={12} />
                    Public
                  </span>
                </div>

                <p className="mt-2 text-sm sm:text-base 
                              text-gray-600 dark:text-gray-300 
                              break-words">
                  {description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm">

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={16} />
                <span>{members} members</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Star size={16} />
                <span>4.8/5 rating</span>
              </div>

            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto">

            {/* Join Button - تم إصلاحه */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onJoin}
              className={`w-full sm:w-auto px-6 py-3 
                          text-sm sm:text-base font-semibold
                          rounded-xl shadow-sm transition-all
                          ${isMember
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  : `${currentColorClass} text-white hover:shadow-lg hover:brightness-105`
                }`}
            >
              {isMember ? '✓ Joined' : 'Join Community'}
            </motion.button>

            {/* Explore Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 py-3 
                         text-sm sm:text-base
                         bg-white dark:bg-gray-700 
                         border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 
                         rounded-xl font-medium 
                         hover:bg-gray-50 dark:hover:bg-gray-600 
                         transition-colors 
                         flex items-center justify-center gap-2"
            >
              <span>Explore Guides</span>
              <ChevronRight size={16} />
            </motion.button>

          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-white/20 to-transparent rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-gradient-to-tr from-white/20 to-transparent rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default DomainHeader;