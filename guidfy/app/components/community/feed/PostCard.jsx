'use client';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import { timeAgo } from '@/lib/timeAgo';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Eye,
  Clock,
  User,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useDeletePost } from '@/app/hooks/useCommunityQuery';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import CreateModal from './CreateModal';
import CodeBlock from '@/app/components/ui/CodeBlock';
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
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
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
function countVisualLines(body = '') {
  if (!body) return 0;
  const codeBlocks = (body.match(/```[\s\S]*?```/g) || []);
  const codeLines  = codeBlocks.reduce((sum, b) => sum + Math.max(6, b.split('\n').length), 0);
  const stripped   = body.replace(/```[\s\S]*?```/g, '');
  const textLines  = stripped.split('\n').filter((l) => l.trim()).length;
  return codeLines + textLines;
}

// ─── Body renderer ────────────────────────────────
function CardBody({ body }) {
  if (!body) return null;

  if (/^```/.test(body.trim())) {
    const match = body.trim().match(/^```(\w+)?\s*\n?([\s\S]*?)\n?```$/);
    return <CodeBlock code={match?.[2] || ''} language={match?.[1] || 'javascript'} />;
  }

  if (body.includes('```')) {
    const segments = body.split(/(```(?:\w+)?\s*\n[\s\S]*?```)/g).filter(Boolean);
    return (
      <div className="space-y-3">
        {segments.map((seg, i) => {
          if (seg.startsWith('```')) {
            const m = seg.match(/^```(\w+)?\s*\n?([\s\S]*?)\n?```$/);
            return <CodeBlock key={i} code={m?.[2] || ''} language={m?.[1] || 'javascript'} />;
          }
          const trimmed = seg.trim();
          return trimmed ? <TextBlock key={i} text={trimmed} /> : null;
        })}
      </div>
    );
  }

  return <TextBlock text={body} />;
}

const PostCard = ({
  id,
  title,
  excerpt,
  body,
  image,
  tags = [],
  author,
  likes = 0,
  comments = 0,
  bookmarks = 0,
  views = 0,
  readTime = '5 min',
  isTrending = false,
  authorAvatar,
  authorId,
  isAuthor = false,
  createdAt = '1 day ago',
  community = 'Frontend',
  communityId,
}) => {
 

  const {domain}= useParams()
  const {user}=useAuth()
  const userId = user?.id;
  const router = useRouter();
  
  const isPostAuthor = isAuthor || (userId && authorId && userId === authorId);

  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body || excerpt);
  const [localTags, setLocalTags] = useState(tags);
  const [localViews, setLocalViews] = useState(views);

  useEffect(() => {
    setLocalTitle(title);
    setLocalBody(body || excerpt);
    setLocalTags(tags || []);
    setLocalViews(views);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, excerpt, tags?.join(','), views]);

  const COLLAPSE_THRESHOLD = 8;
  const visualLines = countVisualLines(localBody);
  const isLong = visualLines > COLLAPSE_THRESHOLD;
  const showToggle = isLong;

  const deletePostMutation = useDeletePost();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate({ communityId: communityId || 1, postId: id }); // Fallback communityId if missing
    }
    setShowMenu(false);
  };

  const { fetchVotes, addVote } = useCommunity();
  const [localLikes, setLocalLikes] = useState(likes);
  const [localUserVote, setLocalUserVote] = useState(0);

  const { socket } = useNotificationStore();

  useEffect(() => {
    // Initial fetch to get accurate current stats for this user
    const fetchData = async () => {
      const res = await fetchVotes(id, "POST");
      if (res?.data) {
        setLocalLikes(res.data.totalVotes);
        setLocalUserVote(res.data.userVote);
      }
    };
    fetchData();

    // Listen to real-time updates
    if (!socket) return;
    const handleStatsUpdate = (data) => {
      if (data.targetId === id && data.targetType === "POST") {
        if (data.type === "VOTES") {
          setLocalLikes(data.value);
        } else if (data.type === "VIEWS") {
          setLocalViews(data.value);
        }
      }
    };

    socket.on("community_stats_update", handleStatsUpdate);
    return () => socket.off("community_stats_update", handleStatsUpdate);
  }, [id, fetchVotes, socket]);

  const handleLike = async () => {
    const value = localUserVote === 1 ? 0 : 1;
    // optimistic update
    setLocalLikes(prev => prev + (value === 1 ? 1 : -1));
    setLocalUserVote(value);

    // Call addVote. If vote was 1 and value is 0, we send 1 to toggle it off (since addVote with same value deletes vote)
    // Wait, addVote deletes vote if same value is passed. 
    // In QuestionCard, addVote sends `value` (-1 or 1). If we send 1 and it was already 1, backend deletes it (change = -1).
    // So to toggle a like, we just always send 1!
    const res = await addVote({
      targetId: id,
      targetType: "POST",
      value: 1, 
    });

    // We can resync with backend response just in case
    if (res?.change !== undefined) {
      // we already optimistically updated, but we could sync if we want
    }
  };

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full"
    >
      {/* Image */}
      {image && (
        <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isTrending && (
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs sm:text-sm font-medium rounded-full">
              <TrendingUp size={12} />
              <span>Trending</span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col gap-3">
        {/* Community & Time */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 relative">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 truncate">
              {community}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {createdAt?.indexOf('T') !== -1 ? timeAgo(createdAt): createdAt}
            </span>
            <span>• {readTime} read</span>
          </div>

          {/* Action Menu for Author */}
          {isPostAuthor && (
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
        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
          <a
            href={`${domain?domain:community}/post/${id}`}
            className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          >
            {localTitle}
          </a>
        </h3>

        {/* Body Preview */}
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
        <div className="flex flex-wrap gap-2">
          {localTags.map((tag) => (
            <span
              key={tag}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm rounded-lg truncate"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mt-2">
          {/* Author */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 relative  sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer">
             {authorAvatar?
             <Image
                src={`http://localhost:8000${authorAvatar}`}
                alt={typeof author === 'string' ? author : author.name}

                  fill
                  unoptimized
                className="h-full w-full absolute rounded-full object-cover"
                onClick={() => {userId === authorId ? router.push('/profile') : router.push(`/profile/${author}`)}}
              />
             : <User
                size={14}
                className="text-white"
                onClick={() => router.push(`/profile/${author}`)}
              />}
            </div>
            <div>
              <span
        onClick={() => {userId === authorId ? router.push('/profile') : router.push(`/profile/${author}`)}}

                className="text-sm sm:text-base font-medium cursor-pointer hover:text-purple-500 text-gray-900 dark:text-white block truncate"
              >
                {typeof author === 'string' ? author : author.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                Software Engineer
              </span>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
            {/* Stats */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <button onClick={handleLike} className="p-1 hover:text-purple-500 transition-colors focus:outline-none">
                  <Heart size={14} className={localUserVote === 1 ? "fill-purple-500 text-purple-500" : ""} />
                </button>
                <span>{localLikes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{localViews}</span>
              </div>
            </div>

            {/* Action Buttons */}
        {   !isAuthor && <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`p-1 sm:p-2 transition-colors ${
                  localUserVote === 1 
                    ? "text-purple-500" 
                    : "text-gray-400 hover:text-purple-500 dark:hover:text-purple-400"
                }`}
                aria-label="Like"
              >
                <Heart size={16} className={localUserVote === 1 ? "fill-current" : ""} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 sm:p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                aria-label="Bookmark"
              >
                <Bookmark size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 sm:p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                aria-label="Share"
              >
                <Share2 size={16} />
              </motion.button>
            </div>}
          </div>
        </div>
      </div>

      <CreateModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        communityId={communityId || 1}
        communityName={community}
        defaultType="posts"
        editData={{
          id,
          title: localTitle,
          body: localBody,
          tags: localTags,
          type: 'posts',
          readTime,
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

export default PostCard;
