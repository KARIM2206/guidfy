"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle, Circle, PlayCircle } from "lucide-react";



const LessonItem = ({ 
  title, 
  duration, 
  status = 'upcoming',
  index = 0,
  onClick 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-gray-900',
          durationColor: 'text-green-600',
          buttonText: 'Review',
          buttonColor: 'bg-green-500 hover:bg-green-600',
        };
      case 'in-progress':
        return {
          icon: PlayCircle,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-gray-900',
          durationColor: 'text-blue-600',
          buttonText: 'Continue',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
        };
      case 'locked':
        return {
          icon: Circle,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-500',
          durationColor: 'text-gray-500',
          buttonText: 'Locked',
          buttonColor: 'bg-gray-300 cursor-not-allowed',
        };
      default: // upcoming
        return {
          icon: BookOpen,
          iconColor: 'text-gray-400',
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          durationColor: 'text-gray-500',
          buttonText: 'Start Reading',
          buttonColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
        scale: status !== 'locked' ? 1.02 : 1,
        boxShadow: status !== 'locked' ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      className={`
        flex items-center justify-between 
        p-4 rounded-xl border 
        ${config.borderColor} ${config.bgColor}
        transition-all duration-200
        ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
      onClick={status !== 'locked' ? onClick : undefined}
    >
      {/* Left Content */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Lesson Indicator */}
        <div className="flex items-center justify-center relative">
          {/* Background Number */}
          <div className="absolute text-4xl font-bold text-gray-100 -z-10">
            {index + 1}
          </div>
          
          {/* Icon */}
          <motion.div
            whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
            className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}
          >
            <Icon className={config.iconColor} size={22} />
          </motion.div>
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${config.textColor}`}>
            {title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-sm font-medium flex items-center gap-1 ${config.durationColor}`}>
              <Clock size={14} />
              {duration}
            </span>
            
            {status === 'completed' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Completed
              </span>
            )}
            {status === 'in-progress' && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                In Progress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
        whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          flex items-center gap-2
          ${config.buttonColor}
          ${status === 'locked' ? 'cursor-not-allowed' : ''}
        `}
        disabled={status === 'locked'}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && status !== 'locked') onClick();
        }}
      >
        {config.buttonText}
        {status === 'upcoming' && (
          <BookOpen size={16} />
        )}
        {status === 'completed' && (
          <CheckCircle size={16} />
        )}
        {status === 'in-progress' && (
          <PlayCircle size={16} />
        )}
      </motion.button>
    </motion.div>
  );
};

export default LessonItem;