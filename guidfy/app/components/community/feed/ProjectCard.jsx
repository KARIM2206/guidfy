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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full"
    >
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3 flex-1">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Code2 size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                <a
                  href={`/project/${id}`}
                  className="hover:text-green-500 text-wrap dark:hover:text-green-400 transition-colors"
                >
                  {title}
                </a>
              </h3>
              <div className="flex flex-wrap items-center gap-1 mt-1 text-xs sm:text-sm">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded truncate">
                  {community}
                </span>
                {isFeatured && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded flex items-center gap-1 truncate">
                    <Star size={12} />
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {demoUrl && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink size={12} />
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
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-lg transition-colors"
              >
                <Code2 size={12} />
                <span>Code</span>
              </motion.a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-lg truncate"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats & Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          {/* Stats */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} />
              <span>{stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork size={14} />
              <span>{forks}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{watchers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{contributors.length}</span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            <Calendar size={12} />
            <span>Updated {lastUpdated}</span>
          </div>
        </div>

        {/* Contributors (Avatars) */}
        {contributors.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>Contributors</span>
              <span>{contributors.length} developers</span>
            </div>
            <div className="flex -space-x-1 sm:-space-x-2 mt-2 sm:mt-3">
              {contributors.slice(0, 5).map((contributor, index) => (
                <div
                  key={index}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-600"
                  title={contributor}
                />
              ))}
              {contributors.length > 5 && (
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
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
