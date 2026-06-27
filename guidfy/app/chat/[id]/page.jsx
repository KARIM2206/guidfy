'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Loader2, ChevronLeft, Download
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useConversationQuery, useSendMessageMutation } from '@/app/hooks/useChatQueries';
import { getSocket } from '@/app/lib/socket';
import { useSocket } from '@/app/hooks/useSocket';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dateStr = (d) => {
  const date = new Date(d);
  if (date.toDateString() === new Date().toDateString()) return 'Today';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

// ═══════════════════════════════════════════════════
// USER AVATAR
// ═══════════════════════════════════════════════════
// Deterministic color from name (same name = same color)
const AVATAR_COLORS = [
  'bg-rose-500',     'bg-pink-500',    'bg-fuchsia-500',
  'bg-violet-500',   'bg-indigo-500',  'bg-blue-500',
  'bg-cyan-500',     'bg-teal-500',    'bg-emerald-500',
  'bg-green-500',    'bg-yellow-500',  'bg-orange-500',
  'bg-red-500',      'bg-purple-600',  'bg-sky-500',
];
function getAvatarColor(name) {
  if (!name) return 'bg-gray-400';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ═══════════════════════════════════════════════════
// USER AVATAR
// ═══════════════════════════════════════════════════
function UserAvatar({ name, avatar, size = 10, online = false }) {
  const sizeMap = {
    8:  'w-8 h-8 text-xs',
    10: 'w-10 h-10 text-sm',
    12: 'w-12 h-12 text-base',
    14: 'w-14 h-14 text-lg',
  };
  const cls = sizeMap[size] || 'w-10 h-10 text-sm';
  const colorCls = getAvatarColor(name);

  return (
    <div className="relative flex-shrink-0">
      <div className={`${cls} rounded-full ${colorCls} flex items-center justify-center text-white font-bold overflow-hidden select-none`}>
        {avatar ? (
          <Image
            src={avatar.startsWith('http') ? avatar : `http://localhost:8000${avatar}`}
            unoptimized alt={name || '?'}
            width={56} height={56}
            className="object-cover w-full h-full"
          />
        ) : (
          <span>{name?.[0]?.toUpperCase() || '?'}</span>
        )}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE — Chat with a specific user
// ═══════════════════════════════════════════════════
export default function DirectChatPage() {
  const params = useParams();
  const router = useRouter();

  // The [id] in the URL is the receiver's user ID
  const receiverId = Number(params?.id);

  // Fetch receiver info from API
  const [receiver, setReceiver] = useState(null);
  const [receiverLoading, setReceiverLoading] = useState(true);

  useEffect(() => {
    if (!receiverId) return;
    setReceiverLoading(true);
    apiClient.get(`/users/${receiverId}/info`)
      .then((res) => {
        // Extract safely depending on if the response was unwrapped by an interceptor or not
        const userData = res?.data?.data || res?.data || res;
        setReceiver(userData?.id ? userData : null);
      })
      .catch(() => setReceiver({ id: receiverId, name: 'User', avatar: null, title: null }))
      .finally(() => setReceiverLoading(false));
  }, [receiverId]);

  const { user } = useAuthStore();
  useSocket();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Conversation query
  const { messages: currentMessages, isLoading: conversationLoading } = useConversationQuery(receiverId);
  const sendMessage = useSendMessageMutation();

  const prevMsgCount = useRef(0);

  // Only scroll to bottom when a NEW message arrives (count increases)
  useEffect(() => {
    const count = currentMessages.length;
    if (count > prevMsgCount.current) {
      prevMsgCount.current = count;
      messagesEndRef.current?.scrollIntoView({ behavior: count === 1 ? 'instant' : 'smooth' });
    }
  }, [currentMessages.length]);

  // Real-time: scroll on new socket message arriving
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [currentMessages.length]);

  // Group by date
  const groupedMessages = useMemo(() => {
    return currentMessages.reduce((acc, msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {});
  }, [currentMessages]);

  // Send handler
  const handleSend = useCallback(async () => {
    const text = inputVal.trim();
    if (!text || !receiverId) return;
    try {
      await sendMessage.mutateAsync({ receiverId, content: text });
      setInputVal('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Send error:', err);
    }
  }, [inputVal, receiverId, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handlePrintMessage = useCallback((content) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AI Career Readiness Report</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.8; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px; }
            pre { font-family: inherit; white-space: pre-wrap; font-size: 15px; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; float: right; font-weight: bold; margin-bottom: 20px;">
            🖨️ Print / Save as PDF
          </button>
          <div style="clear: both;"></div>
          <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <script>
            // Auto open print dialog when content loads
            window.onload = function() { setTimeout(() => window.print(), 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const isSelf = receiver?.id === user?.id;

  // ── Receiver loading skeleton
  if (receiverLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      {/* ─── Chat Header ─────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft size={22} />
        </button>

        <UserAvatar name={receiver?.name} avatar={receiver?.avatar} size={10} online />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
            {receiver?.name || 'User'}
          </p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            Online
          </p>
        </div>

        {receiver?.title && (
          <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full truncate max-w-[160px]">
            {receiver.title}
          </span>
        )}
      </div>

      {/* ─── Self-chat warning ────────────────────────── */}
      {isSelf && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-sm text-yellow-700 dark:text-yellow-400 text-center">
          You can't chat with yourself.
        </div>
      )}

      {/* ─── Messages Area ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-1 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-900">
        {/* Loading */}
        {conversationLoading && currentMessages.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!conversationLoading && currentMessages.length === 0 && !isSelf && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center gap-3"
          >
            <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Start a conversation with {receiver?.name?.split(' ')[0]}
            </p>
            <p className="text-sm text-gray-400">Your messages will appear here</p>
          </motion.div>
        )}

        {/* Grouped messages */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="pb-2">
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-[11px] font-medium text-gray-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-0.5 rounded-full whitespace-nowrap">
                {dateStr(msgs[0]?.createdAt)}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {msgs.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id || msg._id || `${msg.createdAt}-${msg.senderId}`}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Receiver avatar */}
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                          {receiver?.avatar ? (
                            <Image src={`http://localhost:8000${receiver.avatar}`} width={28} height={28} unoptimized alt="" className="object-cover w-full h-full" />
                          ) : receiver?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}

                      <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isMe
                            ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-gray-700'
                        }`}>
                          {msg.content}
                          
                          {/* Show Download PDF button if this looks like a report */}
                          {msg.content.includes('AI Career Readiness Report') && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => handlePrintMessage(msg.content)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-colors ${
                                  isMe 
                                    ? 'bg-white/20 hover:bg-white/30 text-white' 
                                    : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                }`}
                              >
                                <Download size={14} /> Download as PDF
                              </button>
                            </div>
                          )}
                        </div>
                        <p className={`text-[10px] mt-1 text-gray-400 ${isMe ? 'text-right' : 'text-left'}`}>
                          {timeStr(msg.createdAt)}
                          {isMe && <span className="ml-1 text-violet-300">✓✓</span>}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ──────────────────────────────── */}
      {!isSelf && (
        <div className="sticky bottom-0 px-4 sm:px-8 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            {/* Current user avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <Image src={`http://localhost:8000${user.avatar}`} width={32} height={32} unoptimized alt="" className="object-cover w-full h-full" />
              ) : user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 dark:focus-within:ring-violet-900/30 transition-all">
              <textarea
                ref={textareaRef}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${receiver?.name?.split(' ')[0] || 'user'}…`}
                rows={1}
                className="w-full px-4 py-2.5 text-sm bg-transparent focus:outline-none resize-none max-h-28 leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputVal.trim() || sendMessage.isPending}
              className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-200 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-md flex-shrink-0"
            >
              {sendMessage.isPending
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send size={18} />
              }
            </motion.button>
          </div>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
