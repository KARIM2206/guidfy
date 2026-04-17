// app/components/SuperAdminSidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useAdminContext } from "@/app/CONTEXT/AdminProvider";
import {
  LayoutDashboard,
  FileText,
  Map,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Folder,
} from "lucide-react";
import Link from "next/link";

const superAdminNavItems = [
  { id: "", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "learning-paths", label: "Learning Paths", icon: BookOpen },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "project", label: "Projects", icon: Folder },
];

export default function SuperAdminSidebar() {
  const [activeItem, setActiveItem] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { openSidebar, setOpenSidebar } = useAdminContext();
  const path = usePathname().split("/");
 const sidebarRef = useRef();


  useEffect(() => {
  const handleClickOutside = (event) => {
    if (!sidebarRef.current) return;

    if (!sidebarRef.current.contains(event.target)) {
      setOpenSidebar(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  useEffect(() => {
    if (path[3]) {
      setActiveItem(path[3]);
    } else {
      setActiveItem("");
    }
  }, [path]); // add dependency on path

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ✅ Modified: no sidebar closing, no extra router.push
  const handleItemClick = (id) => {
    setActiveItem(id);
    // Sidebar stays open on mobile – only closes via backdrop
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {openSidebar && (
            <>
              {/* Backdrop – closes sidebar when clicked outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={() => setOpenSidebar(false)}
              />

              {/* Mobile Sidebar */}
              <motion.aside
              ref={sidebarRef}
                  onMouseDown={(e) => e.stopPropagation()}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3, type: "tween" }}
                className={`fixed top-16 left-0 flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white flex z-50 shadow-2xl h-[calc(100vh-4rem)] ${
                  isCollapsed ? "w-20" : "w-64"
                } transition-all duration-300`}
              >
                {/* Logo Section */}
                <LogoSection isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Navigation */}
                <NavItems
                  items={superAdminNavItems}
                  activeItem={activeItem}
                  hoveredItem={hoveredItem}
                  setHoveredItem={setHoveredItem}
                  isCollapsed={isCollapsed}
                  onItemClick={handleItemClick}
                />

                {/* Footer */}
                <SidebarFooter isCollapsed={isCollapsed} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Desktop Sidebar (always visible) */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`hidden md:flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen shadow-2xl ${
          isCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 sticky top-0`}
      >
        <LogoSection isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <NavItems
          items={superAdminNavItems}
          activeItem={activeItem}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isCollapsed={isCollapsed}
          onItemClick={handleItemClick}
        />
        <SidebarFooter isCollapsed={isCollapsed} />
      </motion.aside>
    </>
  );
}

// ==================== Components ====================

const LogoSection = ({ isCollapsed, setIsCollapsed }) => (
  <motion.div className="flex items-center justify-between p-6 border-b border-gray-700">
    <div className="flex items-center space-x-3 group">
      <motion.div className="relative p-2 bg-blue-600 rounded-lg cursor-pointer">
        <GraduationCap size={24} className={`${isCollapsed ? "group-hover:opacity-0" : ""}`} />
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCollapsed(false)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </motion.div>
        )}
      </motion.div>

      {!isCollapsed && (
        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
          <h1 className="text-xl font-bold">EduAdmin</h1>
          <p className="text-xs text-gray-400">Super Admin Panel</p>
        </motion.div>
      )}
    </div>

    {!isCollapsed && (
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={18} />
      </motion.button>
    )}
  </motion.div>
);

const NavItems = ({ items, activeItem, hoveredItem, setHoveredItem, isCollapsed, onItemClick }) => (
  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
    {!isCollapsed && <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</h3>}
    {items.map((item) => {
      const Icon = item.icon;
      const isActive = activeItem === item.id;
      const isHovered = hoveredItem === item.id;

      return (
        <motion.div
          key={item.id}
          className="relative"
          onHoverStart={() => setHoveredItem(item.id)}
          onHoverEnd={() => setHoveredItem(null)}
        >
          {isActive && <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/10 rounded-lg" layoutId="activeBackground" />}
          {isActive && <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-r-full" />}

          <Link
            href={`/super-admin/dashboard/${item.id}`}
            onClick={() => onItemClick(item.id)}
            className={`relative flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
              isActive ? "text-blue-100" : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="relative">
              <Icon size={20} />
              {isHovered && !isCollapsed && <motion.div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" layoutId="hoverDot" />}
            </div>
            {!isCollapsed && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="ml-3 font-medium text-sm">{item.label}</motion.span>}
          </Link>
        </motion.div>
      );
    })}
  </nav>
);

const SidebarFooter = ({ isCollapsed }) => (
  <motion.div className="p-4 border-t border-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-xs font-bold">A</span>
        </div>
        <motion.div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
      </div>

      {!isCollapsed && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="ml-3">
          <p className="text-sm font-medium">Super Admin</p>
          <p className="text-xs text-gray-400">Online</p>
        </motion.div>
      )}
    </div>
  </motion.div>
);