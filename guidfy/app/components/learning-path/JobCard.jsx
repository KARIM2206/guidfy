"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Heart, Bookmark, Share2, ArrowRight } from 'lucide-react';

const JobCard = ({ job }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
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
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: job.description,
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
                 hover:border-blue-100 p-6"
    >
      {/* Top Badge */}
      {job.isFeatured && (
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

      {/* Job Info */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {job.title}
        </h2>
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <Briefcase size={16} />
          <span>{job.company}</span>
          <span className="text-gray-300">•</span>
          <MapPin size={16} />
          <span>{job.location}</span>
        </div>
        <p className="text-gray-600 text-sm md:text-base line-clamp-3">
          {job.description}
        </p>
      </div>

      {/* Posted Time */}
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
        <Clock size={14} />
        <span>{timeAgo(job.postedAt)}</span>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <motion.div
              animate={{ scale: isLiked ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Heart size={20} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            </motion.div>
            <span className="text-sm">{job.likes || 0}</span>
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Bookmark size={20} className={isBookmarked ? 'fill-blue-500 text-blue-500' : ''} />
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

        {/* Apply Button */}
        <motion.button
          whileHover={{ x: 5 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 
                     to-blue-600 text-white text-sm font-semibold rounded-lg
                     hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Apply Now
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 
                    rounded-2xl pointer-events-none transition-all duration-300" />
    </motion.div>
  );
};

export default JobCard;
