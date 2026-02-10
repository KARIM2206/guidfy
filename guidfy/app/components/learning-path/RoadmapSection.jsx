"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import CourseHeader from "./roadmap/CourseHeader";
import SyllabusSection from "./roadmap/SyllabusSection";
import CourseSidebar from "./roadmap/CourseSidebar";

const CoursePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={mounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen  bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ✅ Course Header (رجع مكانه الطبيعي) */}
        <CourseHeader
          title="Advanced React & Next.js 14 Masterclass"
          description="Master modern web development with the latest technologies"
          thumbnailUrl="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          badge="BESTSELLER"
        />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:w-[65%]"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <SyllabusSection />
            </div>
          </motion.div>

          {/* Right Column */}
        <motion.div
  initial={false}
  animate={mounted ? { opacity: 1, x: 0 } : {}}
  transition={{ delay: 0.3 }}
  className="lg:w-[35%] self-start"
>
  <div className="sticky top-8 ">
   <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8  ">

      <CourseSidebar />
    </div>
  </div>
</motion.div>

        </div>

        {/* Footer */}
     
      </div>
    </motion.div>
  );
};

export default CoursePage;
