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

    </div>
  );
}