// components/profile/SidebarQuickLinks.jsx
import { motion } from 'framer-motion';
import { Bookmark, Settings, Activity, FileText, Users, Star } from 'lucide-react';

const SidebarQuickLinks = () => {
  const links = [
    { icon: Bookmark, label: 'Saved Posts', count: 24 },
    { icon: FileText, label: 'My Drafts', count: 3 },
    { icon: Users, label: 'Communities', count: 8 },
    { icon: Star, label: 'Featured Work', count: 5 },
    { icon: Activity, label: 'Activity Log', count: null },
    { icon: Settings, label: 'Settings', count: null }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        Quick Links
      </h4>
      
      <div className="space-y-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          
          return (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between w-full p-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium">{link.label}</span>
              </div>
              
              {link.count !== null && (
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {link.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SidebarQuickLinks;