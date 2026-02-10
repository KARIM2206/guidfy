// components/feed/PostCard.jsx
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Image (if exists) */}
      {image && (
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isTrending && (
            <div className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
              <TrendingUp size={12} />
              <span>Trending</span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Community & Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded">
              {community}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock size={12} className="mr-1" />
              {createdAt}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              • {readTime} read
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          <a
            href={`/post/${id}`}
            className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          >
            {title}
          </a>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <User size={18} onClick={() => router.push(`/profile/${author}`)} className="text-white" />
            </div>
            <div>
              <span onClick={() => router.push(`/profile/${author}`)} className="text-sm font-medium cursor-pointer hover:text-purple-500 text-gray-900 dark:text-white block">
                {author}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Software Engineer
              </span>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center space-x-4">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Heart size={16} />
                <span className="text-sm">{likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare size={16} />
                <span className="text-sm">{comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span className="text-sm">{views}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                aria-label="Like"
              >
                <Heart size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                aria-label="Bookmark"
              >
                <Bookmark size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                aria-label="Share"
              >
                <Share2 size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;