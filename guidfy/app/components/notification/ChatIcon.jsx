'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Circle } from 'lucide-react';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChatIcon() {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const { inbox, fetchInbox, conversations, fetchConversation, sendMessage, chatLoading } = useNotifications();

  const [activeUser, setActiveUser]   = useState(null);
  const [inputVal,   setInputVal]     = useState('');
  const messagesEndRef                = useRef(null);

  const totalUnread = inbox.reduce((s, i) => s + (i.unreadCount || 0), 0);

  useEffect(() => {
    if (open) fetchInbox();
  }, [open]);

  useEffect(() => {
    if (activeUser) fetchConversation(activeUser.id);
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeUser]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async () => {
    if (!inputVal.trim() || !activeUser) return;
    await sendMessage(activeUser.id, inputVal.trim());
    setInputVal('');
  };

  const currentMessages = activeUser ? (conversations[activeUser.id] || []) : [];

  const timeStr = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const Avatar = ({ name, avatar, size = 8 }) => (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden`}>
      {avatar ? <Image src={`http://localhost:8000${avatar}`} unoptimized alt={name} width={32} height={32} className="object-cover w-full h-full" /> : name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <MessageSquare size={20} className="text-gray-600" />
        <AnimatePresence>
          {totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
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
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden flex flex-col"
            style={{ height: 420 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {activeUser ? (
                  <button onClick={() => setActiveUser(null)} className="p-1 rounded-lg hover:bg-white/60 transition-colors">
                    <X size={14} className="text-gray-500" />
                  </button>
                ) : (
                  <MessageSquare size={16} className="text-emerald-600" />
                )}
                <span className="font-semibold text-gray-800 text-sm">
                  {activeUser ? activeUser.name : 'Messages'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { router.push(`/${user?.role?.toLowerCase().replace('_', '-')}/dashboard/chat`); setOpen(false); }}
                  className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Open
                </button>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            {!activeUser ? (
              // ── Inbox List ─────────────────────────────────
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {chatLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                )}
                {!chatLoading && inbox.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No conversations yet</p>
                  </div>
                )}
                {inbox.map((item) => (
                  <motion.button
                    key={item.user.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => setActiveUser(item.user)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  >
                    <div className="relative">
                      <Avatar name={item.user.name} avatar={item.user.avatar} size={9} />
                      <Circle size={8} className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.user.name}</p>
                        {item.unreadCount > 0 && (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.lastMessage?.content || '...'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              // ── Conversation ───────────────────────────────
              <>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50/50">
                  {chatLoading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                    </div>
                  )}
                  {currentMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs shadow-sm ${
                          isMe
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-0.5 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {timeStr(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-2 border-t border-gray-100 flex gap-2 flex-shrink-0">
                  <input
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!inputVal.trim()}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-xl transition-colors"
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}