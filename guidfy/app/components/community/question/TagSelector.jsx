// components/question/TagSelector.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Search, TrendingUp, AlertCircle } from 'lucide-react';

const TagSelector = ({ selectedTags = [], onTagSelect, error }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const popularTags = [
    { name: 'react', count: 12450, description: 'JavaScript library for building user interfaces' },
    { name: 'javascript', count: 28900, description: 'Programming language of the web' },
    { name: 'typescript', count: 15670, description: 'Typed JavaScript at any scale' },
    { name: 'nodejs', count: 9800, description: 'JavaScript runtime built on Chrome V8' },
    { name: 'nextjs', count: 8450, description: 'React framework for production' },
    { name: 'tailwindcss', count: 7230, description: 'Utility-first CSS framework' },
    { name: 'python', count: 23450, description: 'General-purpose programming language' },
    { name: 'docker', count: 6780, description: 'Platform for building, shipping, and running applications' },
    { name: 'kubernetes', count: 4560, description: 'Container orchestration system' },
    { name: 'graphql', count: 3890, description: 'Query language for APIs' },
    { name: 'mongodb', count: 5670, description: 'NoSQL document database' },
    { name: 'postgresql', count: 6340, description: 'Advanced open-source relational database' },
  ];

  const filteredTags = popularTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestedTags = popularTags
    .filter(tag => tag.name.includes('-') || tag.name.length <= 6)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Selected Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Selected Tags ({selectedTags.length}/5)
        </label>
        
        <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {selectedTags.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tags selected. Add tags to help others find your question.
            </p>
          ) : (
            selectedTags.map((tag) => {
              const tagInfo = popularTags.find(t => t.name === tag);
              return (
                <motion.div
                  key={tag}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg"
                >
                  <Tag size={12} />
                  <span className="text-sm font-medium">{tag}</span>
                  {tagInfo && (
                    <span className="text-xs opacity-90">
                      {tagInfo.count.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => onTagSelect(tag)}
                    className="ml-1 hover:bg-white/20 rounded p-0.5"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </div>

      {/* Search Tags */}
      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tags (react, javascript, typescript...)"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tag Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-gray-500 dark:text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Suggested Tags
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          {suggestedTags.map((tag) => (
            <motion.button
              key={tag.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTagSelect(tag.name)}
              className={`p-3 rounded-lg border text-left transition-all ${selectedTags.includes(tag.name)
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${selectedTags.includes(tag.name)
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  #{tag.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tag.count.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {tag.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* All Popular Tags */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Popular Tags
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
          <AnimatePresence>
            {filteredTags.map((tag, index) => (
              <motion.button
                key={tag.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTagSelect(tag.name)}
                className={`p-2 rounded-lg flex items-center justify-between transition-all ${selectedTags.includes(tag.name)
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={12} className={selectedTags.includes(tag.name)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  } />
                  <span className={`text-sm ${selectedTags.includes(tag.name)
                      ? 'text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {tag.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tag.count.toLocaleString()}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Tag Guidelines */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-medium mb-1">Tagging Guidelines</p>
            <ul className="space-y-1">
              <li>• Use relevant tags (max 5)</li>
              <li>• Include the main technology (react, javascript)</li>
              <li>• Add specific libraries/frameworks if applicable</li>
              <li>• Avoid vague tags like "help" or "urgent"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagSelector;