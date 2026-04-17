"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CourseHeader   from "./roadmap/CourseHeader";
import SyllabusSection from "./roadmap/SyllabusSection";
import CourseSidebar  from "./roadmap/CourseSidebar";

const CoursePage = ({ learningPath }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      initial={false}
      animate={mounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">

        <CourseHeader
          title       ={learningPath?.title}
          description ={learningPath?.description}
          thumbnailUrl={learningPath?.image}
          badge={learningPath?.isPublished ? "PUBLISHED" : "DRAFT"}
        />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — Roadmaps */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-2">
              {learningPath?.roadmaps?.length > 0 ? (
                learningPath.roadmaps.map((roadmap) => (
                  <SyllabusSection
                    key    ={roadmap.id}
                    roadmap={roadmap}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400 py-16">
                  No roadmaps available.
                </p>
              )}
            </div>
          </motion.div>

          {/* Right — Sidebar */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:w-1/3 w-full min-w-0 self-start">
          
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <CourseSidebar learningPath={learningPath} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default CoursePage;