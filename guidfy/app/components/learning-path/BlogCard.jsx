"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight, Heart, Bookmark, Share2 } from 'lucide-react';
import { useState } from 'react';

const BlogCard = ({ blog }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Add share functionality here
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.description,
        url: window.location.href,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white border border-gray-200 rounded-2xl 
                 overflow-hidden hover:shadow-2xl transition-all duration-300
                 hover:border-blue-100"
    >
      {/* Top Badge */}
      {blog.isFeatured && (
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 z-10"
        >
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 
                         text-white text-xs font-bold rounded-full shadow-lg">
            Featured
          </span>
        </motion.div>
      )}

      {/* Blog Image */}
      
     
      {/* Content */}
      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative w-10 h-10 md:w-12 md:h-12"
            >
              <Image
                src={blog.authorAvatar || blog.img}
                alt={blog.publisherName}
                fill
                sizes="48px"
                className="rounded-full border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 
                            border-2 border-white rounded-full" />
            </motion.div>
            
            <div className="flex flex-col">
              <h4 className="text-sm md:text-base font-semibold text-gray-800">
                {blog.publisherName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>{timeAgo(blog.publishedAt)}</span>
                {blog.readTime && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{blog.readTime} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="font-bold text-gray-800">{blog.views || 0}</div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
          </div>
        </div>

        {/* Blog Title & Description */}
        <div className="mb-4">
          <motion.h2
            className="text-xl md:text-2xl font-bold text-gray-900 mb-3 
                     line-clamp-2 group-hover:text-blue-600 transition-colors"
            layoutId={`blog-title-${blog.id}`}
          >
            {blog.title}
          </motion.h2>
          
          <p className="text-gray-600 text-sm md:text-base line-clamp-3">
            {truncateText(blog.description, 150)}
          </p>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs 
                         rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tag}
              </motion.span>
            ))}
            {blog.tags.length > 3 && (
              <span className="px-3 py-1 text-gray-500 text-xs">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Actions Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 
                       transition-colors group/like"
            >
              <motion.div
                animate={{ scale: isLiked ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Heart
                  size={20}
                  className={isLiked ? 'fill-red-500 text-red-500' : ''}
                />
              </motion.div>
              <span className="text-sm">{blog.likes || 0}</span>
            </motion.button>

            {/* Bookmark Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Bookmark
                size={20}
                className={isBookmarked ? 'fill-blue-500 text-blue-500' : ''}
              />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 size={20} />
            </motion.button>
          </div>

          {/* Read More Button */}
          <motion.button
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 
                     to-blue-600 text-white text-sm font-semibold rounded-lg
                     hover:from-blue-600 hover:to-blue-700 transition-all 
                     shadow-md hover:shadow-lg group/readmore"
          >
            Read More
            <ArrowRight 
              size={16} 
              className="group-hover/readmore:translate-x-1 transition-transform" 
            />
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 
                    rounded-2xl pointer-events-none transition-all duration-300" />
    </motion.div>
  );
};

export default BlogCard;