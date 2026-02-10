"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Download,
  Share2,
  Copy,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Move
} from 'lucide-react';

export default function ModuleFooterActions({
  module,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
  onDuplicate,
  onExport,
  onShare,
  onArchive,
  onMove,
  className = ""
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const buttonVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handlePublishToggle = () => {
    if (module.isPublished) {
      onUnpublish();
    } else {
      onPublish();
    }
  };

  const moreActions = [
    {
      id: 'duplicate',
      label: 'Duplicate Module',
      icon: Copy,
      onClick: onDuplicate,
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'export',
      label: 'Export Module',
      icon: Download,
      onClick: onExport,
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'share',
      label: 'Share Module',
      icon: Share2,
      onClick: onShare,
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'move',
      label: 'Move Module',
      icon: Move,
      onClick: onMove,
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'archive',
      label: 'Archive Module',
      icon: Archive,
      onClick: onArchive,
      color: 'text-gray-600 hover:bg-gray-50'
    }
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, y: 10, scale: 0.95 }
  };

  return (
    <div className={`${className}`}>
      {/* Main Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Section - Status */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              module.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {module.isPublished ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">
                {module.isPublished ? 'Published Module' : 'Draft Module'}
              </h4>
              <p className="text-sm text-gray-600">
                {module.isPublished 
                  ? 'Visible to students' 
                  : 'Only visible to admins'}
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-wrap gap-3">
            {/* Save Button */}
            <motion.button
              onClick={onSave}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              <Save size={18} />
              Save Changes
            </motion.button>

            {/* Publish/Unpublish Button */}
            <motion.button
              onClick={handlePublishToggle}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold ${
                module.isPublished
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg text-white'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white'
              }`}
            >
              {module.isPublished ? (
                <>
                  <EyeOff size={18} />
                  Unpublish Module
                </>
              ) : (
                <>
                  <Eye size={18} />
                  Publish Module
                </>
              )}
            </motion.button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMoreActions(!showMoreActions)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                <MoreVertical size={18} />
                More Actions
                <ChevronDown size={16} className={`transition-transform ${showMoreActions ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showMoreActions && (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-10"
                  >
                    <div className="p-2">
                      {moreActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => {
                              action.onClick();
                              setShowMoreActions(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors ${action.color}`}
                          >
                            <Icon size={18} />
                            <span className="font-medium">{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete Button */}
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              <Trash2 size={18} />
              Delete Module
            </motion.button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {module.publishedLessons || 0} published lessons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {module.draftLessons || 0} draft lessons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Last saved: {module.lastSaved || 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Delete Module?
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{module.title}"? This action cannot be undone and will remove all lessons, student progress, and associated data.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-red-800 mb-1">This will permanently delete:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• All lessons in this module</li>
                          <li>• Student progress data</li>
                          <li>• Analytics and reports</li>
                          <li>• Any uploaded content</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={() => setShowDeleteConfirm(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleDelete}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Module
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}