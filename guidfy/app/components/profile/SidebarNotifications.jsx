'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageSquare, Heart, UserPlus,
  ChevronLeft, Loader2, CheckCheck, Trash2,
  ThumbsUp,
} from 'lucide-react';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';
import { useRouter } from 'next/navigation';

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  answer:  MessageSquare,
  like:    Heart,
  VOTE:    ThumbsUp,
  follow:  UserPlus,
  comment: MessageSquare,
  mention: Bell,
  system:  Bell,
};

// ─── Color map ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  answer:  'text-blue-600   dark:text-blue-400   bg-blue-100   dark:bg-blue-900/30',
  like:    'text-rose-600   dark:text-rose-400   bg-rose-100   dark:bg-rose-900/30',
  VOTE:    'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  follow:  'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
  comment: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30',
  system:  'text-gray-600   dark:text-gray-400   bg-gray-100   dark:bg-gray-700',
};

const getIcon  = (type) => ICON_MAP[type]  ?? Bell;
const getColor = (type) => COLOR_MAP[type] ?? COLOR_MAP.system;

// ─── Time formatter ───────────────────────────────────────────────────────────
const formatTime = (dateString) => {
  if (!dateString) return 'now';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)  return 'now';
  if (mins  < 60) return `since ${mins} minute${mins > 1 ? 's' : ''}`;
  if (hours < 24) return `since ${hours} hour${hours > 1 ? 's' : ''}`;
  if (days  < 7)  return `since ${days} day${days > 1 ? 's' : ''}`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

// ─── Component ────────────────────────────────────────────────────────────────
const SidebarNotifications = () => {
  const router = useRouter();

  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
  } = useNotifications();

  // جلب أحدث 5 إشعارات عند تحميل المكوّن
  useEffect(() => {
    fetchNotifications(1, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestNotifications = notifications.slice(0, 5);

  const handleClick = (notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading && notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Bell size={16} />
            Notifications
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold bg-red-500 text-white rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </h4>

        {/* زر تعيين الكل كمقروء (يظهر فقط لو في غير مقروء) */}
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            title="تعيين الكل كمقروء"
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck size={14} />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        )}
      </div>

      {/* ── List ── */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <AnimatePresence initial={false}>
          {latestNotifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm flex flex-col items-center gap-2"
            >
              <Bell size={24} className="opacity-30" />
               No notifications yet
            </motion.div>
          ) : (
            latestNotifications.map((notification, i) => {
              const Icon    = getIcon(notification.type);
              const isUnread = !notification.isRead && !notification.read;

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleClick(notification)}
                  className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isUnread
                      ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/70'
                  }`}
                >
                  {/* أيقونة النوع */}
                  <div className={`h-9 w-9 ${getColor(notification.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>

                  {/* النص والوقت */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                      {notification.title || notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatTime(notification.createdAt ?? notification.sentAt)}
                    </p>
                  </div>

                  {/* مؤشر غير مقروء */}
                  {isUnread && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}

                  {/* زر الحذف (يظهر عند hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    title="Delete notification"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer button ── */}
      <button
        onClick={() => router.push('/notifications')}
        className="w-full mt-4 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
      >
        Show all notifications
        <ChevronLeft size={13} />
      </button>
    </motion.div>
  );
};

export default SidebarNotifications;