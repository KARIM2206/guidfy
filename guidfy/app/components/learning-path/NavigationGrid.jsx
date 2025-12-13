"use client";

import { motion, AnimatePresence } from "framer-motion";
import NavCard from "./NavCard";
import { useTabs } from "@/app/CONTEXT/LearningProvider";

export default function NavigationGrid({
  navLinks,

  title,
}) {
  const { currentTab, setCurrentTab } = useTabs();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const underlineVariants = {
    inactive: { width: 0, opacity: 0 },
    active: {
      width: "100%",
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="lg:grid hidden  lg:grid-cols-4 gap-4 md:gap-6"
    >
      <AnimatePresence>
        {navLinks.map((link, index) => (
          <NavCard
            key={link.name}
            link={link}
            index={index}
            isActive={currentTab === link.href.split("/")[1]}
            itemVariants={itemVariants}
            underlineVariants={underlineVariants}
            iconVariants={iconVariants}
          
            title={title}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
