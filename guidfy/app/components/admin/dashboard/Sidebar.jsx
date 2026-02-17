// app/components/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  FileText,
  Map,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminContext } from "@/app/CONTEXT/AdminProvider";

const navigationItems = [
  {
    id: "",
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    id: "articles",
    label: "Articles",
    icon: FileText,
    active: false,
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: Map,
    active: false,
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    active: false,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    active: false,
  },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const router = useRouter();
  const { openSidebar, setOpenSidebar } = useAdminContext();
 const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const handleItemClick = (id) => {
    setActiveItem(id);
    router.push(`/admin/dashboard/${id}`);
    // In a real app, you would also update the main content based on active item
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {openSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black opacity-50  z-40 lg:hidden"
                onClick={() => setOpenSidebar(false)}
              />
              <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, type: "tween", stiffness: 300 }}
                exit={{ x: -100, opacity: 0 }}
                className={`fixed left-0 top-16 flex-col 
bg-gradient-to-b from-gray-900 to-gray-800
flex z-50
text-white h-[calc(100vh-4rem)] shadow-2xl ${
                  isCollapsed ? "w-20" : "w-64"
                } transition-all duration-300 ease-in-out`}
              >
                {/* Logo Section */}
                <motion.div
                  className="flex items-center justify-between p-6 border-b border-gray-700"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3 group">
                    {/* Logo / Arrow container */}
                    <motion.div className="relative p-2 bg-blue-600 rounded-lg cursor-pointer">
                      {/* Logo */}
                      <motion.div
                        className={`transition-opacity duration-200 ${
                          isCollapsed ? "group-hover:opacity-0" : ""
                        }`}
                      >
                        <GraduationCap size={24} />
                      </motion.div>

                      {/* Arrow on hover when collapsed */}
                      {isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setIsCollapsed(false)}
                          className="absolute inset-0 flex items-center justify-center opacity-0 
                          group-hover:opacity-100 cursor-ew-resize transition-opacity"
                        >
                          <ChevronRight size={20} />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Title */}
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <h1 className="text-xl font-bold">EduAdmin</h1>
                          <p className="text-xs text-gray-400">
                            Non-Profit Platform
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Collapse Toggle Button */}
                  <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`${isCollapsed ? "hidden" : " "} p-1.5 rounded-lg  bg-gray-800 hover:bg-gray-700 transition-colors`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isCollapsed ? (
                      <ChevronRight size={18} />
                    ) : (
                      <ChevronLeft size={18} />
                    )}
                  </motion.button>
                </motion.div>

                {/* Navigation Section */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  <h3
                    className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ${
                      isCollapsed ? "text-center" : "px-3"
                    }`}
                  >
                    {!isCollapsed && "Navigation"}
                  </h3>

                  {navigationItems.map((item) => {
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
                        {/* Active Indicator Background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/10 rounded-lg"
                            layoutId="activeBackground"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Active Indicator Bar */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-r-full"
                            initial={false}
                            animate={{ scaleY: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Navigation Item */}
                        <button
                          onClick={() => handleItemClick(item.id)}
                          className={`relative flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? "text-blue-100"
                              : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                          } ${isCollapsed ? "justify-center" : ""}`}
                        >
                          <div className="relative">
                            <Icon size={20} />
                            {isHovered && !isCollapsed && (
                              <motion.div
                                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              />
                            )}
                          </div>

                          <AnimatePresence mode="wait">
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="ml-3 font-medium text-sm"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {/* Hover Animation */}
                          {isHovered && !isActive && (
                            <motion.div
                              className="absolute inset-0 bg-white/5 rounded-lg"
                              layoutId="hoverBackground"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Footer Section */}
                <motion.div
                  className="p-4 border-t border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold">A</span>
                      </div>
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="ml-3"
                        >
                          <p className="text-sm font-medium">Admin User</p>
                          <p className="text-xs text-gray-400">Online</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`hidden  flex-col bg-gradient-to-b from-gray-900 to-gray-800 
      md:flex
       
         text-white h-screen shadow-2xl ${
           isCollapsed ? "w-20" : "w-64"
         } transition-all duration-300 ease-in-out sticky top-0`}
      >
        {/* Logo Section */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3 group">
            {/* Logo / Arrow container */}
            <motion.div className="relative p-2 bg-blue-600 rounded-lg cursor-pointer">
              {/* Logo */}
              <motion.div
                className={`transition-opacity duration-200 ${
                  isCollapsed ? "group-hover:opacity-0" : ""
                }`}
              >
                <GraduationCap size={24} />
              </motion.div>

              {/* Arrow on hover when collapsed */}
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

            {/* Title */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-xl font-bold">EduAdmin</h1>
                  <p className="text-xs text-gray-400">Non-Profit Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse Toggle Button */}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`${isCollapsed ? "hidden" : " "} p-1.5 rounded-lg  bg-gray-800 hover:bg-gray-700 transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </motion.button>
        </motion.div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <h3
            className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ${
              isCollapsed ? "text-center" : "px-3"
            }`}
          >
            {!isCollapsed && "Navigation"}
          </h3>

          {navigationItems.map((item) => {
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
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/10 rounded-lg"
                    layoutId="activeBackground"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-r-full"
                    initial={false}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Navigation Item */}
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`relative flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-100"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {isHovered && !isCollapsed && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      />
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Hover Animation */}
                  {isHovered && !isActive && (
                    <motion.div
                      className="absolute inset-0 bg-white/5 rounded-lg"
                      layoutId="hoverBackground"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer Section */}
        <motion.div
          className="p-4 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold">A</span>
              </div>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-400">Online</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
