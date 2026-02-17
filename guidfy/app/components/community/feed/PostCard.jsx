'use client';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const PostCard = ({
  id,
  title,
  excerpt,
  image,
  tags = [],
  author,
  likes = 0,
  comments = 0,
  bookmarks = 0,
  views = 0,
  readTime = '5 min',
  isTrending = false,
  createdAt = '1 day ago',
  community = 'Frontend',
}) => {
  const router = useRouter();
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
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 truncate">
            {community}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {createdAt}
          </span>
          <span>• {readTime} read</span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
          <a
            href={`/post/${id}`}
            className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          >
            {title}
          </a>
        </h3>

        {/* Excerpt */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer">
              <User
                size={14}
                className="text-white"
                onClick={() => router.push(`/profile/${author}`)}
              />
            </div>
            <div>
              <span
                onClick={() => router.push(`/profile/${author}`)}
                className="text-sm sm:text-base font-medium cursor-pointer hover:text-purple-500 text-gray-900 dark:text-white block truncate"
              >
                {author}
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
                <Heart size={14} />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{views}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 sm:p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                aria-label="Like"
              >
                <Heart size={16} />
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
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
