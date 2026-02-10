"use client";

import { useTabs } from "@/app/CONTEXT/LearningProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Menu, X, ChevronDown, MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ✅ FIX: mounted hook */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function HeaderSection({ title, navLinks }) {
  const mounted = useMounted();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentTab, setCurrentTab } = useTabs();
  const menuRef = useRef(null);

  /* ✅ Prevent hydration mismatch */
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  /* 🚨 مهم جدًا */
  if (!mounted) return null;

  return (
    <>
      {/* ===== Compact Header (Scroll State) ===== */}
      <motion.div
        initial={false}
        animate={{ y: isScrolled ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 left-0 right-0 bg-white/90 backdrop-blur-md 
                   border-b border-gray-200 shadow-sm z-40 lg:hidden"
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.div>
            <h2 className="text-lg font-bold text-gray-800 truncate ">
              {decodeURIComponent(title)}
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </motion.div>

      {/* ===== Main Header ===== */}
      <motion.header
        initial={false}
        className={`
          fixed top-16 left-0 right-0 z-40
          bg-gradient-to-b from-white via-white/95 to-white/90
          backdrop-blur-sm border-b border-gray-200/50
          ${isScrolled ? "shadow-sm" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">

            {/* ===== Top Row ===== */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 md:gap-6">
                <motion.button
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                >
                  <div className="p-2 rounded-full bg-gray-100 hover:bg-blue-100">
                    <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-blue-500" />
                  </div>
                </motion.button>

                <motion.h1
                  initial={false}
                  animate={{
                    scale: isScrolled ? 0.9 : 1,
                    opacity: isScrolled ? 0.95 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold
                             bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700
                             bg-clip-text text-transparent"
                >
                  {decodeURIComponent(title)}
                </motion.h1>
              </div>

              {/* Desktop Nav */}
              <MenuIcon  className="md:hidden block w-6 h-6"  onClick={() => setIsOpen(!isOpen)} onMouseLeave={() => setIsOpen(false)}/>
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = currentTab === link.name;
                  return (
                    <motion.button
                      key={link.name}
                      onClick={() => setCurrentTab(link.name)}
                      whileHover={{ y: -2 }}
                      className={`px-4 py-2 rounded-lg font-medium
                        ${isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <link.icon size={18} />
                        {link.name}
                      </div>
                    </motion.button>
                  );
                })}
              </nav>
              <AnimatePresence>
                {isOpen && (
  <div
    ref={menuRef}
    className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-50"
  >
    <div className="flex flex-col">
      {navLinks.map((link) => {
        const isActive = currentTab === link.name;

        return (
          <motion.button
            key={link.name}
            onClick={() => {
              setCurrentTab(link.name);
              setIsOpen(false);
            }}
            whileHover={{ y: -2 }}
            className={`px-4 py-2 rounded-lg font-medium text-left
              ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-2">
              <link.icon size={18} />
              {link.name}
            </div>
          </motion.button>
        );
      })}
    </div>
  </div>
)}

              </AnimatePresence>
            </div>
            {/* ===== Collapsible Content ===== */}
            <motion.div
              initial={false}
              animate={{
                opacity: isScrolled ? 0 : 1,
                height: isScrolled ? 0 : "auto",
                marginTop: isScrolled ? 0 : 16,
              }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 text-sm md:text-base lg:text-lg ml-14 max-w-3xl">
                Explore comprehensive learning resources, detailed references,
                career opportunities, and practical projects
              </p>

              <div className="hidden lg:flex items-center gap-2 mt-4 ml-14">
                <div className="px-4 py-2 bg-blue-50 rounded-full text-blue-700">
                  <ChevronDown className="inline w-4 h-4 mr-1" />
                  {currentTab}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.header>
    </>
  );
}
