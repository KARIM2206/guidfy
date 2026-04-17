'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, MessageSquare, Code2, FileText, PlusCircle, Hash, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import CreateModal from './CreateModal';

// ═══════════════════════════════════════════════════
//  CREATE MODAL
// ═══════════════════════════════════════════════════


// ═══════════════════════════════════════════════════
//  FEED EMPTY STATE
// ═══════════════════════════════════════════════════
const FeedEmptyState = ({ type = 'questions', communityId, communityName = 'this community', onContentAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const config = {
    questions: {
      icon: MessageSquare, title: 'No Questions Yet',
      description: 'Be the first to ask a question in this community!',
      color: 'blue', gradient: 'from-blue-500 to-cyan-500', actionText: 'Ask a Question',
    },
    posts: {
      icon: FileText, title: 'No Posts Yet',
      description: 'Share your knowledge and write the first post!',
      color: 'purple', gradient: 'from-purple-500 to-pink-500', actionText: 'Write a Post',
    },
    default: {
      icon: Compass, title: 'No Content Available',
      description: "There's nothing to display here yet.",
      color: 'gray', gradient: 'from-gray-500 to-gray-400', actionText: 'Create Content',
    },
  }[type] ?? {
    icon: Compass, title: 'No Content Available',
    description: "There's nothing to display here yet.",
    color: 'gray', gradient: 'from-gray-500 to-gray-400', actionText: 'Create Content',
  };

  const Icon = config.icon;
  const canCreate = type === 'questions' || type === 'posts';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="relative mb-6 inline-block">
            <div className={`h-24 w-24 bg-gradient-to-br ${config.gradient} rounded-full mx-auto flex items-center justify-center`}>
              <Icon size={48} className="text-white" />
            </div>
            {canCreate && (
              <div className="absolute -top-1 -right-1 h-10 w-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700">
                <PlusCircle size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>

          {/* Text */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{config.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{config.description}</p>

          {/* Action Button */}
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalOpen(true)}
              className={`px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-medium shadow-sm hover:shadow transition-all`}
            >
              <span className="flex items-center justify-center gap-2">
                <PlusCircle size={18} />
                {config.actionText}
              </span>
            </motion.button>
          )}

          {/* Tips */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick tips to get started:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Check community guidelines', 'Search for similar topics', 'Join community discussions', 'Follow active members'].map((tip, i) => (
                <div key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                  <Hash size={12} className="inline mr-1" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
   { canCreate && (
        <CreateModal
          type={type}
          communityId={communityId}
          communityName={communityName}
          onClose={() => setModalOpen(false)}
          onSuccess={onContentAdded}
          isOpen={modalOpen}
        />
      )}
    </>
  );
};

export default FeedEmptyState;