"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Heart, Bookmark, Share2, ArrowRight, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

const JobCard = ({ job, onViewDetails, showMatchScore }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const postedTime = new Date(timestamp).getTime();
    if (isNaN(postedTime)) return 'Invalid date';
    const now = Date.now();
    const diff = now - postedTime;
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
        url: job.applyLink || window.location.href,
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
                 hover:border-blue-100 p-6 flex flex-col h-full"
    >
      {/* Top Badges */}
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

      {/* Match Score Badge */}
      {showMatchScore && job.score !== undefined && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 
                         text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
            <Sparkles size={12} />
            {Math.round(job.score )}% match
          </span>
        </div>
      )}

      {/* Job Info */}
      <div className="mb-4 flex-grow">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {job.title}
        </h2>
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2 flex-wrap">
          <Briefcase size={16} />
          <span>{job.company}</span>
          <span className="text-gray-300">•</span>
          <MapPin size={16} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
            {job.jobType?.replace('_', ' ')}
          </span>
        </div>
        <p className="text-gray-600 text-sm md:text-base line-clamp-3">
          {job.description}
        </p>
      </div>

      {/* Skills Preview (if recommendation) */}
      {showMatchScore && (job.matchedSkills?.length > 0 || job.missingSkills?.length > 0) && (
        <div className="mb-4 space-y-2">
          {job.matchedSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.matchedSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full flex items-center gap-1">
                  <CheckCircle size={10} />
                  {skill}
                </span>
              ))}
              {job.matchedSkills.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{job.matchedSkills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Posted Time */}
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
        <Clock size={14} />
        <span>{timeAgo(job?.postedAt) =='Unknown' ? timeAgo(job?.createdAt) : timeAgo(job?.postedAt)}</span>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <motion.div
              animate={{ scale: isLiked ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            </motion.div>
            <span className="text-xs">{job.likes || 0}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Bookmark size={18} className={isBookmarked ? 'fill-blue-500 text-blue-500' : ''} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="text-gray-500 hover:text-green-500 transition-colors"
          >
            <Share2 size={18} />
          </motion.button>
        </div>

        {/* View Match Button (Recommendations) / Apply Now (All Jobs) */}
        {showMatchScore ? (
          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewDetails?.(job)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 
                     to-indigo-600 text-white text-sm font-semibold rounded-lg
                     hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles size={16} />
            View Match
          </motion.button>
        ) : (
          <motion.a
            href={job.applyLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 
                       to-blue-600 text-white text-sm font-semibold rounded-lg
                       hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Apply Now
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 
                    rounded-2xl pointer-events-none transition-all duration-300" />
    </motion.div>
  );
};

export default JobCard;