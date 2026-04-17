'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Search, Circle,
  ArrowLeft, MoreVertical, Phone, Video,
} from 'lucide-react';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import Image from 'next/image';
import { getAllUsers } from '@/services/auth';

export default function ChatPage() {
  const { user ,token} = useAuth();
  const {
    inbox, fetchInbox,
    conversations, fetchConversation,
    sendMessage, chatLoading,
  } = useNotifications();
const [allUsers, setAllUsers] = useState([]);
 const [roleFilter, setRoleFilter] = useState('');
  const [activeUser,   setActiveUser]   = useState(null);
  const [inputVal,     setInputVal]     = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [mobileView,   setMobileView]   = useState('list'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchInbox(); }, []);
useEffect(() => {
  if (!token || !user) return; // 🔥 الحل هنا

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers({ token });

      const filtered = res.data.filter(u =>
        ['ADMIN', 'SUPER_ADMIN'].includes(u.role) &&
        u.id !== user.id
      );

      setAllUsers(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  fetchUsers();
}, [token, user]);

  useEffect(() => {
    if (activeUser) {
      fetchConversation(activeUser.id);
      setMobileView('chat');
    }
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeUser]);

  const handleSend = async () => {
    if (!inputVal.trim() || !activeUser) return;
    await sendMessage(activeUser.id, inputVal.trim());
    setInputVal('');
  };

  const currentMessages = activeUser ? (conversations[activeUser.id] || []) : [];
  const mergedUsers = allUsers.map(userItem => {
  const existing = inbox.find(i => i.user.id === userItem.id);

  return existing || {
    user: userItem,
    lastMessage: null,
    unreadCount: 0,
  };
});
  const filteredInbox = mergedUsers.filter(i =>
    i.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = (d) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return timeStr(d);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const Avatar = ({ name, avatar, size = 10 }) => (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden`}
      style={{ fontSize: size < 10 ? 11 : 14 }}>
      {avatar
        ? <Image src={`http://localhost:8000${avatar}`} unoptimized alt={name || ''} width={40} height={40} className="object-cover w-full h-full" />
        : (name?.[0]?.toUpperCase() || '?')
      }
    </div>
  );

  // Group messages by date
  const groupedMessages = currentMessages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">

      {/* ─── Sidebar / Inbox ──────────────────────────────────── */}
      <div className={`
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 lg:w-96 flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0
      `}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
        </div>

        {/* Inbox List */}
        <div className="flex-1 overflow-y-auto">
          {chatLoading && inbox.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
          {!chatLoading && filteredInbox.length === 0 && (
            <div className="text-center py-16 px-4">
              <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No conversations</p>
              <p className="text-xs text-gray-300 mt-1">Messages will appear here</p>
            </div>
          )}
          <AnimatePresence>
            {filteredInbox.map((item) => {
              const isActive = activeUser?.id === item.user.id;
              return (
                <motion.button
                  key={item.user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveUser(item.user)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all border-b border-gray-50 ${
                    isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Avatar name={item.user.name} avatar={item.user.avatar} size={10} />
                    <Circle size={10} className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${item.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {item.user.name}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {dateStr(item.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate">
                        {item.lastMessage?.senderId === user?.id ? '✓ ' : ''}
                        {item.lastMessage?.content || '...'}
                      </p>
                      {item.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ml-1 flex-shrink-0">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Chat Area ────────────────────────────────────────── */}
      <div className={`
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        flex-1 flex-col min-w-0
      `}>

        {!activeUser ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-4"
            >
              <MessageSquare size={36} className="text-indigo-300" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Select a conversation</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Choose from your inbox to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setMobileView('list'); setActiveUser(null); }}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div className="relative">
                  <Avatar name={activeUser.name} avatar={activeUser.avatar} size={10} />
                  <Circle size={10} className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{activeUser.name}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online • {activeUser.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <MoreVertical size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {chatLoading && currentMessages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      {date === new Date().toDateString() ? 'Today' : date}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Messages */}
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {msgs.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.15 }}
                            className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            {!isMe && <Avatar name={activeUser.name} avatar={activeUser.avatar} size={7} />}
                            <div className={`max-w-[65%] group`}>
                              <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                              }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                              </div>
                              <p className={`text-[10px] mt-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                                {timeStr(msg.createdAt)}
                                {isMe && <span className="ml-1 text-indigo-300">✓✓</span>}
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

            {/* Input Area */}
            <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <textarea
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none resize-none max-h-28 leading-relaxed"
                    style={{ overflow: 'hidden' }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputVal.trim()}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-2xl transition-colors shadow-md flex-shrink-0"
                >
                  <Send size={18} />
                </motion.button>
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5 ml-1">Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}