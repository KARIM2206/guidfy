'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Clock, TrendingUp, Flame, Search, X } from 'lucide-react';
import { useDebounce } from '@/app/hooks/useDebounce'; // هنعملها تحت



const SORT_OPTIONS = [
  { id: 'latest',   label: 'Latest',   icon: Clock },
  { id: 'popular',  label: 'Popular',  icon: TrendingUp },
  { id: 'trending', label: 'Trending', icon: Flame },
];

const FILTER_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'questions', label: 'Questions' },
  { id: 'posts',     label: 'Posts' },
];

const FeedFilters = ({
  activeFilter    = 'all',
  onFilterChange,
  sortBy          = 'latest',
  onSortChange,
  onSearchChange,
  onQuickFilter,
  activeQuickFilter = '',
}) => {
  const [searchValue, setSearchValue] = useState('');

  // ── Debounce السيرش 500ms ─────────────────────────
  const debouncedSearch = useDebounce((val) => {
    onSearchChange?.(val);
  }, 500);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedSearch(val);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearchChange?.('');
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">

      {/* Row 1: Filter Tabs + Sort */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 flex-1">
          <Filter size={16} className="text-gray-400 mr-1 flex-shrink-0" />
          {FILTER_TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onFilterChange(tab.id);
                // لو بدّلنا لـ posts شيل الـ quickFilter
                if (tab.id === 'posts') onQuickFilter?.('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Sort by:
          </span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {SORT_OPTIONS.map((sort) => {
              const Icon = sort.icon;
              return (
                <motion.button
                  key={sort.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSortChange(sort.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    sortBy === sort.id
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{sort.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Search */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search questions, posts..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
          {/* Clear button */}
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default FeedFilters;