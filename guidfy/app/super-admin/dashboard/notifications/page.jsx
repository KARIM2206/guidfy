'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, Filter,
  BookOpen, Star, Megaphone, ChevronDown,
} from 'lucide-react';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';
import { useRouter } from 'next/navigation';

const TYPE_CONFIG = {
  NEW_STEP:   { icon: BookOpen,  color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'New Step',    border: 'border-blue-200' },
  NEW_LESSON: { icon: Star,      color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'New Lesson',  border: 'border-amber-200' },
  VOTE:       { icon: Star,      color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Vote',        border: 'border-yellow-200' },
  SYSTEM:     { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50', label: 'System',      border: 'border-purple-200' },
  TEST:       { icon: Bell,      color: 'text-green-500',  bg: 'bg-green-50',  label: 'Test',        border: 'border-green-200' },
};

const FILTERS = ['All', 'Unread', 'NEW_STEP', 'NEW_LESSON', 'SYSTEM', 'VOTE'];

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    pagination,
    unreadCount,
    loading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
  } = useNotifications();

  const [filter,   setFilter]   = useState('All');
  const [page,     setPage]     = useState(1);

  useEffect(() => { fetchNotifications(page, 20); }, [page]);

  const filtered = notifications.filter(n => {
    if (filter === 'All')    return true;
    if (filter === 'Unread') return !n.read && !n.isRead;
    return (n.metadata?.type || n.type) === filter;
  });

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m} minutes ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hours ago`;
    return `${Math.floor(h / 24)} days ago`;
  };

  const handleClick = async (notif) => {
    if (!notif.read && !notif.isRead) await markNotificationAsRead(notif.id);
    if (notif.metadata?.roadmapId) {
      router.push(`/super-admin/dashboard/roadmaps/${notif.metadata.roadmapId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <CheckCheck size={16} />
              Mark all read
            </motion.button>
          )}
        </motion.div>

        {/* ── Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'All' ? `All (${notifications.length})` : f}
            </button>
          ))}
        </motion.div>

        {/* ── Notifications List ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-400">Loading notifications...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100"
            >
              <Bell size={44} className="mx-auto text-gray-200 mb-3" />
              <p className="font-medium text-gray-400">No notifications here</p>
              <p className="text-sm text-gray-300 mt-1">
                {filter !== 'All' ? 'Try a different filter' : "You're all caught up!"}
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {filtered.map((notif, i) => {
              const isRead    = notif.read || notif.isRead;
              const metaType  = notif.metadata?.type || notif.type;
              const config    = TYPE_CONFIG[metaType] || TYPE_CONFIG.SYSTEM;
              const Icon      = config.icon;

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleClick(notif)}
                  className={`group relative flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all
                    ${isRead
                      ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      : `${config.bg} ${config.border} shadow-sm hover:shadow-md`
                    }
                  `}
                >
                  {/* Unread dot */}
                  {!isRead && (
                    <div className="absolute top-4 right-12 w-2 h-2 bg-indigo-500 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.color}`}>
                            {config.label}
                          </span>
                          {notif.metadata?.adminName && (
                            <span className="text-[10px] text-gray-400">
                              by {notif.metadata.adminName}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                          {notif.title || notif.message}
                        </p>

                        {/* Metadata details */}
                        {notif.metadata && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {notif.metadata.roadmapTitle && (
                              <span className="text-[10px] bg-white/70 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                                📍 {notif.metadata.roadmapTitle}
                              </span>
                            )}
                            {notif.metadata.stepTitle && (
                              <span className="text-[10px] bg-white/70 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                                🪜 {notif.metadata.stepTitle}
                              </span>
                            )}
                            {notif.metadata.lessonType && (
                              <span className="text-[10px] bg-white/70 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                                📚 {notif.metadata.lessonType}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Time + Delete */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {timeAgo(notif.createdAt)}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Mark as read on hover */}
                    {!isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notif.id); }}
                        className="mt-2 text-[10px] text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck size={10} /> Mark as read
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ── Pagination ── */}
        {pagination && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 mt-8"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}