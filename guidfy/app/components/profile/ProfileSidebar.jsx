// components/profile/ProfileSidebar.jsx
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import SidebarUserInfo from './SidebarUserInfo';
import SidebarTracks from './SidebarTracks';
import SidebarAchievements from './SidebarAchievements';
import SidebarNotifications from './SidebarNotifications';
import SidebarQuickLinks from './SidebarQuickLinks';

const ProfileSidebar = ({ user, notifications, tracks, badges, isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block space-y-6"
      >
        <SidebarUserInfo user={user} />
        <SidebarTracks tracks={tracks} />
        <SidebarAchievements badges={badges} />
        <SidebarNotifications notifications={notifications} />
        <SidebarQuickLinks />
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 lg:hidden overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            <SidebarUserInfo user={user} />
            <SidebarTracks tracks={tracks} />
            <SidebarAchievements badges={badges} />
            <SidebarNotifications notifications={notifications} />
            <SidebarQuickLinks />
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default ProfileSidebar;