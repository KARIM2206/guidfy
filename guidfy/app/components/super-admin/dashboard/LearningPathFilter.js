'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { useState } from 'react';

const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const categoryOptions = [
  'Web Development',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Security',
  'Cloud Computing',
];

export default function LearningPathFilter({ filters, setFilters }) {
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleLevelSelect = (level) => {
    setFilters((prev) => ({ ...prev, level: prev.level === level ? '' : level }));
    setLevelOpen(false);
  };

  const handleCategorySelect = (category) => {
    setFilters((prev) => ({ ...prev, category: prev.category === category ? '' : category }));
    setCategoryOpen(false);
  };

  const clearFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: '' }));
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Level Dropdown */}
      <div className="relative w-full sm:w-48">
        <button
          onClick={() => setLevelOpen(!levelOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={filters.level ? 'text-gray-900' : 'text-gray-500'}>
            {filters.level || 'Level'}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              levelOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {levelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              {levelOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelSelect(level)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                    filters.level === level ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {level}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {filters.level && (
          <button
            onClick={() => clearFilter('level')}
            className="absolute -right-2 -top-2 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="relative w-full sm:w-48">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={filters.category ? 'text-gray-900' : 'text-gray-500'}>
            {filters.category || 'Category'}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              categoryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {categoryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                    filters.category === category ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {filters.category && (
          <button
            onClick={() => clearFilter('category')}
            className="absolute -right-2 -top-2 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}