"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  FileQuestion,
  Play,
  ExternalLink,
  Eye,
  CheckCheck,
} from "lucide-react";
import { useSteps } from "@/app/hooks/useStep";
import { useLessons } from "@/app/hooks/useLesson";

// Helper to get stored progress from localStorage
const getStoredProgress = (roadmapId) => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`roadmap_progress_${roadmapId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper to save progress to localStorage
const saveProgress = (roadmapId, progress) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`roadmap_progress_${roadmapId}`, JSON.stringify(progress));
};

const SyllabusSection = ({ roadmap }) => {
  const [expandedModule, setExpandedModule] = useState(null);
  const [stepId, setStepId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local state for lessons of currently opened step
  const [currentLessons, setCurrentLessons] = useState(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // PERSISTENT progress state - survives refresh
  const [persistentProgress, setPersistentProgress] = useState(() => {
    return getStoredProgress(roadmap?.roadmapId) || {
      completedLessons: [],
      stepProgress: {},
      roadmapProgress: {
        completedSteps: 0,
        totalSteps: 0,
        progressPercentage: 0,
        completed: false,
      },
    };
  });

  const {
    fetchStudentLessonsByStepId,
    studentLessons,
    markLessonAsCompleted,
  } = useLessons();
  const { fetchStudentStepsByRoadmap, studentSteps } = useSteps();

  const isLocked = roadmap?.locked;

  // ── Save to localStorage whenever progress changes ─────────────────
  useEffect(() => {
    if (roadmap?.roadmapId && persistentProgress) {
      saveProgress(roadmap.roadmapId, persistentProgress);
    }
  }, [persistentProgress, roadmap?.roadmapId]);

  // ── Initialize from localStorage on mount ─────────────────
  useEffect(() => {
    if (roadmap?.roadmapId) {
      const stored = getStoredProgress(roadmap.roadmapId);
      if (stored) {
        setPersistentProgress(stored);
      }
    }
  }, [roadmap?.roadmapId]);

  // ── Fetch steps when roadmap loads ─────────────────
  useEffect(() => {
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

  // ── Fetch lessons when selecting a specific step ──────────────
  const loadLessonsForStep = useCallback(
    async (id) => {
      if (!id) return;
      setLessonsLoading(true);
      setCurrentLessons(null);
      try {
        await fetchStudentLessonsByStepId(id);
      } catch (error) {
        console.error("Failed to fetch lessons", error);
        setCurrentLessons([]);
        setLessonsLoading(false);
      }
    },
    [fetchStudentLessonsByStepId]
  );

  // Sync studentLessons from hook to local state + MERGE with persistent progress
  useEffect(() => {
    if (stepId && studentLessons) {
      // Merge API data with persistent progress
      const mergedLessons = studentLessons.map((lesson) => ({
        ...lesson,
        progress: {
          ...lesson.progress,
          completed:
            lesson.progress?.completed ||
            persistentProgress.completedLessons.includes(lesson.id),
        },
      }));

      setCurrentLessons(mergedLessons);
      setLessonsLoading(false);
    }
  }, [studentLessons, stepId, persistentProgress.completedLessons]);

  // When stepId changes, start fetching
  useEffect(() => {
    if (stepId) {
      loadLessonsForStep(stepId);
    }
  }, [stepId, loadLessonsForStep]);

  const toggleModule = (moduleId) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId));
    setStepId(moduleId);
    setCurrentLessons(null);
  };

  // ── Mark lesson as read - PERSISTENT VERSION ─────────────────
  const handleMarkAsRead = async (lessonId) => {
    try {
      // 1. Call API first
      if (markLessonAsCompleted) {
        await markLessonAsCompleted(lessonId);
      }

      // 2. Update persistent progress
      setPersistentProgress((prev) => {
        const newCompleted = [...prev.completedLessons];
        if (!newCompleted.includes(lessonId)) {
          newCompleted.push(lessonId);
        }

        // Calculate new step progress
        const stepLessons = currentLessons || [];
        const completedInStep = stepLessons.filter(
          (l) => newCompleted.includes(l.id) || l.progress?.completed
        ).length;
        const totalInStep = stepLessons.length;
        const stepPercentage =
          totalInStep > 0 ? Math.round((completedInStep / totalInStep) * 100) : 0;

        const newStepProgress = {
          ...prev.stepProgress,
          [stepId]: {
            completedLessons: completedInStep,
            totalLessons: totalInStep,
            progressPercentage: stepPercentage,
            completed: stepPercentage === 100 && totalInStep > 0,
          },
        };

        // Calculate new roadmap progress
        const totalSteps = studentSteps.length;
        const completedSteps = Object.values(newStepProgress).filter(
          (sp) => sp.completed
        ).length;
        const roadmapPercentage =
          totalSteps > 0
            ? Math.round((completedSteps / totalSteps) * 100)
            : 0;

        const newProgress = {
          completedLessons: newCompleted,
          stepProgress: newStepProgress,
          roadmapProgress: {
            completedSteps,
            totalSteps,
            progressPercentage: roadmapPercentage,
            completed: roadmapPercentage === 100 && totalSteps > 0,
          },
        };

        // Save immediately
        saveProgress(roadmap.roadmapId, newProgress);
        return newProgress;
      });

      // 3. Update current lessons UI immediately
      setCurrentLessons((prev) =>
        prev?.map((l) =>
          l.id === lessonId
            ? { ...l, progress: { ...l.progress, completed: true } }
            : l
        )
      );
    } catch (error) {
      console.error("Failed to mark lesson as read", error);
    }
  };

  // ── Render lesson card based on type ─────────────────────
  const renderLessonContent = (lesson) => {
    switch (lesson.type) {
      case "VIDEO":
        if (!lesson.video) return null;
        if (lesson.video.isExternal) {
          return (
            <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    External Video
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {lesson.video.videoUrl}
                  </p>
                </div>
              </div>
              <a
                href={lesson.video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Link
              </a>
            </div>
          );
        } else {
          return (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
              <video
                controls
                className="w-full aspect-video"
                poster={lesson.video.thumbnail || undefined}
                preload="metadata"
              >
                <source src={lesson.video.videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          );
        }

      case "QUIZ":
        return (
          <div className="mt-3 bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">
              Quiz: {lesson.title}
            </span>
          </div>
        );

      default:
        return (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              {lesson.description || "Read this lesson"}
            </p>
          </div>
        );
    }
  };

  // ── If roadmap is locked ─────────────────────────
  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 overflow-hidden"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-400 filter blur-sm select-none">
                {roadmap.roadmap?.title ?? "Locked Level"}
              </h3>
              {roadmap.roadmap?.level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-400 font-medium">
                  {roadmap.roadmap.level}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                🔒 Locked
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Complete the previous level to unlock this roadmap
            </p>
            <div className="mt-2 w-48 h-1.5 bg-gray-200 rounded-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Use persistent progress (survives refresh)
  const displayProgress = persistentProgress.roadmapProgress;

  // ── Roadmap is open ─────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-2xl border-2 overflow-hidden transition-all ${
        displayProgress.completed
          ? "border-green-200 bg-green-50/20"
          : "border-blue-100 bg-white"
      }`}
    >
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              displayProgress.completed ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            {displayProgress.completed ? (
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
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    roadmap.roadmap.level === "BEGINNER"
                      ? "bg-green-100 text-green-700"
                      : roadmap.roadmap.level === "INTERMEDIATE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {roadmap.roadmap.level}
                </span>
              )}
              {displayProgress.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
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
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl flex-shrink-0">
          <div className="relative">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={displayProgress.completed ? "#22c55e" : "#3B82F6"}
                strokeWidth="3"
                strokeDasharray={`${displayProgress.progressPercentage}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-700">
              {displayProgress.progressPercentage}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="font-bold text-gray-900 text-sm">
              {displayProgress.completedSteps} / {displayProgress.totalSteps}{" "}
              Steps
            </p>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-5 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : studentSteps.length > 0 ? (
          <AnimatePresence>
            {studentSteps.map((module, index) => {
              // Use persistent step progress
              const stepProg =
                persistentProgress.stepProgress[module.id] ||
                module.progress || {
                  completedLessons: 0,
                  totalLessons: 0,
                  progressPercentage: 0,
                  completed: false,
                };

              return (
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
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      module.locked ? "cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {module.locked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : stepProg.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-sm ${
                            module.locked ? "text-gray-400" : "text-gray-900"
                          }`}
                        >
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
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">
                          {stepProg.completedLessons ?? 0} / 
                          {stepProg.totalLessons ?? 0} lessons
                        </p>
                        <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${stepProg.progressPercentage ?? 0}%`,
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {!module.locked &&
                        (expandedModule === module.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ))}
                    </div>
                  </button>

                  {/* Step Content (Lessons) */}
                  <AnimatePresence>
                    {expandedModule === module.id && !module.locked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                          {lessonsLoading ? (
                            [...Array(2)].map((_, i) => (
                              <div
                                key={i}
                                className="h-20 bg-gray-200 rounded-lg animate-pulse"
                              />
                            ))
                          ) : currentLessons && currentLessons.length > 0 ? (
                            currentLessons.map((lesson) => {
                              // Check completion from persistent state FIRST
                              const isRead =
                                persistentProgress.completedLessons.includes(
                                  lesson.id
                                ) || lesson.progress?.completed;

                              return (
                                <div
                                  key={lesson.id}
                                  className={`bg-white p-4 rounded-lg border transition-shadow ${
                                    isRead
                                      ? "border-green-200 bg-green-50/30"
                                      : "border-gray-200 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Type Icon */}
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isRead
                                          ? "bg-green-100"
                                          : lesson.type === "VIDEO"
                                          ? "bg-blue-50"
                                          : "bg-purple-50"
                                      }`}
                                    >
                                      {isRead ? (
                                        <CheckCheck className="w-4 h-4 text-green-600" />
                                      ) : lesson.type === "VIDEO" ? (
                                        <Play className="w-4 h-4 text-blue-600" />
                                      ) : lesson.type === "QUIZ" ? (
                                        <FileQuestion className="w-4 h-4 text-purple-600" />
                                      ) : (
                                        <Eye className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm text-gray-900">
                                          {lesson.title}
                                          {isRead && (
                                            <span className="ml-2 text-xs text-green-600 font-normal">
                                              (Completed)
                                            </span>
                                          )}
                                        </h4>
                                        {!isRead && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkAsRead(lesson.id);
                                            }}
                                            className="flex-shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                          >
                                            <CheckCheck className="w-3 h-3" />
                                            Mark as Read
                                          </button>
                                        )}
                                      </div>
                                      {lesson.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                          {lesson.description}
                                        </p>
                                      )}
                                      {/* Render content based on type */}
                                      {renderLessonContent(lesson)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                              <FileQuestion className="w-10 h-10 mb-2" />
                              <p className="text-sm font-medium">
                                No lessons added yet for this step.
                              </p>
                              <p className="text-xs mt-1">
                                Content will appear here once the instructor adds
                                lessons.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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