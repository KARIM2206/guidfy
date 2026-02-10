// app/components/OverviewCard.tsx
"use client";

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';



export default function OverviewCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color,
  bgColor,
  description,
  additionalInfo,
  trendIcon: TrendIcon,
  metric
}) {
  const numberVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }
    }
  };

  const changeVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.4
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className={`relative ${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group`}
    >
      {/* Background Gradient Effect */}
      <motion.div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${color.replace('from-', 'bg-gradient-to-r ')}`}
        initial={false}
      />
      
      {/* Animated Corner Accent */}
      <motion.div
        className={`absolute top-0 right-0 w-16 h-16 ${color} rounded-bl-full opacity-20`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
            <motion.h3 
              className="text-3xl font-bold text-gray-800"
              variants={numberVariants}
            >
              {value}
            </motion.h3>
          </div>
          
          {/* Icon Container */}
          <motion.div
            className={`p-3 rounded-xl ${color} text-white shadow-lg`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon size={24} />
          </motion.div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>

        {/* Trend and Change */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            variants={changeVariants}
            whileHover={{ scale: 1.05 }}
          >
            <TrendIcon size={14} />
            <span className="text-sm font-semibold">{change}</span>
          </motion.div>
          
          <motion.div
            className="text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {metric}
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          className="pt-4 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gray-500">
            {additionalInfo}
          </p>
        </motion.div>

        {/* Animated Progress Bar */}
        <motion.div 
          className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className={`h-full ${color}`}
            initial={{ width: "0%" }}
            animate={{ width: isPositive ? "75%" : "40%" }}
            transition={{ 
              delay: 0.8, 
              duration: 1.5, 
              ease: "easeOut" 
            }}
          />
        </motion.div>
      </div>

      {/* Hover Effect Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-20 bg-white/30"
            style={{
              left: `${20 + i * 30}%`,
              top: '-20px',
            }}
            animate={{
              y: [0, '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}