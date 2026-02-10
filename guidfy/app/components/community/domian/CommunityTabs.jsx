// components/community/CommunityTabs.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Code2, Hash, Settings, BookOpen, Users, Award } from 'lucide-react';

const CommunityTabs = ({
  activeTab = 'questions',
  onTabChange
}) => {
  const tabs = [
    {
      id: 'questions',
      label: 'Questions',
      icon: MessageSquare,
      count: '18.7k',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'posts',
      label: 'Posts',
      icon: FileText,
      count: '9.3k',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Code2,
      count: '3.4k',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      count: '1.2k',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      count: '45.2k',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Award,
      count: null,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0
  });

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (tabRefs.current[activeIndex]) {
      const activeTabElement = tabRefs.current[activeIndex];
      const { offsetWidth, offsetLeft } = activeTabElement;
      
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="relative">
      <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const activeTabObj = tabs.find(t => t.id === activeTab);

          return (
            <motion.button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-lg flex items-center space-x-3 transition-all whitespace-nowrap ${isActive
                  ? `bg-gradient-to-r ${activeTabObj.color} text-white shadow-lg shadow-blue-500/20`
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon 
                size={18} 
                className={isActive ? 'text-white' : ''}
              />
              <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                {tab.label}
              </span>
              {tab.count && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {tab.count}
                </span>
              )}
              
              {/* Active Tab Dot Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabDot"
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active Indicator Line */}
      <motion.div
        className="absolute bottom-0 h-1 rounded-full"
        style={{
          width: indicatorStyle.width,
          left: indicatorStyle.left
        }}
        animate={{
          background: `linear-gradient(to right, ${(() => {
            const activeTabObj = tabs.find(t => t.id === activeTab);
            switch (activeTabObj?.color) {
              case 'from-blue-500 to-cyan-500':
                return '#3b82f6, #06b6d4';
              case 'from-purple-500 to-pink-500':
                return '#8b5cf6, #ec4899';
              case 'from-green-500 to-emerald-500':
                return '#10b981, #10b981';
              case 'from-orange-500 to-amber-500':
                return '#f97316, #f59e0b';
              case 'from-indigo-500 to-blue-500':
                return '#6366f1, #3b82f6';
                case 'from-yellow-500 to-orange-500':
                return '#eab308, #f97316';
              default:
                return '#3b82f6, #06b6d4';
            }
          })()})`
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.3
        }}
      />

      {/* Tab Content Background Glow */}
      <motion.div
        className="absolute -bottom-2 h-2 w-full opacity-0 blur-xl"
        animate={{
          opacity: 0.3,
          background: (() => {
            const activeTabObj = tabs.find(t => t.id === activeTab);
            switch (activeTabObj?.color) {
              case 'from-blue-500 to-cyan-500':
                return 'linear-gradient(to right, #3b82f6, #06b6d4)';
              case 'from-purple-500 to-pink-500':
                return 'linear-gradient(to right, #8b5cf6, #ec4899)';
              case 'from-green-500 to-emerald-500':
                return 'linear-gradient(to right, #10b981, #10b981)';
              case 'from-orange-500 to-amber-500':
                return 'linear-gradient(to right, #f97316, #f59e0b)';
              case 'from-indigo-500 to-blue-500':
                return 'linear-gradient(to right, #6366f1, #3b82f6)';
              case 'from-yellow-500 to-orange-500':
                return 'linear-gradient(to right, #eab308, #f97316)';
              default:
                return 'linear-gradient(to right, #3b82f6, #06b6d4)';
            }
          })()
        }}
        transition={{
          duration: 0.3
        }}
      />
    </div>
  );
};

export default CommunityTabs;