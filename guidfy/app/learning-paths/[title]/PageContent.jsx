'use client';
import HeaderSection from "@/app/components/learning-path/HeaderSection";
import NavigationGrid from "@/app/components/learning-path/NavigationGrid";
import { useTabs } from "@/app/CONTEXT/LearningProvider";
import { useEffect } from "react";
import { motion } from "framer-motion";


export default function PageContent({ title, navLinks, children }) {
  const { currentTab, setCurrentTab } = useTabs();

//   useEffect(() => {
   
//     setCurrentTab(currentHref);
//   }, []);

  const handleNavClick = (link) => {
    const p = link.title
    setCurrentTab(p);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br flex flex-col gap-4 from-gray-50 to-gray-100 p-4"
    >
      <HeaderSection title={title} navLinks={navLinks} />

      {/* <NavigationGrid
        navLinks={navLinks}
     
        title={title}
      /> */}
<div className="lg:mt-55 mt-40 md:mt-43  ">
   {children}
</div>
     
    </motion.div>
  );
}
