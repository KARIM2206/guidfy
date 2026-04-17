'use client';

import { motion } from 'framer-motion';

const tabs = [
  { id: 'all', label: 'All Learning Paths' },
  { id: 'courses', label: 'Courses' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function TabsNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}