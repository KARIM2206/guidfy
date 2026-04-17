'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X, Megaphone, BookOpen, Star } from 'lucide-react';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';
import { useRouter } from 'next/navigation';

const typeIcon = {
  NEW_STEP:   <BookOpen size={14} className="text-blue-400" />,
  NEW_LESSON: <Star size={14} className="text-amber-400" />,
  VOTE:       <Star size={14} className="text-yellow-400" />,
  SYSTEM:     <Megaphone size={14} className="text-purple-400" />,
  TEST:       <Bell size={14} className="text-green-400" />,
};

const typeColor = {
  NEW_STEP:   'border-l-blue-500',
  NEW_LESSON: 'border-l-amber-500',
  VOTE:       'border-l-yellow-500',
  SYSTEM:     'border-l-purple-500',
  TEST:       'border-l-green-500',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
  } = useNotifications();

  // جيب الـ notifications عند الفتح
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (notif) => {
    console.log('Notification clicked:', notif);
    
    if (!notif.read && !notif.isRead) await markNotificationAsRead(notif.id);
    if (notif.metadata?.roadmapId) {
      router.push(`/super-admin/dashboard/learning-paths/${notif.metadata.learningPathId}/roadmaps/${notif.metadata.roadmapId}`);
      setOpen(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-indigo-600" />
                <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllNotificationsAsRead}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <CheckCheck size={12} />
                    All read
                  </motion.button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="text-center py-10 px-4">
                  <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              )}

              {!loading && notifications.map((notif) => {
                const isRead = notif.read || notif.isRead;
                const metaType = notif.metadata?.type || notif.type;

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => handleClick(notif)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer border-l-2 transition-colors
                      ${typeColor[metaType] || 'border-l-gray-300'}
                      ${isRead ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'}
                    `}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {typeIcon[metaType] || <Bell size={14} className="text-gray-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                        {notif.title || notif.message}
                      </p>
                      {notif.message && notif.title && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{notif.message}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {!isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1" />}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => { router.push('/super-admin/dashboard/notifications'); setOpen(false); }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium w-full text-center transition-colors"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}