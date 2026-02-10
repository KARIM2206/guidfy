// components/profile/UserPosts.jsx
import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, Bookmark, Clock, TrendingUp } from 'lucide-react';

const UserPosts = ({ username }) => {
  const posts = [
    {
      id: 1,
      title: 'Building Scalable React Applications with TypeScript',
      excerpt: 'A comprehensive guide to architecting large-scale React applications with TypeScript, including patterns for state management...',
      likes: 245,
      comments: 42,
      views: 8900,
      bookmarks: 124,
      readTime: '8 min',
      published: '2 days ago',
      trending: true
    },
    {
      id: 2,
      title: 'The Future of State Management in React 18',
      excerpt: 'Exploring the latest state management patterns and how React 18 features are changing the landscape...',
      likes: 189,
      comments: 28,
      views: 6700,
      bookmarks: 89,
      readTime: '6 min',
      published: '1 week ago',
      trending: false
    },
    {
      id: 3,
      title: 'Advanced TypeScript Patterns for React Developers',
      excerpt: 'Deep dive into advanced TypeScript patterns including conditional types, mapped types, and type guards...',
      likes: 156,
      comments: 19,
      views: 4500,
      bookmarks: 67,
      readTime: '12 min',
      published: '2 weeks ago',
      trending: true
    }
  ];

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Stats */}
            <div className="lg:w-24 flex lg:flex-col items-center justify-between lg:justify-start">
              <div className="flex lg:flex-col items-center lg:space-y-2">
                <div className="flex items-center space-x-2 lg:space-x-0 lg:flex-col">
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Heart size={16} />
                    <span className="font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <MessageSquare size={16} />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
                
                <div className="lg:mt-4 flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2">
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Eye size={16} />
                    <span className="font-medium">{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Bookmark size={16} />
                    <span className="font-medium">{post.bookmarks}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {post.trending && (
                    <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <TrendingUp size={10} />
                      Trending
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {post.published}
                  </span>
                </div>
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {post.readTime} read
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Read More
                  </button>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium">
                    Edit
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(post.views / 1000)}k views
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default UserPosts;