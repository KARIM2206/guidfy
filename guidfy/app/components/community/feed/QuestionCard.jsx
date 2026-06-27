'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Eye, Clock, User,
  CheckCircle, ChevronUp, ChevronDown, MoreVertical, Edit2, Trash2,
} from 'lucide-react';
import { useDeleteQuestion, useUpdateQuestion } from '@/app/hooks/useCommunityQuery';
import Link from 'next/link';
import CodeBlock from '@/app/components/ui/CodeBlock';
import { timeAgo } from '@/lib/timeAgo';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import AnswerModal from './AnswerModal';
import CreateModal from './CreateModal';
import { useNotificationStore } from '@/lib/stores/notificationStore';

// ─── Inline code ──────────────────────────────────
function renderInlineCode(text) {
  return text.split(/`([^`]+)`/g).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-xs font-mono">
        {part}
      </code>
    ) : part
  );
}

// ─── Text renderer ────────────────────────────────
function TextBlock({ text }) {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {renderInlineCode(line)}
          {i !== arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

// ─── Count "visual lines" for threshold ───────────
// الكود بيحسب السطور الفعلية (نص + كود)
function countVisualLines(body = '') {
  if (!body) return 0;
  // كل code block = 6 سطور بصرية على الأقل
  const codeBlocks = (body.match(/```[\s\S]*?```/g) || []);
  const codeLines  = codeBlocks.reduce((sum, b) => sum + Math.max(6, b.split('\n').length), 0);
  const stripped   = body.replace(/```[\s\S]*?```/g, '');
  const textLines  = stripped.split('\n').filter((l) => l.trim()).length;
  return codeLines + textLines;
}

// ─── Body renderer ────────────────────────────────
function CardBody({ body }) {
  if (!body) return null;

  // حالة 1: كل النص كود واحد
  if (/^```/.test(body.trim())) {
    const match = body.trim().match(/^```(\w+)?\s*\n?([\s\S]*?)\n?```$/);
    return (
      <CodeBlock
        code={match?.[2] || ''}
        language={match?.[1] || 'javascript'}
      />
    );
  }

  // حالة 2: نص مختلط بكود
  if (body.includes('```')) {
    const segments = body.split(/(```(?:\w+)?\s*\n[\s\S]*?```)/g).filter(Boolean);
    return (
      <div className="space-y-3">
        {segments.map((seg, i) => {
          if (seg.startsWith('```')) {
            const m = seg.match(/^```(\w+)?\s*\n?([\s\S]*?)\n?```$/);
            return (
              <CodeBlock key={i} code={m?.[2] || ''} language={m?.[1] || 'javascript'} />
            );
          }
          const trimmed = seg.trim();
          return trimmed ? <TextBlock key={i} text={trimmed} /> : null;
        })}
      </div>
    );
  }

  // حالة 3: نص عادي
  return <TextBlock text={body} />;
}

// ═══════════════════════════════════════════════════
//  QUESTION CARD
// ═══════════════════════════════════════════════════
const COLLAPSE_THRESHOLD = 8; // سطور بصرية

const QuestionCard = ({
  id, title, body, tags = [],
  author, authorAvatar,
  votes = 0, answers = 0, views = 0,
  isAnswered = false, createdAt, community = 'Frontend', communityId, authorId
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const isAuthor = (currentUserId && authorId && currentUserId === authorId) || (currentUserId && author?.id && currentUserId === author.id);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  const deleteQuestionMutation = useDeleteQuestion();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate({ communityId: communityId || 1, questionId: id });
    }
    setShowMenu(false);
  };
  const [expanded, setExpanded] = useState(false);

  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body);
  const [localTags, setLocalTags] = useState(tags);
  const [localViews, setLocalViews] = useState(views);

  useEffect(() => {
    setLocalTitle(title);
    setLocalBody(body);
    setLocalTags(tags || []);
    setLocalViews(views);
  }, [title, body, tags, views]);

  const {fetchVotes,addVote}=useCommunity();
  const [localVotes, setLocalVotes] = useState(0);
  const [localUserVote, setLocalUserVote] = useState(0);
  const visualLines   = countVisualLines(localBody);
  const isLong        = visualLines > COLLAPSE_THRESHOLD;
  const showToggle    = isLong;

  const { socket } = useNotificationStore();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchVotes(id, "QUESTION");
      setLocalVotes(res.data.totalVotes);
      setLocalUserVote(res.data.userVote);
    };

    // أول تحميل
    fetchData();

    if (!socket) return;
    const handleStatsUpdate = (data) => {
      if (data.targetId === id && data.targetType === "QUESTION") {
        if (data.type === "VOTES") {
          setLocalVotes(data.value);
        } else if (data.type === "VIEWS") {
          setLocalViews(data.value);
        }
      }
    };

    socket.on("community_stats_update", handleStatsUpdate);
    return () => socket.off("community_stats_update", handleStatsUpdate);
  }, [id, fetchVotes, socket]);
const handleVote = async (value) => {
  const res = await addVote({
    targetId: id,
    targetType: "QUESTION",
    value,
  });

  // 🔥 optimistic update
  const change = res.change;

  setLocalVotes(prev => prev + change);

  setLocalUserVote(prev => {
    if (prev === value) return 0; // cancel
    if (prev === -value) return value; // switch
    return value; // new vote
  });
};
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="p-5 flex gap-4">

        {/* ── Votes ───────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <motion.button onClick={() => handleVote(1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-green-500 transition-colors" aria-label="Upvote">
            <ChevronUp size={18} />
          </motion.button>
          <span className="font-bold text-gray-900 dark:text-white tabular-nums">{localVotes}</span>
          <motion.button onClick={() => handleVote(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors" aria-label="Downvote">
            <ChevronDown size={18} />
          </motion.button>
          {isAnswered && <CheckCircle size={16} className="text-green-500 mt-1" />}
        </div>

        {/* ── Content ─────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500 relative">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
                {community}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {createdAt?.indexOf('T') !== -1 ? timeAgo(createdAt): createdAt}
              </span>
            </div>
            
            {/* Action Menu for Author */}
            {isAuthor && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                    <button 
                      onClick={() => { setIsEditModalOpen(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
            <Link href={`/community/question/${id}`}
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {localTitle}
            </Link>
          </h3>

          {/* Body — collapsible */}
          <div className="mb-3">
            <div className={`relative overflow-hidden transition-all duration-300 ${!expanded && isLong ? 'max-h-48' : ''}`}>
              <CardBody body={localBody} />
              {!expanded && isLong && (
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
              )}
            </div>

            {!expanded && showToggle && (
              <button
                onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
                className="mt-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {expanded ? '↑ Show less' : `↓ See more (${visualLines} lines)`}
              </button>
            )}
          </div>

          {/* Tags */}
          {localTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {localTags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {authorAvatar
                ? <img src={`http://localhost:8000${authorAvatar}`} alt={typeof author === 'string' ? author : author.name} className="w-6 h-6 rounded-full object-cover" />
                : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><User size={12} className="text-white" /></div>
              }
              <span className="truncate">{typeof author === 'string' ? author : author.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAnswerModalOpen(true)}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <MessageSquare size={13} /> {answers} answers
              </button>
              <span className="flex items-center gap-1"><Eye size={13} />{views} views</span>
            </div>
          </div>

        </div>
      </div>

      <AnswerModal 
        isOpen={isAnswerModalOpen} 
        onClose={() => setIsAnswerModalOpen(false)} 
        questionId={id} 
        communityId={communityId || 1} 
      />

      <CreateModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        communityId={communityId || 1}
        communityName={community}
        defaultType="questions"
        editData={{
          id,
          title: localTitle,
          body: localBody,
          tags: localTags,
          type: 'questions',
          communityId: communityId || 1,
        }}
        onSuccess={(updatedData) => {
          if (updatedData) {
            setLocalTitle(updatedData.title);
            setLocalBody(updatedData.body);
            setLocalTags(updatedData.tags);
          }
        }}
      />
    </motion.article>
  );
};

export default QuestionCard;