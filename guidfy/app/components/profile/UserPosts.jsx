import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, Bookmark, Clock, TrendingUp } from 'lucide-react';
import PostCard from '../community/feed/PostCard';

// Helper: format date from ISO string to readable format (e.g., "Mar 12, 2026")
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper: estimate read time from body text (approx. 200 words per minute)
const estimateReadTime = (body) => {
  if (!body) return '1 min';
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
};

// Helper: generate excerpt from body (first 120 chars)
const getExcerpt = (body, maxLength = 120) => {
  if (!body) return '';
  if (body.length <= maxLength) return body;
  return body.slice(0, maxLength).trim() + '…';
};

// ───────────────────────────────
// Skeleton Card Component
// ───────────────────────────────
const PostSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Stats skeleton */}
        <div className="lg:w-24 flex lg:flex-col items-center justify-between lg:justify-start">
          <div className="flex lg:flex-col items-center gap-3 lg:gap-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <motion.div
            className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="space-y-2">
            <motion.div
              className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-4">
              <motion.div
                className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ───────────────────────────────
// Main Component
// ───────────────────────────────
const UserPosts = ({ posts = [], loading }) => {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!posts.length) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        // Prepare display values
        const publishedDate = formatDate(post.createdAt);
        const readTime = post.readTime ? `${post.readTime} min` : estimateReadTime(post.body);
        const excerpt = getExcerpt(post.body);
        const likes = post.likes ?? 0;
        const views = post.views ?? 0;
        const bookmarks = post.bookmarks ?? 0;
        // Comments field is not present in the API response; default to 0
        const comments = 0;

        return (
       <PostCard
          key={post.id}
          id={post.id}
          title={post.title}
          excerpt={excerpt}
          image={post.image}
          tags={post.tags}
          author={post.author?.name}
          authorAvatar={post.author?.avatar}
          authorId={post.author?.id}
          likes={likes}
          comments={comments}
          bookmarks={bookmarks}
          views={views}
          readTime={readTime}
          isTrending={likes > 100}
          createdAt={publishedDate}
          community={post.community}
         isAuthor={true}
        />
        );
      })}
    </div>
  );
};

export default UserPosts;