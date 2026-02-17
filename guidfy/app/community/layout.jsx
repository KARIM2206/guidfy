// components/layout/CommunityLayout.jsx

import TopNavbar from '../components/community/TopNavbar';
import CommunitySidebar from '../components/community/CommunitySidebar';
import { CommunityProvider } from '../CONTEXT/CommuntiyProvider';

export default function CommunityLayout({ children }) {
  return (
    <CommunityProvider>
      <div className="min-h-screen  bg-gray-50 dark:bg-gray-900">
        <TopNavbar />

      <div className="flex">
        {/* Sidebar */}
      
          <CommunitySidebar />
        

        {/* Content */}
         <main className="flex-1  overflow-y-auto transition-all duration-300">
        <div className="p-2 sm:p-6 pb-0">
          <div className=" px-1 py-2 md:p-6">
            {children}
          </div>
        </div>
      </main>
      </div>
    </div>
    </CommunityProvider>
  );
}
