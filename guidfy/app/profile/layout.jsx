// components/profile/ProfileLayout.jsx
'use client';
import { motion } from 'framer-motion';
import { ProfileProvider } from '../CONTEXT/ProfileContext';
import { CommunityProvider } from '../CONTEXT/CommuntiyProvider';
import { NotificationProvider } from '../CONTEXT/NotificationContext';

const ProfileLayout = ({ children, sidebarOpen, onSidebarToggle }) => {
  return (
    <CommunityProvider>
     
      <ProfileProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onSidebarToggle}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}
      
      {children}
    </div>
    </ProfileProvider>
 
      </CommunityProvider>
  );
};

export default ProfileLayout;