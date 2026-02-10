// components/feed/ProjectCard.jsx
import { motion } from 'framer-motion';
import {
  Star,
  GitFork,
  Eye,
  Users,
  Calendar,
  ExternalLink,
  Code2,
  TrendingUp,
} from 'lucide-react';

const ProjectCard = ({
  id,
  title,
  description,
  techStack = [],
  stars = 0,
  forks = 0,
  watchers = 0,
  contributors = [],
  lastUpdated = '2 weeks ago',
  isFeatured = false,
  demoUrl,
  repoUrl,
  community = 'Open Source',
}) => {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Code2 size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                <a
                  href={`/project/${id}`}
                  className="hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  {title}
                </a>
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded">
                  {community}
                </span>
                {isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded flex items-center">
                    <Star size={10} className="mr-1" />
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="flex items-center space-x-2">
            {demoUrl && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                <span>Demo</span>
              </motion.a>
            )}
            {repoUrl && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                <Code2 size={14} />
                <span>Code</span>
              </motion.a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats & Footer */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Star size={16} />
              <span className="text-sm font-medium">{stars}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <GitFork size={16} />
              <span className="text-sm font-medium">{forks}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Eye size={16} />
              <span className="text-sm font-medium">{watchers}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Users size={16} />
              <span className="text-sm font-medium">{contributors.length}</span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Calendar size={14} />
            <span className="text-sm">Updated {lastUpdated}</span>
          </div>
        </div>

        {/* Contributors (Avatars) */}
        {contributors.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Contributors
              </span>
              <span className="text-xs text-gray-400">
                {contributors.length} developers
              </span>
            </div>
            <div className="flex -space-x-2 mt-3">
              {contributors.slice(0, 5).map((contributor, index) => (
                <div
                  key={index}
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-600"
                  title={contributor}
                />
              ))}
              {contributors.length > 5 && (
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  +{contributors.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ProjectCard;