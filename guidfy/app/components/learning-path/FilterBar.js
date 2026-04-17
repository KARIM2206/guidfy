'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Clock, Award, Flame, PlayCircle } from 'lucide-react';

const topics = [
  'All Topics',
  'Frontend',
  'Backend',
  'Cloud Computing',
  'AI',
  'DevOps',
  'Mobile',
  'Data Science',
  'Security',
];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const durations = ['Any Duration', '0-20 hrs', '20-40 hrs', '40-60 hrs', '60+ hrs'];
const specials = ['Rewards', 'Live Sessions', 'Most Popular'];

export default function FilterBar() {
  const [topic, setTopic] = useState('All Topics');
  const [level, setLevel] = useState('All Levels');
  const [duration, setDuration] = useState('Any Duration');
  const [special, setSpecial] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSpecial = (item) => {
    setSpecial((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="mb-8">
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700 mb-3"
      >
        <Filter size={16} />
        Filters
        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {(isExpanded || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Topic filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Level filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {levels.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Duration filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {durations.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Special filters (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special</label>
                <div className="flex flex-wrap gap-2">
                  {specials.map((item) => {
                    const isSelected = special.includes(item);
                    return (
                      <motion.button
                        key={item}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSpecial(item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item === 'Rewards' && <Award size={14} />}
                        {item === 'Live Sessions' && <PlayCircle size={14} />}
                        {item === 'Most Popular' && <Flame size={14} />}
                        {item}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}