'use client'

import Sidebar from "@/app/components/admin/dashboard/Sidebar";
import { AdminProvider, useAdminContext } from "@/app/CONTEXT/AdminProvider";
import { Menu } from "lucide-react";
import { useEffect, useRef } from "react";

const DashboardAdminPanelLayoutWrapper = ({ children }) => {
  return (
    <AdminProvider>
      <DashboardAdminPanelLayout>{children}</DashboardAdminPanelLayout>
    </AdminProvider>
  );
};

const DashboardAdminPanelLayout = ({ children }) => {
  const { openSidebar, setOpenSidebar } = useAdminContext();
  const containerRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSidebar, setOpenSidebar]);

  return (
    <div  className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">

      {/* Sidebar */}
      <div ref={containerRef}>
<Sidebar   />
      </div>
      

      {/* Right Side */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 md:hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <Menu
              className="cursor-pointer hover:text-blue-600 transition-colors"
              size={24}
              onClick={() => setOpenSidebar(prev => !prev)}
            />
            <h1 className="font-semibold text-gray-700">Dashboard</h1>
          </div>
        </div>

        {/* Content */}
          <main  className="flex-1  overflow-y-auto transition-all duration-300">
        <div className="p-2 sm:p-6 pb-0">
          <div  className=" px-1 py-2 md:p-6">
            {children}
          </div>
        </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardAdminPanelLayoutWrapper;
