"use client";

import { motion } from "framer-motion";
import CourseHeader from "./roadmap/CourseHeader";
import SyllabusSection from "./roadmap/SyllabusSection";
import CourseSidebar from "./roadmap/CourseSidebar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function CoursePage({ learningPath }) {
  const roadmaps = learningPath?.roadmaps ?? [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <CourseHeader
            title={learningPath?.title}
            description={learningPath?.description}
            thumbnailUrl={learningPath?.image}
            badge={learningPath?.isPublished ? "PUBLISHED" : "DRAFT"}
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Roadmaps List */}
          <motion.div variants={itemVariants} className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
              {roadmaps.length > 0 ? (
                roadmaps.map((roadmap, index) => (
                  <motion.div
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SyllabusSection roadmap={roadmap} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 space-y-2">
                  <p className="text-gray-400 text-lg font-medium">
                    No roadmaps available.
                  </p>
                  <p className="text-gray-300 text-sm">
                    This learning path doesn&apos;t have any roadmaps yet.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right — Sidebar */}
          <motion.div
            variants={itemVariants}
            className="lg:w-1/3 w-full min-w-0 self-start"
          >
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
}