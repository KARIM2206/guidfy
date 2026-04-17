'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useProfile } from '../CONTEXT/ProfileContext';
import { useAuth } from '../CONTEXT/AuthProvider';

import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';

import UserPosts from '../components/profile/UserPosts';
import UserQuestions from '../components/profile/UserQuestions';
import UserAnswers from '../components/profile/UserAnswers';

import EditProfileModal from '../components/profile/Editprofilemodal ';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 space-y-4">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileError({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-500">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { user } = useAuth();

  const {
    userData,
    isLoading,
    error,
    refetch,
    uploadAvatar,
    uploadCover,
    updateProfile,
    isSaving,
    fetchUserContent,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('posts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [content, setContent] = useState({
    posts: [],
    questions: [],
    answers: [],
  });

  const [loadingContent, setLoadingContent] = useState(false);

  const username = user?.name;

  // Upload handlers
  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (file) await uploadCover(file);
  };

  // Fetch content using CONTEXT function
  const loadContent = async (type, page = 1, limit = 10) => {
    setLoadingContent(true);
    const result = await fetchUserContent(type, page, limit);
    if (result.success) {
      return result.data?.data || result.data || [];
    }
    return [];
  };

  // Load all content initially
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const [posts, questions, answers] = await Promise.all([
        loadContent('POST'),
        loadContent('QUESTION'),
        loadContent('ANSWER'),
      ]);
      setContent({ posts, questions, answers });
      setLoadingContent(false);
    };
    load();
  }, [user?.id]);

  // Tab content mapping
  const tabContent = useMemo(() => {
    if (!userData) return null;
    const map = {
      posts: <UserPosts posts={content.posts} loading={loadingContent} />,
      questions: <UserQuestions questions={content.questions} loading={loadingContent} />,
      answers: <UserAnswers answers={content.answers} loading={loadingContent} />,
    };
    return map[activeTab] ?? map.posts;
  }, [activeTab, content, loadingContent, userData]);

  // States
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ProfileError message={error} onRetry={refetch} />;
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Responsive Grid: 2 columns on large screens, 1 column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Left side on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
          <ProfileHeader
  name={userData.name}
  title={userData.title}
  bio={userData.bio}
  avatar={userData.avatar}
  cover={userData.cover}
  joinDate={userData?.createdAt}
  isOwner={userData.id === user?.id}
  onEditAvatar={handleUploadAvatar}
  onEditCover={handleUploadCover}
  onOpenEditModal={() => setEditOpen(true)}
  onMenuClick={() => setSidebarOpen(true)}
  isMenuOpen={sidebarOpen}
/>

          

            {/* Tabs */}
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                posts: content.posts.length ?? 0,
                questions: content.questions.length ?? 0,
                answers: content.answers.length ?? 0,
              }}
            />

            {/* Tab Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {tabContent}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar (Right side on desktop) */}
          <div className="lg:col-span-1">
            {/* Sticky sidebar for large screens */}
            <div className="sticky top-24">
              <ProfileSidebar
                user={userData}
                notifications={userData.notifications}
                tracks={userData.learningPaths}
                badges={userData.badges}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          userData={userData}
          updateProfile={updateProfile}
          uploadAvatar={uploadAvatar}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}