"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";
import SyllabusItem from "./SyllabusItem";

const SyllabusSection = () => {
  const [expandedModule, setExpandedModule] = useState(0);

  const modules = [
    {
      id: 1,
      title: "Module 1: React Fundamentals",
      description: "Learn the core concepts of React",
      lessons: [
        { id: 1, title: "Introduction to React", duration: "45 min", completed: true },
        { id: 2, title: "JSX and Components", duration: "60 min", completed: true },
        { id: 3, title: "State and Props", duration: "75 min", completed: false },
      ],
    },
    {
      id: 2,
      title: "Module 2: Advanced React Patterns",
      description: "Master hooks and performance optimization",
      lessons: [
        { id: 4, title: "Custom Hooks", duration: "90 min", completed: false },
        { id: 5, title: "Context API", duration: "50 min", completed: false },
        { id: 6, title: "React Performance", duration: "80 min", completed: false },
      ],
    },
    {
      id: 3,
      title: "Module 3: Next.js 14 Deep Dive",
      description: "Explore App Router and new features",
      lessons: [
        { id: 7, title: "App Router vs Pages", duration: "70 min", completed: false },
        { id: 8, title: "Server Components", duration: "85 min", completed: false },
        { id: 9, title: "API Routes", duration: "65 min", completed: false },
      ],
    },
    {
      id: 4,
      title: "Module 4: State Management",
      description: "Learn Zustand and React Query",
      lessons: [
        { id: 10, title: "Zustand Basics", duration: "55 min", completed: false },
        { id: 11, title: "React Query Setup", duration: "75 min", completed: false },
        { id: 12, title: "Advanced Patterns", duration: "90 min", completed: false },
      ],
    },
    {
      id: 5,
      title: "Module 5: Authentication & Security",
      description: "Implement secure auth flows",
      lessons: [
        { id: 13, title: "NextAuth.js", duration: "80 min", completed: false },
        { id: 14, title: "Middleware Protection", duration: "60 min", completed: false },
        { id: 15, title: "API Security", duration: "70 min", completed: false },
      ],
    },
    {
      id: 6,
      title: "Module 6: Deployment & Monitoring",
      description: "Deploy to production with best practices",
      lessons: [
        { id: 16, title: "Vercel Deployment", duration: "50 min", completed: false },
        { id: 17, title: "Performance Monitoring", duration: "65 min", completed: false },
        { id: 18, title: "SEO Optimization", duration: "75 min", completed: false },
      ],
    },
  ];

  const completedLessons = modules.flatMap(module => 
    module.lessons.filter(lesson => lesson.completed)
  ).length;
  const totalLessons = modules.flatMap(module => module.lessons).length;

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Syllabus</h2>
            <p className="text-gray-600 mt-1">Complete the modules to finish the course</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
            <div className="relative">
              <svg className="w-12 h-12" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${(completedLessons / totalLessons) * 100}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-700">
                {Math.round((completedLessons / totalLessons) * 100)}%
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="font-bold text-gray-900">
                {completedLessons} / {totalLessons} Lessons Complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <AnimatePresence>
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200">
                    <span className="font-bold text-gray-700">{module.id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {module.lessons.filter(l => l.completed).length} / {module.lessons.length} lessons
                    </p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: `${(module.lessons.filter(l => l.completed).length / module.lessons.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  {expandedModule === module.id ? (
                    <ChevronUp className="text-gray-500" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={24} />
                  )}
                </div>
              </button>

              {/* Module Content (Animated Expand/Collapse) */}
              <AnimatePresence>
                {expandedModule === module.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 md:p-5 bg-white border-t border-gray-100">
                      <div className="space-y-3">
                        {module.lessons.map((lesson) => (
                          <SyllabusItem
                            key={lesson.id}
                            title={lesson.title}
                            duration={lesson.duration}
                            completed={lesson.completed}
                          />
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors text-sm">
                          Start Module {module.id}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
            <p className="text-sm text-gray-600">Modules</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-sm text-gray-600">Lessons</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">24h 30m</p>
            <p className="text-sm text-gray-600">Total Duration</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusSection;