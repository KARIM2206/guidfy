"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, PlayCircle, Clock, CheckCircle } from "lucide-react";
import LessonItem from "./LessonItem";

const SyllabusItem = ({
  title,
  isLocked = false,
  progress = 0,
  duration = "30 min",
  description = "",
  completed = false,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy lessons data - يمكنك استبدالها ببيانات حقيقية
  const lessons = [
    {
      id: 1,
      title: "Introduction to React Hooks",
      duration: "45 min",
      status: "completed"
    },
    {
      id: 2,
      title: "useState and useEffect",
      duration: "60 min",
      status: "completed"
    },
    {
      id: 3,
      title: "Custom Hooks",
      duration: "75 min",
      status: "in-progress"
    },
    {
      id: 4,
      title: "useContext and useReducer",
      duration: "90 min",
      status: "upcoming"
    },
    {
      id: 5,
      title: "Advanced Hook Patterns",
      duration: "85 min",
      status: "locked"
    }
  ];

  const toggleExpand = () => {
    if (!isLocked) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${isLocked ? 'border-gray-200' : 'border-gray-200 hover:border-blue-300'} rounded-xl overflow-hidden transition-all duration-200 ${isLocked ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'}`}
    >
      {/* Main Item */}
      <button
        onClick={toggleExpand}
        disabled={isLocked}
        className={`w-full flex items-center justify-between p-4 text-left transition-all duration-200 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <div className="p-2 rounded-lg bg-gray-100">
                <Lock className="text-gray-400" size={20} />
              </div>
            ) : completed ? (
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-blue-100">
                <PlayCircle className="text-blue-600" size={20} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <h3 className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'} truncate`}>
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                {<span className={`px-2 py-1 rounded ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                  {duration}
                </span>}
                {/* {!isLocked && !completed && (
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    {duration}
                  </span>
                )} */}
              </div>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {description}
              </p>
            )}

            {/* Progress Bar */}
            {!isLocked && !completed && progress > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-blue-700">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Side Info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-600">
                {lessons.filter(l => l.status === 'completed' || l.status === 'in-progress').length}/{lessons.length} lessons
              </p>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-green-500"
                  style={{ 
                    width: `${(lessons.filter(l => l.status === 'completed').length / lessons.length) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            {isLocked ? (
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                Locked
              </span>
            ) : completed ? (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                Completed
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Continue
              </span>
            )}
            
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expandable Content with LessonItem components */}
      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-1 md:p-4 bg-gray-50">
              {/* Lesson Details Header */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Lesson Details</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This module covers important concepts and practical exercises to help you master the topic.
                </p>
              </div>
              
              {/* Lessons List using LessonItem components */}
              <div className="space-y-3 mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Lessons in this module:</h5>
                {lessons.map((lesson, index) => (
                  <LessonItem
                    key={lesson.id}
                    title={lesson.title}
                    duration={lesson.duration}
                    status={lesson.status}
                    index={index}
                    onClick={() => console.log(`Starting lesson: ${lesson.title}`)}
                  />
                ))}
              </div>

              {/* Additional Children Content */}
              {children && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Additional Resources</h5>
                  <div className="space-y-2">
                    {children}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                >
                  {completed ? 'Review Module' : 'Start Module'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Download Materials
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Take Module Quiz
                </motion.button>
              </div>

              {/* Module Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">
                      {lessons.filter(l => l.status === 'completed').length}
                    </p>
                    <p className="text-xs text-blue-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-700">
                      {lessons.filter(l => l.status === 'in-progress').length}
                    </p>
                    <p className="text-xs text-green-600">In Progress</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-700">
                      {lessons.filter(l => l.status === 'locked' || l.status === 'upcoming').length}
                    </p>
                    <p className="text-xs text-gray-600">Remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SyllabusItem;