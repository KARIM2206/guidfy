'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Hash,
  Code2,
  Database,
  Smartphone,
  Cloud,
  Shield,
  TrendingUp,
  Star,
  Users,
  BookOpen,
  PlusCircle,
  Globe
} from 'lucide-react';

const communities = [
  { id: 1, name: 'All Communities', icon: Home, path: '/community/feed', count: null },
  { id: 2, name: 'Frontend', icon: Code2, path: '/community/frontend', count: '2.5k' },
  { id: 3, name: 'Backend', icon: Database, path: '/community/backend', count: '1.8k' },
  { id: 4, name: 'Mobile', icon: Smartphone, path: '/community/mobile', count: '890' },
  { id: 5, name: 'DevOps', icon: Cloud, path: '/community/devops', count: '1.2k' },
  { id: 6, name: 'Security', icon: Shield, path: '/community/security', count: '540' },
  { id: 7, name: 'AI/ML', icon: TrendingUp, path: '/community/ai-ml', count: '3.1k' },
  { id: 8, name: 'Fullstack', icon: Globe, path: '/community/fullstack', count: '1.5k' },
  { id: 9, name: 'Blockchain', icon: Shield, path: '/community/blockchain', count: '420' },
  { id: 10, name: 'Data Science', icon: TrendingUp, path: '/community/data-science', count: '1.1k' },
];

const popularTags = [
  { id: 1, name: 'react', count: 1245 },
  { id: 2, name: 'nextjs', count: 890 },
  { id: 3, name: 'tailwind', count: 567 },
  { id: 4, name: 'typescript', count: 1234 },
  { id: 5, name: 'nodejs', count: 978 },
  { id: 6, name: 'python', count: 1567 },
  { id: 7, name: 'docker', count: 845 },
  { id: 8, name: 'kubernetes', count: 623 },
];

export default function CommunitySidebar() {
  const router = useRouter();
  const [activeCommunity, setActiveCommunity] = useState(1);

  const handleCommunityClick = (community) => {
    setActiveCommunity(community.id);
    router.push(community.path);
  };

  const handleTagClick = (tagName) => {
    router.push(`/community/search?q=${encodeURIComponent(tagName)}&type=tag`);
  };

  const handleCreateCommunity = () => {
    // In a real app, this would open a modal or navigate to creation page
    console.log('Create community clicked');
    // router.push('/community/create');
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden lg:block">
      <div className="p-6">
        {/* Communities Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Communities
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {communities.length - 1} total
            </span>
          </div>
          <ul className="space-y-1">
            {communities.map((community) => {
              const Icon = community.icon;
              const isActive = activeCommunity === community.id;

              return (
                <motion.li
                  key={community.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handleCommunityClick(community)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    aria-label={`Navigate to ${community.name}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} />
                      <span className="text-sm font-medium">{community.name}</span>
                    </div>
                    {community.count && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${isActive
                          ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                        {community.count}
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Create Community Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateCommunity}
          className="w-full mb-8 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
          aria-label="Create new community"
        >
          <PlusCircle size={18} />
          <span>Create Community</span>
        </motion.button>

        {/* Popular Tags */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Popular Tags
            </h3>
            <Star size={14} className="text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <motion.button
                key={tag.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagClick(tag.name)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors group"
                aria-label={`Browse ${tag.name} tagged content`}
              >
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  #{tag.name}
                </span>
                <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {tag.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <div className="space-y-2">
            {[
              { icon: Users, label: 'Top Contributors', path: '/community/contributors' },
              { icon: BookOpen, label: 'Documentation', path: '/docs' },
              { icon: TrendingUp, label: 'Trending', path: '/community/trending' },
              { icon: Star, label: 'Featured', path: '/community/featured' },
            ].map((link, index) => (
              <motion.button
                key={index}
                onClick={() => router.push(link.path)}
                whileHover={{ x: 4 }}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded-lg transition-colors w-full text-left"
                aria-label={`Navigate to ${link.label}`}
              >
                <link.icon size={16} />
                <span className="text-sm">{link.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Recently Viewed
          </h3>
          <div className="space-y-2">
            {[
              { name: 'React Hooks Guide', type: 'post', time: '2h ago' },
              { name: 'Node.js Performance', type: 'question', time: '5h ago' },
            ].map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${item.type === 'post' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                  <span className="text-sm truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* User Stats */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Your Activity</span>
            <span className="font-medium text-gray-900 dark:text-white">42</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Communities</span>
            <span className="font-medium text-gray-900 dark:text-white">8</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Reputation</span>
            <span className="font-medium text-green-600 dark:text-green-400">1,245</span>
          </div>
        </div>
      </div>
    </aside>
  );
}