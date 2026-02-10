// components/profile/UserProjects.jsx
import { motion } from 'framer-motion';
import { Star, GitFork, Eye, Users, Calendar, Code2, ExternalLink } from 'lucide-react';

const UserProjects = ({ username }) => {
  const projects = [
    {
      id: 1,
      name: 'React Admin Dashboard',
      description: 'A modern admin dashboard template built with React, TypeScript, and Tailwind CSS.',
      tech: ['react', 'typescript', 'tailwind'],
      stars: 890,
      forks: 234,
      watchers: 1450,
      lastUpdated: '2 days ago',
      isFeatured: true
    },
    {
      id: 2,
      name: 'UI Component Library',
      description: 'A comprehensive component library with accessibility and theming support.',
      tech: ['react', 'storybook', 'jest'],
      stars: 456,
      forks: 89,
      watchers: 780,
      lastUpdated: '1 week ago',
      isFeatured: false
    },
    {
      id: 3,
      name: 'Real-time Chat App',
      description: 'A full-stack real-time chat application using Socket.io and React.',
      tech: ['socket.io', 'react', 'nodejs'],
      stars: 234,
      forks: 67,
      watchers: 1200,
      lastUpdated: '3 weeks ago',
      isFeatured: true
    }
  ];

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <motion.article
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 size={24} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    {project.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Star size={16} />
                  <span className="text-sm font-medium">{project.stars}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <GitFork size={16} />
                  <span className="text-sm font-medium">{project.forks}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Eye size={16} />
                  <span className="text-sm font-medium">{project.watchers}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 ml-auto">
                  <Calendar size={16} />
                  <span className="text-sm">Updated {project.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default UserProjects;