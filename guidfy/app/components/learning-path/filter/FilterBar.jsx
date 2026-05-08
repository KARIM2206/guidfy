// components/FilterBar.jsx
"use client";

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange, availableSkills }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
console.log('filters',filters);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* Basic Search & Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by title, company..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2.5 rounded-xl border transition ${
            showAdvanced ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Advanced Filters (expandable) */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min Match Score</label>
              <select
                value={filters?.minScore}
                onChange={(e) => onFilterChange('minScore', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="0.6">60%+</option>
                <option value="0.7">70%+</option>
                <option value="0.8">80%+</option>
                <option value="0.9">90%+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Type</label>
              <select
                value={filters?.jobType}
                onChange={(e) => onFilterChange('jobType', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Missing Skills Max</label>
              <select
                value={filters?.maxMissingSkills}
                onChange={(e) => onFilterChange('maxMissingSkills', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="2">≤ 2 skills</option>
                <option value="3">≤ 3 skills</option>
                <option value="4">≤ 4 skills</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Filter by required skills</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills?.map(skill => (
                <button
                  key={skill}
                  onClick={() => onFilterChange('skillToggle', skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    filters?.selectedSkills?.includes(skill)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;