// app/community/[domain]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import DomainHeader   from '../../components/community/domian/DomainHeader';
import DomainStats    from '../../components/community/domian/DomainStats';
import CommunityTabs  from '../../components/community/domian/CommunityTabs';
import Feed           from '../../components/community/feed/Feed';
import FeedFilters    from '../../components/community/feed/FeedFilters';
import FeedEmptyState from '../../components/community/feed/FeedEmptyState';

import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';

// ═══════════════════════════════════════════════════
//  DATA MAPPERS
// ═══════════════════════════════════════════════════

// ─── Date formatter ───────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)        return 'Just now';
  if (diff < 3600)      return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)} hours ago`;
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
    id:           q.id,
    type:         'question',
    title:        q.title,
    excerpt:      q.body,
    tags:         Array.isArray(q.tags) ? q.tags : [],
    author:       q.author?.name    ?? 'Unknown',
    authorAvatar: q.author?.avatar  ?? null,
    votes:        q.votes           ?? 0,
    answers:      q.answersCount    ?? 0,
    views:        q.views           ?? 0,
    isAnswered:   q.isAnswered      ?? false,
    createdAt:    formatDate(q.createdAt),
    community:    communityName,
    body:         q.body
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
    id:           p.id,
    type:         'post',
    title:        p.title,
    excerpt:      p.body?.length > 150 ? p.body.slice(0, 150) + '...' : (p.body ?? ''),
    image:        p.image           ?? null,
    tags:         Array.isArray(p.tags) ? p.tags : [],
    author:       p.author?.name    ?? 'Unknown',
    authorAvatar: p.author?.avatar  ?? null,
    likes:        p.likes           ?? 0,
    comments:     p.commentsCount   ?? 0,
    bookmarks:    p.bookmarks       ?? 0,
    views:        p.views           ?? 0,
    readTime:     p.readTime        ?? null,
    isTrending:   (p.likes ?? 0) > 100,
    createdAt:    formatDate(p.createdAt),
    community:    communityName,
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

  const {
    currentCommunity,
    questions,
    posts,
    pagination,
    loading,
    error,
    fetchCommunityBySlug,
    fetchQuestions,
    fetchPosts,
    join,
    leave,
  } = useCommunity();

  const [activeTab,      setActiveTab]      = useState('questions');
  const [sortBy,         setSortBy]         = useState('latest');
  const [page,           setPage]           = useState(1);
  const [pageError,      setPageError]      = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  // ── 1. جلب بيانات الكميونتى ───────────────────
  useEffect(() => {
    setPageError(null);
    fetchCommunityBySlug(slug).catch((err) =>
      setPageError(err.message || 'Community not found')
    );
  }, [slug]);

  // ── 2. جلب المحتوى عند تغيير التاب أو الصفحة ──
  const loadContent = useCallback(async () => {
    if (!currentCommunity) return;
    setContentLoading(true);
    setPageError(null);
    try {
      const opts = { page, limit: 10 };
      if (activeTab === 'questions') await fetchQuestions(currentCommunity.id, opts);
      if (activeTab === 'posts')     await fetchPosts(currentCommunity.id, opts);
    } catch (err) {
      setPageError(err.message || 'Failed to load content');
    } finally {
      setContentLoading(false);
    }
  }, [currentCommunity, activeTab, page]);

  useEffect(() => { loadContent(); }, [loadContent]);

  // ── Handlers ──────────────────────────────────
  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };
  const handleLoadMore  = () => { if (page < pagination.pages) setPage((p) => p + 1); };

  const handleJoin = async () => {
    if (!currentCommunity) return;
    try {
      currentCommunity.isJoined
        ? await leave(currentCommunity.id)
        : await join(currentCommunity.id);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Map raw API → Feed shape ──────────────────
  const communityName = currentCommunity?.name ?? '';
  const feedItems = activeTab === 'questions'
    ? questions.map((q) => mapQuestion(q, communityName))
    : posts.map((p) => mapPost(p, communityName));
 
  const stats = currentCommunity
    ? {
        members:   currentCommunity.stats?.members   ?? 0,
        questions: currentCommunity.stats?.questions ?? 0,
        posts:     currentCommunity.stats?.posts     ?? 0,
        online:    null,
      }
    : null;

  // ── Render content ────────────────────────────
  const renderContent = () => {
    if ((loading || contentLoading) && feedItems.length === 0) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    if (pageError)          return <ErrorState message={pageError} onRetry={loadContent} />;
    if (feedItems.length === 0) return <FeedEmptyState  type={activeTab} communityId={currentCommunity?.id}/>;

    return (
      <Feed
        items={feedItems}
        onLoadMore={handleLoadMore}
        hasMore={page < pagination.pages}
        isLoadingMore={contentLoading && feedItems.length > 0}
        communityId={currentCommunity?.id}
      />
    );
  };

  // ── Full page skeleton ─────────────────────────
  if (loading && !currentCommunity) {
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

  // ── Not found ─────────────────────────────────
  if (!loading && !currentCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorState
          message={pageError || `Community "${slug}" not found`}
          onRetry={() => fetchCommunityBySlug(slug)}
        />
      </div>
    );
  }

  // ── Main render ───────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-1 md:px-4 py-8">

        <DomainHeader
          name={currentCommunity.name}
          description={currentCommunity.description}
          icon={currentCommunity.icon}
          color={currentCommunity.color}
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
              posts:     currentCommunity.stats?.posts     ?? 0,
            }}
          />

          <div className="mt-6">
            <FeedFilters
              activeFilter={activeTab}
              onFilterChange={handleTabChange}
              sortBy={sortBy}
              onSortChange={(s) => { setSortBy(s); setPage(1); }}
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