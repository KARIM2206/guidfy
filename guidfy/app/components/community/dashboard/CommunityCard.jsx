'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, TrendingUp, Lock, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  CommunityCard - Display community in grid/list
// ═══════════════════════════════════════════════════════════════

export default function CommunityCard({
  community,
  onClick,
  isAdmin = false,
  isSuperAdmin = false,
  actionMenu = null,
}) {
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-slate-700/50 
                 bg-slate-800/50 backdrop-blur transition-all duration-300 hover:border-slate-600"
    >
      {/* Suspended Overlay */}
      {community.isSuspended && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-950/80 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="mx-auto mb-2 h-8 w-8 text-red-400" />
            <p className="text-sm font-semibold text-red-200">Suspended</p>
          </div>
        </div>
      )}

      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${community.color || '#8b5cf6'} 0%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-2">{community.name}</h3>
            <p className="mt-1 text-xs text-slate-400">
              by {community.createdBy?.name || 'Unknown'}
            </p>
          </div>
          {actionMenu && (
            <div onClick={handleActionClick} className="flex-shrink-0 ml-2">
              {actionMenu}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-slate-300 line-clamp-2">
          {community.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-700/50 pt-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Users className="h-3 w-3" />
            </div>
            <p className="font-semibold text-white">{community.stats?.members || 0}</p>
            <p className="text-xs text-slate-500">Members</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <MessageSquare className="h-3 w-3" />
            </div>
            <p className="font-semibold text-white">{community.stats?.questions || 0}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <FileText className="h-3 w-3" />
            </div>
            <p className="font-semibold text-white">{community.stats?.posts || 0}</p>
            <p className="text-xs text-slate-500">Posts</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
