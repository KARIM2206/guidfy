// components/profile/SidebarNotifications.jsx
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Heart, UserPlus, ChevronRight } from 'lucide-react';

const SidebarNotifications = ({ notifications = [] }) => {
  const getIcon = (type) => {
    const iconMap = {
      answer: MessageSquare,
      like: Heart,
      follow: UserPlus
    };
    return iconMap[type] || Bell;
  };

  const getColor = (type) => {
    const colorMap = {
      answer: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      like: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      follow: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    };
    return colorMap[type] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={18} />
          Notifications
          {notifications.filter(n => n.unread).length > 0 && (
            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </h4>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-3 p-3 rounded-lg ${notification.unread
                ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className={`h-10 w-10 ${getColor(notification.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {notification.time}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        View All Notifications
      </button>
    </motion.div>
  );
};

export default SidebarNotifications;