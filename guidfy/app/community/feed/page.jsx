'use client';
import { useState, useEffect, useCallback } from 'react';
import Feed from '../../components/community/feed/Feed';
import FeedFilters from '../../components/community/feed/FeedFilters';
import FeedEmptyState from '../../components/community/feed/FeedEmptyState';
import RightPanel from '../../components/community/RightPanel';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';


export default function CommunityFeedPage() {
  const { feed, feedPagination, fetchGlobalFeed, loading, error } = useCommunity();

  const [activeFilter,    setActiveFilter]    = useState('all');
  const [sortBy,          setSortBy]          = useState('latest');
  const [search,          setSearch]          = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('');

  // ── Fetch عند أي تغيير ───────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        await fetchGlobalFeed({
          filter     : activeFilter,
          sort       : sortBy,
          page       : 1,
          search,
          quickFilter: activeQuickFilter,
        });
      } catch { /* الـ error في الـ context */ }
    };
    fetch();
  }, [activeFilter, sortBy, search, activeQuickFilter]);

  const handleLoadMore = useCallback(async () => {
    if (feedPagination.page < feedPagination.pages) {
      try {
        await fetchGlobalFeed({
          filter     : activeFilter,
          sort       : sortBy,
          page       : feedPagination.page + 1,
          search,
          quickFilter: activeQuickFilter,
        });
      } catch { }
    }
  }, [feedPagination, activeFilter, sortBy, search, activeQuickFilter, fetchGlobalFeed]);

  // لو غيرنا لـ posts شيل الـ quickFilter
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'posts') setActiveQuickFilter('');
  };


  const hasMore = feedPagination.page < feedPagination.pages;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full mx-auto px-4 py-8">
        <div className="">

          {/* Main Content */}
          <div className="">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Community Feed
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Explore questions, posts, and projects from all communities
              </p>
            </div>

            <FeedFilters
              activeFilter      = {activeFilter}
              onFilterChange    = {handleFilterChange}
              sortBy            = {sortBy}
              onSortChange      = {setSortBy}
              onSearchChange    = {setSearch}
              onQuickFilter     = {setActiveQuickFilter}
              activeQuickFilter = {activeQuickFilter}
            />

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 
                            dark:border-red-800 rounded-xl p-4 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  ⚠️ {error}
                </p>
                <button
                  onClick={() => fetchGlobalFeed({ filter: activeFilter, sort: sortBy, page: 1 })}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading Skeleton - فقط عند أول لود */}
            {loading && feed.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : feed.length === 0 && !loading ? (
              <FeedEmptyState />
            ) : (
              <Feed
                items={feed}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                isLoadingMore={loading && feed.length > 0} // للـ load more spinner
              />
            )}
          </div>

          {/* Right Panel */}
          {/* <div className="lg:w-1/3">
            {/* <RightPanel /> */}
          {/* </div> */}

        </div>
      </div>
    </div>
  );
}