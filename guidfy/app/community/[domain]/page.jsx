// app/community/[domain]/page.jsx
'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import DomainHeader from '../../components/community/domian/DomainHeader';
import DomainStats from '../../components/community/domian/DomainStats';
import CommunityTabs from '../../components/community/domian/CommunityTabs';
import Feed from '../../components/community/feed/Feed';
import FeedFilters from '../../components/community/feed/FeedFilters';
import FeedEmptyState from '../../components/community/feed/FeedEmptyState';

import {
  useCommunityBySlug,
  useCommunityQuestionsQuery,
  useCommunityPostsBySlug,
  useCommunityFeedQuery,
  useCommunityMembersQuery,
  useJoinCommunity,
  useLeaveCommunity,
} from '@/app/hooks/useCommunityQuery';



// ═══════════════════════════════════════════════════
//  DATA MAPPERS
// ═══════════════════════════════════════════════════

// ─── Date formatter ───────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * API response shape:
 * { id, title, body, tags[], votes, views, isAnswered,
 *   answersCount, author: { id, name, avatar }, createdAt }
 *
 * QuestionCard expects:
 * { id, type, title, excerpt, tags[], author (string),
 *   authorAvatar, votes, answers, views, isAnswered, createdAt, community }
 */
function mapQuestion(q, communityName = '') {
  return {
    id: q.id,
    type: 'question',
    title: q.title,
    excerpt: q.body,
    tags: Array.isArray(q.tags) ? q.tags : [],
    author: q.author?.name ?? 'Unknown',
    authorAvatar: q.author?.avatar ?? null,
    votes: q.votes ?? 0,
    answers: q.answersCount ?? q.answers ?? 0,
    views: q.views ?? 0,
    isAnswered: q.isAnswered ?? false,
    createdAt: formatDate(q.createdAt),
    community: communityName,
    body: q.body
  };
}

/**
 * API response shape:
 * { id, title, body, image, tags[], readTime, likes,
 *   bookmarks, views, commentsCount, author: { id, name, avatar }, createdAt }
 *
 * PostCard expects:
 * { id, type, title, excerpt, image, tags[], author (string),
 *   authorAvatar, likes, comments, bookmarks, views,
 *   readTime, isTrending, createdAt, community }
 */
function mapPost(p, communityName = '') {
  return {
    id: p.id,
    type: 'post',
    title: p.title,
    excerpt: p.body?.length > 150 ? p.body.slice(0, 150) + '...' : (p.body ?? ''),
    image: p.image ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    author: p.author?.name ?? 'Unknown',
    authorAvatar: p.author?.avatar ?? null,
    likes: p.likes ?? 0,
    comments: p.commentsCount ?? p.comments ?? 0,
    bookmarks: p.bookmarks ?? 0,
    views: p.views ?? 0,
    readTime: p.readTime ?? null,
    isTrending: (p.likes ?? 0) > 100,
    createdAt: formatDate(p.createdAt),
    community: communityName,
  };
}

// ═══════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════
export default function CommunityDomainPage() {
  const { domain: slug } = useParams();

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [page, setPage] = useState(1);

  // ── Queries ──────────────────────────────────────
  const {
    data: currentCommunity,

    isLoading: communityLoading,
    isError: communityIsError,
    error: communityError,
    refetch: refetchCommunity,
  } = useCommunityBySlug(slug);

  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useCommunityQuestionsQuery(currentCommunity?.id, page, 5, !!currentCommunity && activeTab === 'questions', sortBy, search, quickFilter);

  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useCommunityPostsBySlug(currentCommunity?.id, page, 5, !!currentCommunity && activeTab === 'posts', sortBy, search, quickFilter);

  const {
    data: feedData,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useCommunityFeedQuery(currentCommunity?.id, page, 5, !!currentCommunity && activeTab === 'all', sortBy, search, quickFilter);

  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useCommunityMembersQuery(currentCommunity?.id, page, 12, !!currentCommunity && activeTab === 'members');

  // ── Mutations ─────────────────────────────────────
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  // ── Derived state ─────────────────────────────────
  const rawQuestions = questionsData?.data ?? [];
  const rawPosts = postsData?.data ?? [];
  const rawFeed = feedData?.data ?? [];
  const members = membersData?.data ?? [];

  let pagination = { page: 1, limit: 5, total: 0, pages: 1 };
  if (activeTab === 'questions') pagination = questionsData?.pagination ?? pagination;
  else if (activeTab === 'posts') pagination = postsData?.pagination ?? pagination;
  else if (activeTab === 'all') pagination = feedData?.pagination ?? pagination;
  else if (activeTab === 'members') pagination = membersData?.pagination ?? pagination;

  const contentLoading = activeTab === 'questions' ? questionsLoading : activeTab === 'posts' ? postsLoading : activeTab === 'members' ? membersLoading : feedLoading;

  const communityName = currentCommunity?.name ?? '';
  let feedItems = [];
  if (activeTab === 'questions') {
    feedItems = rawQuestions.map((q) => mapQuestion(q, communityName));
  } else if (activeTab === 'posts') {
    feedItems = rawPosts.map((p) => mapPost(p, communityName));
  } else {
    feedItems = rawFeed.map((item) => 
      item.type === 'question' ? mapQuestion(item, communityName) : mapPost(item, communityName)
    );
  }

  const stats = currentCommunity
    ? {
      members: currentCommunity.stats?.members ?? 0,
      questions: currentCommunity.stats?.questions ?? 0,
      posts: currentCommunity.stats?.posts ?? 0,
      online: null,
    }
    : null;

  // ── Handlers ──────────────────────────────────────
  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoin = async () => {
    if (!currentCommunity) return;
    try {
      if (currentCommunity.isJoined) {
        await leaveMutation.mutateAsync({ communityId: currentCommunity.id, slug });
      } else {
        await joinMutation.mutateAsync({ communityId: currentCommunity.id, slug });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetry = useCallback(() => {
    refetchCommunity();
    if (activeTab === 'questions') refetchQuestions();
    else if (activeTab === 'posts') refetchPosts();
    else if (activeTab === 'members') refetchMembers();
    else refetchFeed();
  }, [activeTab, refetchCommunity, refetchQuestions, refetchPosts, refetchFeed, refetchMembers]);

  // ── Render content ────────────────────────────────
  const renderContent = () => {
    if (contentLoading && feedItems.length === 0) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    if (communityIsError) return <ErrorState message={communityError?.message || 'Failed to load'} onRetry={handleRetry} />;
    
    if (activeTab === 'members') {
      if (members.length === 0) {
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No members yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">You are the first member here!</p>
          </div>
        );
      }
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => {
              // Simple chat URL — page fetches user info from API
              const chatHref = `/chat/${member.id}`;

              // Avatar: image if exists, else first letter with bg color
              const COLORS = ['bg-rose-500','bg-pink-500','bg-violet-500','bg-blue-500','bg-teal-500','bg-emerald-500','bg-orange-500','bg-indigo-500'];
              let hash = 0;
              for (let i = 0; i < (member.name || '').length; i++) hash = (member.name.charCodeAt(i) + ((hash << 5) - hash));
              const colorCls = COLORS[Math.abs(hash) % COLORS.length];

              return (
                <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow">
                  {/* Avatar */}
                  {member.avatar ? (
                    <img
                      src={`http://localhost:8000${member.avatar}`}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-gray-100 dark:border-gray-700"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-white text-3xl font-bold border-2 border-white dark:border-gray-700 select-none ${colorCls}`}>
                      {member.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 text-center">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 line-clamp-1">{member.headline || member.title || 'Member'}</p>

                  {/* Chat Button */}
                  <a
                    href={chatHref}
                    className="mt-auto w-full py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </a>
                </div>
              );
            })}
          </div>
          {/* Pagination for members could be added here similar to Feed */}
        </div>
      );
    }

    if (feedItems.length === 0) return <FeedEmptyState type={activeTab} communityId={currentCommunity?.id} />;

    return (
      <Feed
        items={feedItems}
        type={activeTab}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoadingMore={contentLoading}
        communityId={currentCommunity?.id}
      />
    );
  };

  // ── Full page skeleton ─────────────────────────────
  if (communityLoading && !currentCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-1 md:px-4 py-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────
  if (!communityLoading && !currentCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorState
          message={communityError?.message || `Community "${slug}" not found`}
          onRetry={() => refetchCommunity()}
        />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-1 md:px-4 py-8">

        <DomainHeader
          name={currentCommunity.name}
          description={currentCommunity.description}
          icon={currentCommunity.icon}
          color={currentCommunity?.color}
          isMember={currentCommunity.isJoined}
          onJoin={handleJoin}
          members={currentCommunity.stats?.members ?? 0}
        />

        {stats && <DomainStats stats={stats} communityId={currentCommunity.id} />}

        <div className="mt-8">
          <CommunityTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={{
              questions: currentCommunity.stats?.questions ?? 0,
              posts: currentCommunity.stats?.posts ?? 0,
            }}
          />

          <div className="mt-6">
            <FeedFilters
              activeFilter={activeTab}
              onFilterChange={handleTabChange}
              sortBy={sortBy}
              onSortChange={(s) => { setSortBy(s); setPage(1); }}
              onSearchChange={(s) => { setSearch(s); setPage(1); }}
              onQuickFilter={(q) => { setQuickFilter(q); setPage(1); }}
              activeQuickFilter={quickFilter}
              showTabs={false}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${page}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            {pagination.total > 0 && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                Showing {feedItems.length} of {pagination.total} {activeTab}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}