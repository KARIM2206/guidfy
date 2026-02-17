// components/feed/FeedFilters.jsx - النسخة المحدثة
import { motion } from 'framer-motion';
import { Filter, Clock, TrendingUp, Flame, Search } from 'lucide-react';

const FeedFilters = ({
  activeFilter = 'questions',
  onFilterChange,
  sortBy = 'latest',
  onSortChange,
  showTabs = false
}) => {
  const filterOptions = showTabs ? [
    { id: 'questions', label: 'Questions' },
    { id: 'posts', label: 'Posts' },
    { id: 'projects', label: 'Projects' }
  ] : [];

  const sortOptions = [
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'trending', label: 'Trending', icon: Flame }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center  gap-4">
        {/* Left: Search and Filters */}
        <div className="flex flex-col w-full sm:flex-row  gap-4 flex-1">
          {/* Search Bar */}
          <div className="relative bg-amber-300 flex-1 max-w-full rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="search"
              placeholder={`Search in community...`}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              aria-label="Search"
            />
          </div>

          {/* Filter Tabs (if enabled) */}
          {showTabs && filterOptions.length > 0 && (
            <div className="flex items-center space-x-1">
              <Filter size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex space-x-1">
                {filterOptions.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <motion.button
                      key={filter.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFilterChange(filter.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {filter.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sort Options */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Sort by:
          </span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {sortOptions.map((sort) => {
              const Icon = sort.icon;
              const isActive = sortBy === sort.id;

              return (
                <motion.button
                  key={sort.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSortChange(sort.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                >
                  <Icon size={14} />
                  <span className="whitespace-nowrap hidden sm:inline">{sort.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {['answered', 'unanswered', 'trending', 'featured', 'recent'].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors capitalize"
            >
              {filter}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;