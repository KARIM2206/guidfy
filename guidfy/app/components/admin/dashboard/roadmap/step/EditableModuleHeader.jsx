// app/components/EditableModuleHeader.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2,
  Save,
  X,
  BookOpen,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Award,
  BarChart3
} from 'lucide-react';



export default function EditableModuleHeader({
  module,
  onUpdate,
  onToggleExpand,
  isEditing = false,
  onEditToggle
}) {
  const [editMode, setEditMode] = useState(isEditing);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description);
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  useEffect(() => {
    if (editMode) {
      titleInputRef.current?.focus();
    }
  }, [editMode]);

  const handleSave = () => {
    if (editTitle.trim() && editDescription.trim()) {
      onUpdate({
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setEditMode(false);
      if (onEditToggle) onEditToggle();
    }
  };

  const handleCancel = () => {
    setEditTitle(module.title);
    setEditDescription(module.description);
    setEditMode(false);
    if (onEditToggle) onEditToggle();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-orange-500';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-6"
    >
      {/* Module Header */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Section - Module Info */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
                
                {editMode ? (
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Title *
                      </label>
                      <input
                        ref={titleInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter module title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        ref={descriptionInputRef}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        placeholder="Describe what this module covers..."
                      />
                    </div>
                    
                    {/* Edit Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleSave}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                      >
                        <Save size={18} />
                        Save Changes
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
                      >
                        <X size={18} />
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {module.title}
                      </h2>
                      <button
                        onClick={onEditToggle}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6 max-w-3xl">
                      {module.description}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Expand/Collapse Button */}
              {onToggleExpand && (
                <motion.button
                  onClick={onToggleExpand}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  {module.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.button>
              )}
            </div>
            
            {/* Stats Grid */}
            {!editMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lessons</p>
                      <p className="text-xl font-bold text-gray-900">
                        {module.lessonCount}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-xl font-bold text-gray-900">
                        {module.duration}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Enrolled</p>
                      <p className="text-xl font-bold text-gray-900">
                        {module.enrolled.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-xl font-bold text-gray-900">
                        {module.category}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Right Section - Progress & Difficulty */}
          {!editMode && onToggleExpand && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-blue-600" />
                      <span className="font-medium text-gray-700">Progress</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {module.progress}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getProgressColor(module.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${module.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Start</span>
                    <span>Complete</span>
                  </div>
                </div>
                
                {/* Difficulty */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-purple-600" />
                    <span className="font-medium text-gray-700">Difficulty</span>
                  </div>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                  </span>
                </div>
                
                {/* Expand/Collapse Button */}
                <motion.button
                  onClick={onToggleExpand}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {module.isExpanded ? 'Collapse Module' : 'Expand Module'}
                  {module.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Module Tags */}
      {!editMode && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Tags:</span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
              Interactive Learning
            </span>
            <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
              Hands-on Projects
            </span>
            <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm">
              Quizzes Included
            </span>
            <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm">
              Certificate
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}