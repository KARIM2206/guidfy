// app/user/[username]/page.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import UserPosts from '../components/profile/UserPosts';
import UserQuestions from '../components/profile/UserQuestions';
import UserAnswers from '../components/profile/UserAnswers';
import UserProjects from '../components/profile/UserProjects';
import EmptyState from '../components/profile/EmptyState';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username;

  const [activeTab, setActiveTab] = useState('posts');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      // Simulate API fetch
      setTimeout(() => {
        setUserData({
          username: 'alexjohnson',
          name: 'Alex Johnson',
          title: 'Senior Frontend Engineer',
          bio: 'Passionate about React, TypeScript, and building scalable web applications. Open source contributor and tech educator.',
        //   avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${}`,
          cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h-400&fit=crop',
          location: 'San Francisco, CA',
          joinDate: 'March 2019',
          website: 'https://alexjohnson.dev',
          github: 'alexjohnson',
          twitter: 'alexjohnson',
          linkedin: 'alexjohnson',
          
          stats: {
            reputation: 12450,
            posts: 89,
            questions: 45,
            answers: 156,
            projects: 12,
            solutions: 245,
            followers: 890,
            following: 123
          },
          
          badges: [
            { id: 1, name: 'Gold Contributor', icon: '🏆', color: 'yellow' },
            { id: 2, name: 'Problem Solver', icon: '🔧', color: 'blue' },
            { id: 3, name: 'Community Leader', icon: '👑', color: 'purple' },
            { id: 4, name: 'Early Adopter', icon: '🚀', color: 'green' }
          ],
          
          tracks: [
            { id: 1, name: 'Advanced React', progress: 85, color: 'blue' },
            { id: 2, name: 'TypeScript Mastery', progress: 70, color: 'purple' },
            { id: 3, name: 'Next.js Foundations', progress: 95, color: 'black' },
            { id: 4, name: 'GraphQL API Design', progress: 60, color: 'pink' }
          ],
          
          notifications: [
            { id: 1, type: 'answer', message: 'Sarah replied to your question', time: '2h ago', unread: true },
            { id: 2, type: 'like', message: 'Mike liked your post about React', time: '5h ago', unread: true },
            { id: 3, type: 'follow', message: 'New follower: Emma Davis', time: '1d ago', unread: false }
          ]
        });
        setIsLoading(false);
      }, 600);
    };

    fetchUserData();
  }, [username]);

  const tabContent = useMemo(() => {
    if (!userData) return null;
    
    const contentMap = {
      posts: <UserPosts username={username} />,
      questions: <UserQuestions username={username} />,
      answers: <UserAnswers username={username} />,
      projects: <UserProjects username={username} />
    };
    
    return contentMap[activeTab] || <UserPosts username={username} />;
  }, [activeTab, username, userData]);

  if (isLoading || !userData) {
    return (
     
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
     
    );
  }

  return (
    
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Mobile Sidebar Toggle */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-50 h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <ProfileHeader
                name={userData.name}
                title={userData.title}
                bio={userData.bio}
                avatar={userData.avatar}
                cover={userData.cover}
                location={userData.location}
                joinDate={userData.joinDate}
                website={userData.website}
                github={userData.github}
                twitter={userData.twitter}
                linkedin={userData.linkedin}
              />

              <ProfileStats stats={userData.stats} />

              <div className="mt-8">
                <ProfileTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  counts={{
                    posts: userData.stats.posts,
                    questions: userData.stats.questions,
                    answers: userData.stats.answers,
                    projects: userData.stats.projects
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6"
                  >
                    {tabContent}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar
                user={userData}
                notifications={userData.notifications}
                tracks={userData.tracks}
                badges={userData.badges}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    
  );
}