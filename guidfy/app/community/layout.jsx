// components/layout/CommunityLayout.jsx

import TopNavbar from '../components/community/TopNavbar';
import CommunitySidebar from '../components/community/CommunitySidebar';

export default function CommunityLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavbar />
      <div className="flex">
        <CommunitySidebar />
        <main
         
          className="flex-1 pl-0 lg:pl-64"
        >
          {children}
        </main>
      </div>
    </div>
  );
}