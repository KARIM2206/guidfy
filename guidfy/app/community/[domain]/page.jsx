// app/community/[domain]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import DomainHeader from '../../components/community/domian/DomainHeader';
import DomainStats from '../../components/community/domian/DomainStats';
import CommunityTabs from '../../components/community/domian/CommunityTabs';
import Feed from '../../components/community/feed/Feed';
import FeedFilters from '../../components/community/feed/FeedFilters';
import QuestionCard from '../../components/community/feed/QuestionCard';
import PostCard from '../../components/community/feed/PostCard';
import ProjectCard from '../../components/community/feed/ProjectCard';
import FeedEmptyState from '../../components/community/feed/FeedEmptyState';

// Mock data for different communities
const COMMUNITY_DATA = {
  frontend: {
    name: 'Frontend Development',
    description: 'Everything about modern frontend development - React, Vue, Angular, CSS, and more.',
    icon: '💻',
    color: 'blue',
    stats: {
      members: '45.2k',
      questions: '18.7k',
      posts: '9.3k',
      projects: '3.4k',
      online: '2.4k'
    }
  },
  backend: {
    name: 'Backend Development',
    description: 'Server-side programming, databases, APIs, and infrastructure discussions.',
    icon: '⚙️',
    color: 'green',
    stats: {
      members: '32.8k',
      questions: '14.2k',
      posts: '6.8k',
      projects: '2.1k',
      online: '1.8k'
    }
  },
  mobile: {
    name: 'Mobile Development',
    description: 'Native and cross-platform mobile development for iOS and Android.',
    icon: '📱',
    color: 'purple',
    stats: {
      members: '28.4k',
      questions: '11.5k',
      posts: '5.2k',
      projects: '1.7k',
      online: '1.5k'
    }
  },
  devops: {
    name: 'DevOps & Infrastructure',
    description: 'CI/CD, Docker, Kubernetes, cloud platforms, and deployment strategies.',
    icon: '🚀',
    color: 'orange',
    stats: {
      members: '24.7k',
      questions: '9.8k',
      posts: '4.6k',
      projects: '1.9k',
      online: '1.3k'
    }
  }
};

// Mock content data
const MOCK_CONTENT = {
  questions: [
    {
      id: 'q1',
      type: 'question',
      title: 'Next.js 14 App Router vs Pages Router for large e-commerce?',
      excerpt: 'We\'re building a large e-commerce platform and debating between App Router and Pages Router...',
      tags: ['nextjs', 'app-router', 'e-commerce', 'performance'],
      author: 'Alex Chen',
      votes: 145,
      answers: 23,
      views: 8900,
      isAnswered: true,
      createdAt: '3 hours ago',
      community: 'Frontend'
    },
    {
      id: 'q2',
      type: 'question',
      title: 'Optimizing React re-renders with useMemo and useCallback patterns',
      excerpt: 'I have a complex dashboard with 50+ interactive components. Re-renders are killing performance...',
      tags: ['react', 'performance', 'hooks', 'optimization'],
      author: 'Sarah Johnson',
      votes: 89,
      answers: 15,
      views: 6700,
      isAnswered: false,
      createdAt: '8 hours ago',
      community: 'Frontend'
    },
    {
      id: 'q3',
      type: 'question',
      title: 'Best practices for TypeScript generics in React components?',
      excerpt: 'Looking for patterns and best practices when using TypeScript generics with React...',
      tags: ['typescript', 'react', 'generics', 'best-practices'],
      author: 'Mike Wilson',
      votes: 67,
      answers: 8,
      views: 4300,
      isAnswered: true,
      createdAt: '1 day ago',
      community: 'Frontend'
    }
  ],
  posts: [
    {
      id: 'p1',
      type: 'post',
      title: 'Building a Modern Component Library with Tailwind CSS and Storybook',
      excerpt: 'A comprehensive guide to creating a scalable component library that your team will love...',
      image: true,
      tags: ['tailwindcss', 'storybook', 'design-system', 'components'],
      author: 'Design Lead',
      likes: 234,
      comments: 42,
      bookmarks: 120,
      views: 25600,
      readTime: '12 min',
      isTrending: true,
      createdAt: 'Today',
      community: 'Frontend'
    },
    {
      id: 'p2',
      type: 'post',
      title: 'The Future of State Management in React: A 2024 Perspective',
      excerpt: 'With React 18 and upcoming features, how should we approach state management?',
      image: true,
      tags: ['react', 'state-management', 'context', 'zustand'],
      author: 'React Expert',
      likes: 189,
      comments: 35,
      bookmarks: 95,
      views: 18700,
      readTime: '15 min',
      isTrending: false,
      createdAt: '2 days ago',
      community: 'Frontend'
    }
  ],
  projects: [
    {
      id: 'pr1',
      type: 'project',
      title: 'React Admin Dashboard Template',
      description: 'A production-ready admin dashboard template built with React, TypeScript, and Material-UI.',
      techStack: ['react', 'typescript', 'mui', 'chartjs'],
      stars: 890,
      forks: 234,
      watchers: 1450,
      contributors: ['Alice', 'Bob', 'Charlie', 'Diana'],
      lastUpdated: '1 day ago',
      isFeatured: true,
      demoUrl: 'https://admin.demo.com',
      repoUrl: 'https://github.com/react-admin/dashboard',
      community: 'Frontend'
    },
    {
      id: 'pr2',
      type: 'project',
      title: 'Component Testing Library',
      description: 'A comprehensive testing library for React components with built-in accessibility testing.',
      techStack: ['jest', 'testing-library', 'react', 'accessibility'],
      stars: 456,
      forks: 89,
      watchers: 780,
      contributors: ['Eve', 'Frank'],
      lastUpdated: '3 days ago',
      isFeatured: false,
      demoUrl: 'https://testing.demo.com',
      repoUrl: 'https://github.com/testing-lab/library',
      community: 'Frontend'
    }
  ]
};

export default function CommunityDomainPage() {
  const params = useParams();
  const domain = params.domain;
  
  const [activeTab, setActiveTab] = useState('questions');
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [isMember, setIsMember] = useState(false);
  
  const community = COMMUNITY_DATA[domain] || {
    name: domain.charAt(0).toUpperCase() + domain.slice(1),
    description: 'A community for developers interested in ' + domain,
    icon: '👨‍💻',
    color: 'gray',
    stats: {
      members: '10k',
      questions: '5k',
      posts: '2k',
      projects: '1k',
      online: '500'
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setContent(MOCK_CONTENT[activeTab] || []);
        setIsLoading(false);
      }, 300);
    };

    loadContent();
  }, [activeTab, domain, sortBy]);

  const handleJoinCommunity = () => {
    setIsMember(!isMember);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (content.length === 0) {
      return <FeedEmptyState />;
    }

    return (
      <Feed
        items={content}
        onLoadMore={() => {}}
        hasMore={false}
      />
    );
  };

  return (
   
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
          {/* Domain Header */}
          <DomainHeader
            name={community.name}
            description={community.description}
            icon={community.icon}
            color={community.color}
            isMember={isMember}
            onJoin={handleJoinCommunity}
          />

          {/* Domain Stats */}
          <DomainStats stats={community.stats} />

          {/* Main Content */}
          <div className="mt-8">
            {/* Community Tabs */}
            <CommunityTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Content Section */}
            <div className="mt-6">
              {/* Filters */}
              <FeedFilters
                activeFilter={activeTab}
                onFilterChange={handleTabChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                showTabs={false}
              />

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
   
  );
}