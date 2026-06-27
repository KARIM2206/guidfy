'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  Navigation,
  MessageSquare,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { useSocket } from '@/app/hooks/useSocket';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { timeAgo } from '@/lib/timeAgo';
import Image from 'next/image';

export default function TopNavbar() {
  const { openSidebar, setOpenSidebar } = useCommunity();
  const { user } = useAuthStore();
  const { realtimeNotifications, socket } = useNotificationStore();
  useSocket();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  const notifRef = useRef(null);
  const chatRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (chatRef.current && !chatRef.current.contains(e.target)) setShowChat(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    setNotiLoading(true);
    try {
      const res = await apiClient.get('/notifications?page=1&limit=10');
      const data = res.data?.data || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setNotiLoading(false);
    }
  };

  // Fetch inbox
  const fetchInbox = async () => {
    setInboxLoading(true);
    try {
      const res = await apiClient.get('/chat/inbox');
      const data = res.data?.data || res.data || [];
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setInboxLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  useEffect(() => {
    if (showChat) fetchInbox();
  }, [showChat]);

  // Merge realtime notifications count
  const allNotifications = [
    ...realtimeNotifications,
    ...notifications.filter((n) => !realtimeNotifications.find((r) => r.id === n.id)),
  ];
  const unreadNotifCount = allNotifications.filter((n) => !n.isRead && !n.read).length;
  const unreadChatCount = inbox.reduce((acc, item) => acc + (item.unreadCount || 0), 0);

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch (e) { /* silent */ }
  };

  return (
    <nav className="sticky top-0 z-30 mx-auto bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4 text-gray-500 dark:text-gray-400"
              onClick={() => setOpenSidebar(!openSidebar)}
              aria-label="Toggle menu"
            >
              {openSidebar ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              <Navigation className="h-6 w-6 text-blue-500" />
              <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
                Guidfy
              </span>
            </div>
          </div>

          {/* ── Desktop Search ── */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="search"
                placeholder="Search questions, posts, projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                aria-label="Search"
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Search */}
            <button
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* ── Chat Icon ── */}
            <div ref={chatRef} className="relative">
              <button
                onClick={() => { setShowChat((v) => !v); setShowNotifications(false); }}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 dark:hover:text-violet-400 rounded-lg transition-colors"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
                {unreadChatCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-white" />
                )}
              </button>

              {/* Chat Dropdown */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Messages</h3>
                      <Link
                        href="/community/chat"
                        className="text-xs text-white/80 hover:text-white transition-colors"
                        onClick={() => setShowChat(false)}
                      >
                        Open chat →
                      </Link>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {inboxLoading && (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                        </div>
                      )}
                      {!inboxLoading && inbox.length === 0 && (
                        <div className="py-10 text-center text-sm text-gray-400">
                          No conversations yet
                        </div>
                      )}
                      {inbox.map((item) => (
                        <Link
                          key={item.user?.id}
                          href={`/chat/${item.user?.id}`}
                          onClick={() => setShowChat(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50"
                        >
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-violet-100 overflow-hidden flex items-center justify-center text-violet-700 font-bold text-sm">
                              {item.user?.avatar ? (
                                <Image src={`http://localhost:8000${item.user.avatar}`} width={36} height={36} unoptimized alt="" className="object-cover w-full h-full" />
                              ) : item.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{item.lastMessage?.content || '…'}</p>
                          </div>
                          {item.unreadCount > 0 && (
                            <span className="bg-violet-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                              {item.unreadCount}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Notifications Icon ── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setShowNotifications((v) => !v); setShowChat(false); }}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Notifications
                        {unreadNotifCount > 0 && (
                          <span className="ml-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {unreadNotifCount}
                          </span>
                        )}
                      </h3>
                      {unreadNotifCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors">
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notiLoading && (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                      {!notiLoading && allNotifications.length === 0 && (
                        <div className="py-10 text-center text-sm text-gray-400">
                          No notifications yet
                        </div>
                      )}
                      {allNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 transition-colors ${
                            !n.isRead && !n.read
                              ? 'bg-blue-50/50 dark:bg-blue-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                              {n.message || n.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {n.createdAt ? timeAgo(n.createdAt) : 'Just now'}
                            </p>
                          </div>
                          {(!n.isRead && !n.read) && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── User Avatar ── */}
            <Link
              href="/profile"
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="User menu"
            >
              {user?.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-violet-200 dark:border-violet-700">
                  <Image
                    src={`http://localhost:8000${user.avatar}`}
                    width={32}
                    height={32}
                    unoptimized
                    alt={user.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-violet-200">
                  <User size={15} className="text-white" />
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-3 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}