"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, ArrowRight, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const ProjectCard = ({ project }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
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
                 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Project Image */}
      {project.image && (
        <div className="relative w-full h-48 md:h-56 lg:h-64">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover rounded-t-2xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Technologies */}
        {project.technologies && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full 
                           hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-sm">{project.likes || 0}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 size={18} />
            </motion.button>
          </div>

          {/* Links */}
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <Github size={20} />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
