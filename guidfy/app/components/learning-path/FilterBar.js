'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Search, X } from 'lucide-react';

const durations = ['Any Duration', '0-20 hrs', '20-40 hrs', '40-60 hrs', '60+ hrs'];

export default function FilterBarLearningPaths({ onFilterChange }) {
  const [duration, setDuration] = useState('Any Duration');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const debounceTimer = useRef(null);

  const applyFilters = (updatedDuration, updatedSearch) => {
    const filters = {
      duration: updatedDuration !== 'Any Duration' ? updatedDuration : null,
      search: updatedSearch?.trim() || null,
    };
    onFilterChange?.(filters);
  };

  const handleDurationChange = (val) => {
    setDuration(val);
    applyFilters(val, searchTerm);
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      applyFilters(duration, searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="mb-8 px-4">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700 mb-3"
      >
        <Filter size={16} /> Filters
        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                >
                  {durations.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* يمكن إعادة إضافة فلاتر أخرى لاحقاً مثل المستوى */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
