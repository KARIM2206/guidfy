"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock, CheckCircle2 } from "lucide-react";
import SyllabusItem from "./SyllabusItem";
import { useSteps } from "@/app/hooks/useStep";
import { useLessons } from "@/app/hooks/useLesson";

const SyllabusSection = ({ roadmap }) => {
  const [expandedModule, setExpandedModule] = useState(null);
  const [stepId, setStepId]                 = useState(null);
  const [loading, setLoading]               = useState(true);

  const { fetchStudentLessonsByStepId, studentLessons } = useLessons();
  const { fetchStudentStepsByRoadmap, studentSteps }    = useSteps();

  const isLocked = roadmap?.locked;   // ← من الـ backend مباشرة
  const progress  = roadmap?.roadmap?.progress || {
    completedSteps    : 0,
    totalSteps        : 0,
    progressPercentage: 0,
    completed         : false,
  };

  // ── Fetch Steps ───────────────────────────────────────
  useEffect(() => {
    // لو الـ roadmap locked → مفيش داعي نجيب الـ steps
    if (!roadmap?.roadmapId || isLocked) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      await fetchStudentStepsByRoadmap(roadmap.roadmapId);
      setLoading(false);
    };
    fetch();
  }, [roadmap?.roadmapId, isLocked]);
console.log('Student Steps in SyllabusSection', studentLessons);

  // ── Fetch Lessons عند فتح Step ────────────────────────
  useEffect(() => {
    if (!stepId) return;

    const fetch = async () => {
      await fetchStudentLessonsByStepId(stepId);
    };
    fetch();
  }, [stepId]);

  const toggleModule = (moduleId) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId));
    setStepId(moduleId);
  };

  // ══════════════════════════════════════════════════════
  // 🔒 لو الـ roadmap locked → اعرض placeholder مخفي
  // ══════════════════════════════════════════════════════
  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 border-2 border-dashed border-gray-200 rounded-2xl 
                   bg-gray-50/50 overflow-hidden"
      >
        <div className="flex items-center gap-4 p-5">
          {/* Lock Icon */}
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center 
                          justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex-1">
            {/* Title مخفي بـ blur */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-400 filter blur-sm select-none">
                {roadmap.roadmap?.title ?? "Locked Level"}
              </h3>
              {roadmap.roadmap?.level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 
                                 text-gray-400 font-medium">
                  {roadmap.roadmap.level}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 
                               text-amber-600 font-medium">
                🔒 Locked
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Complete the previous level to unlock this roadmap
            </p>

            {/* Progress bar فاضية */}
            <div className="mt-2 w-48 h-1.5 bg-gray-200 rounded-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ✅ الـ roadmap مفتوحة — اعرض المحتوى كامل
  // ══════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-2xl border-2 overflow-hidden transition-all ${
        progress.completed
          ? "border-green-200 bg-green-50/20"
          : "border-blue-100 bg-white"
      }`}
    >
      {/* ── Roadmap Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center 
                      justify-between gap-4 p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Order / Completed Badge */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
                           flex-shrink-0 ${
            progress.completed ? "bg-green-100" : "bg-blue-100"
          }`}>
            {progress.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <span className="text-sm font-bold text-blue-600">
                {roadmap.order}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {roadmap.roadmap?.title}
              </h2>
              {roadmap.roadmap?.level && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  roadmap.roadmap.level === "BEGINNER"
                    ? "bg-green-100 text-green-700"
                    : roadmap.roadmap.level === "INTERMEDIATE"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {roadmap.roadmap.level}
                </span>
              )}
              {progress.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full 
                                 bg-green-100 text-green-700 font-medium">
                  ✓ Completed
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {roadmap.roadmap?.description}
            </p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 
                        rounded-xl flex-shrink-0">
          <div className="relative">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#E5E7EB" strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={progress.completed ? "#22c55e" : "#3B82F6"}
                strokeWidth="3"
                strokeDasharray={`${progress.progressPercentage}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center 
                             text-xs font-semibold text-blue-700">
              {progress.progressPercentage}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="font-bold text-gray-900 text-sm">
              {progress.completedSteps} / {progress.totalSteps} Steps
            </p>
          </div>
        </div>
      </div>

      {/* ── Steps List ─────────────────────────────────── */}
      <div className="p-5 space-y-4">
        {loading ? (
          // Skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : studentSteps.length > 0 ? (
          <AnimatePresence>
            {studentSteps.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  module.locked
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : "border-gray-200 hover:border-blue-200 bg-white"
                }`}
              >
                {/* Step Header */}
                <button
                  onClick={() => !module.locked && toggleModule(module.id)}
                  disabled={module.locked}
                  className={`w-full flex items-center justify-between p-4 text-left 
                              transition-colors ${
                    module.locked
                      ? "cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Step Number */}
                    <div className="relative w-9 h-9 rounded-lg bg-white border 
                                    border-gray-200 flex items-center justify-center 
                                    flex-shrink-0">
                      {module.locked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : module.progress?.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-sm font-bold text-gray-600">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className={`font-semibold text-sm ${
                        module.locked ? "text-gray-400" : "text-gray-900"
                      }`}>
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Lesson Count + Progress */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">
                        {module.progress?.completedLessons ?? 0} /
                        {module.progress?.totalLessons ?? 0} lessons
                      </p>
                      <div className="w-28 h-1.5 bg-gray-200 rounded-full 
                                      overflow-hidden mt-1">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${module.progress?.progressPercentage ?? 0}%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {!module.locked && (
                      expandedModule === module.id
                        ? <ChevronUp  className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Lessons */}
                <AnimatePresence>
                  {expandedModule === module.id && !module.locked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
                        {studentLessons.length > 0 ? (
                          studentLessons.map((lesson) => (
                            <SyllabusItem
                              key     ={lesson.id}
                              lesson  ={lesson}
                              stepId  ={module.id}
                              roadmapId={roadmap.id}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">
                            No lessons available
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-center text-gray-400 py-8">
            No steps available for this roadmap.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SyllabusSection;