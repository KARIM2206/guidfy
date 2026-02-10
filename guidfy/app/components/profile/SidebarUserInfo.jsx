// components/profile/SidebarUserInfo.jsx
import { motion } from 'framer-motion';
import { MapPin, Calendar, Globe, Mail } from 'lucide-react';

const SidebarUserInfo = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 p-1">
              <div 
                className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-700"
                style={{
                  backgroundImage: `url(${user.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          </div>
          
          {/* Online Status */}
          <div className="absolute bottom-2 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* User Info */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.title}</p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.followers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.following}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mt-6 w-full">
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={14} />
              <span>{user.location}</span>
            </div>
          )}
          
          {user.joinDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>Joined {user.joinDate}</span>
            </div>
          )}
          
          {user.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe size={14} />
              <span className="truncate">{user.website.replace('https://', '')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarUserInfo;