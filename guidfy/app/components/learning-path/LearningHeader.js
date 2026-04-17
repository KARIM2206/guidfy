'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

export default function LearningHeader({isRecommended,setIsBrowseAll}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'title', label: 'Title A-Z' },
    isRecommended && { value: 'recommended', label: 'Recommended' },
  ];
useEffect(()=>{
  if (sortBy==='recommended') {
     setIsBrowseAll(false);
  }
 
},[sortBy])

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* Left side: Title */}
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Browse Learning Paths
      </h1>

      {/* Right side: Search + Sort */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ width: searchOpen ? '240px' : '40px' }}
            transition={{ duration: 0.3 }}
            className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Search size={18} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search paths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-3 py-2 text-sm bg-transparent outline-none"
                  autoFocus
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors"
          >
            Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
            <ChevronDown size={16} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      sortBy === option.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}