"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  trendIcon: TrendIcon = isPositive ? TrendingUp : TrendingDown,
  metric,
}) {
  const numberVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
   className={`
  relative
  w-full
  min-w-0
  h-full
  ${bgColor}
  rounded-2xl
  p-4 sm:p-5
  shadow-lg
  border border-gray-100/50
  overflow-hidden
  group
  flex flex-col
`}

    >
      {/* Corner Accent */}
      <motion.div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} rounded-bl-[40px] opacity-10`}
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
      />

      <div className="relative z-10 flex flex-col h-full gap-3 w-full">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
              {title}
            </p>

            <motion.h3
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight break-words"
              variants={numberVariants}
            >
              {value}
            </motion.h3>
          </div>

          <motion.div
            className={`flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon size={18} className="sm:w-5 sm:h-5" />
          </motion.div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 break-words">
          {description}
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-2 mt-1 w-full">
          <motion.div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${
                isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            whileHover={{ scale: 1.02 }}
          >
            <TrendIcon size={12} />
            <span>{change}</span>
          </motion.div>

          {metric && (
            <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full truncate max-w-[120px]">
              {metric}
            </span>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-auto pt-2 border-t border-gray-200/70 w-full">
          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 break-words">
            {additionalInfo}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 mb-2 bg-gray-200/50 rounded-full overflow-hidden w-full">
          <motion.div
            className={`h-full bg-gradient-to-r ${color}`}
            initial={{ width: "0%" }}
            animate={{ width: isPositive ? "75%" : "40%" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}