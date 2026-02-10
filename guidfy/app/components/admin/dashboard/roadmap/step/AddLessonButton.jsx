"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Video,
  FileText,
  HelpCircle,
  Clock,
  X,
  ChevronDown,
  CheckCircle,
  BookOpen,
  Upload,
  Link
} from 'lucide-react';

export default function AddLessonButton({
  onAddLesson,
  moduleId,
  nextOrder = 1,
  variant = 'default',
  className = ''
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: '30 mins',
    status: 'draft'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const lessonTypes = [
    { id: 'video', icon: Video, label: 'Video Lesson', color: 'bg-blue-100 text-blue-800' },
    { id: 'article', icon: FileText, label: 'Article', color: 'bg-purple-100 text-purple-800' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz', color: 'bg-orange-100 text-orange-800' }
  ];

  const durationOptions = [
    '15 mins', '30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours', '3+ hours'
  ];

  const handleSubmit = () => {
    if (!lessonData.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }

    const newLesson = {
      id: Date.now(),
      order: nextOrder,
      ...lessonData,
      createdAt: new Date().toISOString().split('T')[0],
      moduleId: moduleId,
      resources: 0,
      isFree: true
    };

    onAddLesson(newLesson);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setLessonData({
      title: '',
      description: '',
      type: 'video',
      duration: '30 mins',
      status: 'draft'
    });
    setShowAdvanced(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  if (variant === 'simple') {
    return (
      <motion.button
        onClick={() => setIsModalOpen(true)}
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg ${className}`}
      >
        <Plus size={20} />
        Add Lesson
      </motion.button>
    );
  }

  return (
    <>
      {/* Main Add Lesson Button */}
      <div className={`mt-8 ${className}`}>
        <div className="relative group">
          {/* Dashed Border Container */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl p-8 text-center transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-white"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Plus size={28} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Add New Lesson
                </h3>
                <p className="text-gray-600 mb-4">
                  Create interactive content for your students
                </p>
                <div className="flex items-center justify-center gap-2">
                  {lessonTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`px-3 py-1 rounded-lg text-sm ${type.color}`}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Animated Plus Sign */}
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="mt-4"
              >
                <Plus size={24} className="text-green-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Badge */}
          <div className="absolute -top-2 -right-2">
            <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
              Lesson {nextOrder}
            </span>
          </div>
        </div>
      </div>

      {/* Create Lesson Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <Plus size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Lesson</h2>
                        <p className="text-gray-600">Add to Module • Lesson {nextOrder}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setIsModalOpen(false)}
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={24} className="text-gray-500" />
                    </motion.button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* Lesson Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      value={lessonData.title}
                      onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                      placeholder="e.g., Introduction to React Hooks"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={lessonData.description}
                      onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of what students will learn..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  {/* Lesson Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Lesson Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {lessonTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <motion.button
                            key={type.id}
                            type="button"
                            onClick={() => setLessonData({ ...lessonData, type: type.id })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                              lessonData.type === type.id
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={24} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={lessonData.duration}
                        onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        {durationOptions.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                      <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      <span>Advanced Options</span>
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 space-y-4 overflow-hidden"
                        >
                          {/* Content Source */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Content Source
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                className="p-3 border border-gray-300 rounded-lg flex items-center gap-2 hover:border-gray-400"
                              >
                                <Upload size={18} />
                                Upload File
                              </button>
                              <button
                                type="button"
                                className="p-3 border border-gray-300 rounded-lg flex items-center gap-2 hover:border-gray-400"
                              >
                                <Link size={18} />
                                External Link
                              </button>
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Initial Status
                            </label>
                            <select
                              value={lessonData.status}
                              onChange={(e) => setLessonData({ ...lessonData, status: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="locked">Locked</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <div className="flex justify-end gap-3">
                    <motion.button
                      onClick={() => setIsModalOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg"
                    >
                      <CheckCircle size={20} />
                      Create Lesson
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}