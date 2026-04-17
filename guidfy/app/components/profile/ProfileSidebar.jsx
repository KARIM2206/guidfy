// components/profile/ProfileSidebar.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import SidebarUserInfo from './SidebarUserInfo';
import SidebarTracks from './SidebarTracks';
import SidebarAchievements from './SidebarAchievements';
import SidebarNotifications from './SidebarNotifications';
import SidebarQuickLinks from './SidebarQuickLinks';

const ProfileSidebar = ({ user, notifications, tracks, badges, isOpen, onClose }) => {
  const sidebarRef = useRef(null);

  // Close when clicking outside the sidebar panel
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Sidebar - always visible */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block space-y-6"
      >
        <SidebarUserInfo user={user} />
        <SidebarTracks tracks={tracks} />
        {/* <SidebarAchievements badges={badges} /> */}
        <SidebarNotifications  />
        {/* <SidebarQuickLinks /> */}
      </motion.aside>

      {/* Mobile Sidebar with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            {/* Sidebar Panel */}
            <motion.aside
              ref={sidebarRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Profile Menu
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <SidebarUserInfo user={user} />
                  <SidebarTracks tracks={tracks} />
                  {/* <SidebarAchievements badges={badges} /> */}
                  <SidebarNotifications notifications={notifications} />
                  {/* <SidebarQuickLinks /> */}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileSidebar;