'use client';
import { useState, useEffect } from 'react';
// import CommunityLayout from '@/components/layout/CommunityLayout';
import Feed from '../../components/community/feed/Feed';
import FeedFilters from '../../components/community/feed/FeedFilters';
import FeedEmptyState from '../../components/community/feed/FeedEmptyState';
import RightPanel from '../../components/community/RightPanel';

export default function CommunityFeedPage() {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Simulate API fetch
// pages/community/feed.jsx - الجزء المعدل فقط من useEffect
useEffect(() => {
  const fetchContent = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let mockData = [];
      
      switch (activeFilter) {
        case 'all':
          mockData = [
            {
              id: 'q1',
              type: 'question',
              title: 'How to optimize React re-renders with useMemo and useCallback?',
              excerpt: 'I\'m building a large dashboard with many interactive components. Performance is starting to suffer...',
              tags: ['react', 'performance', 'optimization', 'hooks'],
              author: 'Sarah Johnson',
              votes: 124,
              answers: 8,
              views: 2450,
              isAnswered: true,
              createdAt: '2 hours ago',
              community: 'Frontend'
            },
            {
              id: 'p1',
              type: 'post',
              title: 'Building a Full-Stack SaaS with Next.js 14 and Supabase',
              excerpt: 'A complete guide to building a modern SaaS application using the latest Next.js features...',
              image: true,
              tags: ['nextjs', 'supabase', 'saas', 'tutorial'],
              author: 'Alex Chen',
              likes: 89,
              comments: 24,
              bookmarks: 56,
              views: 12400,
              readTime: '12 min',
              isTrending: true,
              createdAt: '1 day ago',
              community: 'Fullstack'
            },
            {
              id: 'pr1',
              type: 'project',
              title: 'OpenAI Assistant API Wrapper',
              description: 'A TypeScript wrapper for the OpenAI Assistant API with built-in streaming, file handling, and conversation management.',
              techStack: ['typescript', 'openai', 'nodejs', 'api'],
              stars: 245,
              forks: 67,
              watchers: 890,
              contributors: ['Alex', 'Sarah', 'Mike', 'Emma', 'John', 'Lisa'],
              lastUpdated: '2 days ago',
              isFeatured: true,
              demoUrl: 'https://demo.example.com',
              repoUrl: 'https://github.com/username/openai-wrapper',
              community: 'AI/ML'
            },
            {
              id: 'q2',
              type: 'question',
              title: 'Best practices for database indexing in PostgreSQL?',
              excerpt: 'I have a table with 10 million records and queries are getting slow...',
              tags: ['postgresql', 'database', 'performance', 'sql'],
              author: 'Mike Wilson',
              votes: 67,
              answers: 15,
              views: 8900,
              isAnswered: false,
              createdAt: '5 hours ago',
              community: 'Backend'
            },
            {
              id: 'p2',
              type: 'post',
              title: 'Mastering Tailwind CSS: Advanced Patterns and Tips',
              excerpt: 'Beyond the basics: Learn how to create reusable patterns, custom plugins, and optimize your workflow...',
              image: true,
              tags: ['tailwindcss', 'css', 'frontend', 'design'],
              author: 'Emma Davis',
              likes: 145,
              comments: 32,
              bookmarks: 78,
              views: 18700,
              readTime: '8 min',
              isTrending: false,
              createdAt: '3 days ago',
              community: 'Frontend'
            }
          ];
          break;
          
        case 'questions':
          mockData = [
            {
              id: 'q1',
              type: 'question',
              title: 'Next.js 14 Server Actions vs API Routes?',
              excerpt: 'When should I use Server Actions vs traditional API routes in Next.js 14?',
              tags: ['nextjs', 'server-actions', 'api'],
              author: 'David Lee',
              votes: 89,
              answers: 12,
              views: 3400,
              isAnswered: true,
              createdAt: '1 hour ago',
              community: 'Next.js'
            },
            {
              id: 'q2',
              type: 'question',
              title: 'How to handle authentication in React Native?',
              excerpt: 'Looking for best practices for JWT-based auth in React Native with secure storage.',
              tags: ['react-native', 'authentication', 'jwt', 'mobile'],
              author: 'Lisa Brown',
              votes: 45,
              answers: 6,
              views: 2100,
              isAnswered: false,
              createdAt: '4 hours ago',
              community: 'Mobile'
            },
            {
              id: 'q3',
              type: 'question',
              title: 'Docker multi-stage build for Node.js applications',
              excerpt: 'How to optimize Dockerfile for Node.js apps to reduce image size?',
              tags: ['docker', 'nodejs', 'devops', 'optimization'],
              author: 'Chris Martin',
              votes: 78,
              answers: 9,
              views: 4500,
              isAnswered: true,
              createdAt: '6 hours ago',
              community: 'DevOps'
            }
          ];
          break;
          
        case 'posts':
          mockData = [
            {
              id: 'p1',
              type: 'post',
              title: 'The Future of Web Development in 2024',
              excerpt: 'A look at emerging trends and technologies that will shape web development this year.',
              image: true,
              tags: ['webdev', 'trends', '2024', 'technology'],
              author: 'Tech Insights',
              likes: 210,
              comments: 45,
              bookmarks: 120,
              views: 32500,
              readTime: '15 min',
              isTrending: true,
              createdAt: 'Today',
              community: 'General'
            },
            {
              id: 'p2',
              type: 'post',
              title: 'Building a Design System from Scratch',
              excerpt: 'Step-by-step guide to creating a scalable design system for your organization.',
              image: true,
              tags: ['design-system', 'ui-ux', 'components', 'storybook'],
              author: 'Design Lead',
              likes: 156,
              comments: 28,
              bookmarks: 89,
              views: 18700,
              readTime: '10 min',
              isTrending: false,
              createdAt: '2 days ago',
              community: 'Frontend'
            },
            {
              id: 'p3',
              type: 'post',
              title: 'Microservices vs Monolith: Making the Right Choice',
              excerpt: 'Practical advice for choosing between microservices and monolithic architecture.',
              image: true,
              tags: ['architecture', 'microservices', 'backend', 'scalability'],
              author: 'System Architect',
              likes: 189,
              comments: 37,
              bookmarks: 95,
              views: 28900,
              readTime: '18 min',
              isTrending: true,
              createdAt: '1 day ago',
              community: 'Backend'
            }
          ];
          break;
          
        case 'projects':
          mockData = [
            {
              id: 'pr1',
              type: 'project',
              title: 'DevTools Chrome Extension',
              description: 'A collection of developer tools for debugging and testing web applications.',
              techStack: ['javascript', 'chrome-extension', 'devtools', 'react'],
              stars: 567,
              forks: 123,
              watchers: 2450,
              contributors: ['Alice', 'Bob', 'Charlie', 'Diana'],
              lastUpdated: 'Yesterday',
              isFeatured: true,
              demoUrl: 'https://devtools.example.com',
              repoUrl: 'https://github.com/devtools/chrome-extension',
              community: 'Tools'
            },
            {
              id: 'pr2',
              type: 'project',
              title: 'Real-time Chat Application',
              description: 'A scalable real-time chat app using Socket.io, React, and Node.js.',
              techStack: ['socket.io', 'react', 'nodejs', 'real-time'],
              stars: 234,
              forks: 67,
              watchers: 1200,
              contributors: ['Eve', 'Frank', 'Grace'],
              lastUpdated: '1 week ago',
              isFeatured: false,
              demoUrl: 'https://chat.demo.com',
              repoUrl: 'https://github.com/username/realtime-chat',
              community: 'Fullstack'
            },
            {
              id: 'pr3',
              type: 'project',
              title: 'AI Code Review Assistant',
              description: 'An AI-powered tool that reviews your code and suggests improvements.',
              techStack: ['python', 'ai', 'machine-learning', 'code-review'],
              stars: 890,
              forks: 210,
              watchers: 4500,
              contributors: ['Henry', 'Ivy', 'Jack', 'Karen', 'Leo'],
              lastUpdated: '3 days ago',
              isFeatured: true,
              demoUrl: 'https://ai-codereview.com',
              repoUrl: 'https://github.com/ai-lab/code-review',
              community: 'AI/ML'
            }
          ];
          break;
          
        default:
          mockData = [];
      }
      
      // Apply sorting
      let sortedData = [...mockData];
      switch (sortBy) {
        case 'latest':
          // Already sorted by createdAt in mock data
          break;
        case 'popular':
          sortedData.sort((a, b) => {
            const aScore = (a.votes || 0) + (a.likes || 0) + (a.stars || 0);
            const bScore = (b.votes || 0) + (b.likes || 0) + (b.stars || 0);
            return bScore - aScore;
          });
          break;
        case 'trending':
          sortedData.sort((a, b) => {
            const aViews = a.views || 0;
            const bViews = b.views || 0;
            return bViews - aViews;
          });
          break;
      }
      
      setContent(sortedData);
      setIsLoading(false);
    }, 500);
  };

  fetchContent();
}, [activeFilter, sortBy]);

  

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleLoadMore = () => {
    // Implement load more logic
  };

  return (
   
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Community Feed
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore questions, posts, and projects from all communities
                </p>
              </div>

              <FeedFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />

              {isLoading ? (
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
              ) : content.length === 0 ? (
                <FeedEmptyState />
              ) : (
                <Feed
                  items={content}
                  onLoadMore={handleLoadMore}
                  hasMore={false}
                />
              )}
            </div>

            {/* Right Panel */}
            <div className="lg:w-1/3">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    
  );
}