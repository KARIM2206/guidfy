// components/community/CommunityTabs.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Code2, Hash, Settings, BookOpen, Users, Award } from 'lucide-react';



const CommunityTabs = ({  activeTab, onTabChange }) => {
  const scrollRef = useRef(null);
  const tabRefs = useRef([]);

  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  const [hasScroll, setHasScroll] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
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
  // 🔥 تحديث مكان الخط تحت التاب
  const updateIndicator = () => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeEl = tabRefs.current[activeIndex];
    const scrollEl = scrollRef.current;

    if (!activeEl || !scrollEl) return;

    const left = activeEl.offsetLeft - scrollEl.scrollLeft;

    setIndicatorStyle({
      width: activeEl.offsetWidth,
      left,
    });
  };

  // 🔥 auto scroll للتاب النشط
  const scrollToActiveTab = () => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeEl = tabRefs.current[activeIndex];

    activeEl?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // 🔥 check scroll state
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setHasScroll(el.scrollWidth > el.clientWidth);
    setIsAtStart(el.scrollLeft === 0);
    setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
  };

  const handleScroll = () => {
    updateIndicator();
    checkScroll();
  };

  useEffect(() => {
    updateIndicator();
    scrollToActiveTab();
  }, [activeTab]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", updateIndicator);
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
   <div className="relative w-full">
  {/* Left Fade */}
  {hasScroll && !isAtStart && (
    <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
  )}

  {/* Right Fade */}
  {hasScroll && !isAtEnd && (
    <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
  )}

  <div
    ref={scrollRef}
    onScroll={handleScroll}
    className="flex md:space-x-4 lg:space-x-2 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
  >
    {tabs.map((tab, index) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;

      return (
        <div key={tab.id} className="relative">
          <motion.button
            ref={(el) => (tabRefs.current[index] = el)}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-5 md:px-6 py-2 md:py-3 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-all text-sm md:text-base ${
              isActive
                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <Icon size={16} />
            <span>{tab.label}</span>

            {/* 🔥 Indicator */}
            {isActive && (
              <motion.div
                layoutId="underline"
                className={`absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r ${tab.color}`}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
          </motion.button>
        </div>
      );
    })}
  </div>
</div>

  );
}


export default CommunityTabs;