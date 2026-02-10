// components/profile/ProfileTabs.jsx
import { motion } from 'framer-motion';
import { FileText, MessageSquare, CheckCircle, Code2 } from 'lucide-react';

const ProfileTabs = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    {
      id: 'posts',
      label: 'Posts',
      icon: FileText,
      count: counts.posts || 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: MessageSquare,
      count: counts.questions || 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'answers',
      label: 'Answers',
      icon: CheckCircle,
      count: counts.answers || 0,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Code2,
      count: counts.projects || 0,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="relative">
      <div className="flex space-x-1 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-lg flex items-center space-x-3 transition-all whitespace-nowrap ${isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                {tab.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Indicator */}
      <motion.div
        className="absolute bottom-0 h-1 rounded-full"
        initial={false}
        animate={{
          x: tabs.findIndex(t => t.id === activeTab) * 100 / tabs.length * 100 + '%',
          width: '25%',
          background: `linear-gradient(to right, ${(() => {
            const activeTabObj = tabs.find(t => t.id === activeTab);
            switch (activeTabObj?.color) {
              case 'from-blue-500 to-cyan-500': return '#3b82f6, #06b6d4';
              case 'from-purple-500 to-pink-500': return '#8b5cf6, #ec4899';
              case 'from-green-500 to-emerald-500': return '#10b981, #10b981';
              case 'from-orange-500 to-amber-500': return '#f97316, #f59e0b';
              default: return '#3b82f6, #06b6d4';
            }
          })()})`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

export default ProfileTabs;