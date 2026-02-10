"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Clock, 
  Users, 
  Star, 
  BarChart, 
  Target, 
  Award, 
  Zap, 
  BookOpen,
  CheckCircle,
  PlayCircle,
  Globe,
  Calendar,
  ChevronDown
} from "lucide-react";

const CourseSidebar = () => {
  const containerRef = useRef(null);
  const [showLearningOutcomes, setShowLearningOutcomes] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const learningOutcomes = [
    "Build full-stack applications with Next.js 14",
    "Master React Server Components & Server Actions",
    "Implement authentication with NextAuth.js",
    "Deploy and scale applications on Vercel",
    "Optimize performance and SEO",
    "Work with databases using Prisma ORM",
    "Create responsive and accessible UIs",
    "Test applications with Jest and React Testing Library"
  ];

  const courseMeta = [
    { icon: Clock, label: "Duration", value: "24h 30m", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, label: "Enrolled", value: "12,458", color: "text-green-600", bg: "bg-green-50" },
    { icon: Star, label: "Rating", value: "4.8/5.0", color: "text-yellow-600", bg: "bg-yellow-50" },
    { icon: BarChart, label: "Level", value: "Advanced", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Globe, label: "Language", value: "English", color: "text-cyan-600", bg: "bg-cyan-50" },
    { icon: Calendar, label: "Updated", value: "Nov 2024", color: "text-orange-600", bg: "bg-orange-50" }
  ];

  return (
    <motion.div
      ref={containerRef}
      style={{ y, scale, opacity }}
      className="space-y-6 lg:space-y-8 last:mb-6 md:last:mb-3"
    >
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-16 translate-x-8 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>

        {/* Course Image */}
        <div className="relative mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative h-48 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <BookOpen size={48} className="mx-auto mb-3 opacity-90" />
                <h3 className="text-xl font-bold">Next.js 14</h3>
                <p className="text-sm opacity-90">Masterclass</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-white/90 text-blue-700 text-xs font-bold rounded-full">
                BESTSELLER
              </span>
            </div>
          </motion.div>
        </div>

        {/* Course Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Advanced React & Next.js 14 Masterclass
        </motion.h2>
        <p className="text-gray-600 mb-6">
          Build modern, scalable web applications with the latest React and Next.js features
        </p>

        {/* Instructor Info */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-white/80 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <p className="font-medium text-gray-900">Alex Johnson</p>
            <p className="text-sm text-gray-600">Senior Frontend Engineer</p>
          </div>
          <Award className="ml-auto text-yellow-500" size={20} />
        </div>
      </motion.div>

      {/* Course Meta Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          Course Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courseMeta.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-xl ${item.bg} flex items-center gap-3`}
            >
              <div className={`p-2 rounded-lg bg-white ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Stats */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm font-bold text-blue-600">42%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "42%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <PlayCircle size={14} />
              8 lessons left
            </span>
            <span className="text-gray-600 flex items-center gap-1">
              <CheckCircle size={14} />
              5 completed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Learning Outcomes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <motion.div
          onClick={() => setShowLearningOutcomes(!showLearningOutcomes)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors duration-200 mb-6"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">What You'll Learn</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click to {showLearningOutcomes ? 'collapse' : 'expand'} learning outcomes
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: showLearningOutcomes ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronDown size={24} className="text-gray-600" />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showLearningOutcomes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {learningOutcomes.map((outcome, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-3"
                  >
                    <div className="p-1 rounded-full bg-green-100 mt-1 flex-shrink-0">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <p className="text-gray-700">{outcome}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons - بدون sticky */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200"
          >
            Continue Learning
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200"
          >
            Download Materials
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
          >
            Share Course
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseSidebar;