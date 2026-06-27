"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsFetching } from "@tanstack/react-query";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useUpdateLessonProgress, studentKeys } from "@/app/hooks/useStudent";
import { useParams, useRouter } from "next/navigation";

// ── Helper: يتعامل مع progress Object أو Array ──────────────────────
const getProgress = (progress) => {
  if (!progress) return { completed: false, progressPercentage: 0 };
  if (Array.isArray(progress)) {
    return {
      completed: progress[0]?.completed ?? false,
      progressPercentage: progress[0]?.progressPercentage ?? 0,
    };
  }
  return {
    completed: progress.completed ?? false,
    progressPercentage: progress.progressPercentage ?? 0,
  };
};

const SyllabusSection = ({ roadmap }) => {
  const [expandedModule, setExpandedModule] = useState(null);
  const { title: learningPathTitle } = useParams() || {};
  const router = useRouter();
  
  // ✅ Optimistic state: دروس اتعملها Mark مؤقتاً لحد ما الـ Backend يؤكد
  const [optimisticCompleted, setOptimisticCompleted] = useState(new Set());
  
  // ✅ Detect lما الـ React Query بيعيد Fetch
  const isRefetching = useIsFetching({ queryKey: studentKeys.all() }) > 0;

  const { mutate: updateProgress, isPending: isUpdating } = useUpdateLessonProgress();

  const isLocked = roadmap?.locked;

  // ── Roadmap Progress من الـ Backend ───────────────────────────────
  const roadmapProg = roadmap?.roadmap?.progress || {
    totalSteps: 0,
    completedSteps: 0,
    progressPercentage: 0,
    completed: false,
  };

  const toggleModule = (moduleId) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId));
  };

  // ── Mark lesson as read (مع Optimistic Update) ────────────────────
  const handleMarkAsRead = (lessonId) => {
    // 1. أظهر الـ UI على طول إنها completed
    setOptimisticCompleted((prev) => new Set(prev).add(lessonId));

    // 2. ابعت للـ Backend
    updateProgress(
      { lessonId, completed: true },
      {
        onSuccess: () => {
          // ✅ بعد الـ Refetch، امسح الـ Optimistic لأن الـ Backend data هتجي صح
          setTimeout(() => {
            setOptimisticCompleted((prev) => {
              const next = new Set(prev);
              next.delete(lessonId);
              return next;
            });
          }, 500);
        },
        onError: (error) => {
          // ❌ لو فشلت، رجع الـ UI زي ما كان
          setOptimisticCompleted((prev) => {
            const next = new Set(prev);
            next.delete(lessonId);
            return next;
          });
          console.error("[Syllabus] Failed:", error);
          alert(error?.message || "Failed to update progress");
        },
      }
    );
  };

  // ── Render lesson content ───────────────────────────────────────────
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
                  <p className="text-sm font-medium text-gray-900 truncate">External Video</p>
                  <p className="text-xs text-blue-600 truncate">{lesson.video.videoUrl}</p>
                </div>
              </div>
              <a
                href={lesson.video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            </div>
          );
        }
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
            <video controls className="w-full aspect-video" poster={lesson.video.thumbnail || undefined} preload="metadata">
              <source src={lesson.video.videoUrl} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        );

      case "QUIZ":
        return (
          <div className="mt-3 bg-purple-50/50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">Quiz: {lesson.title}</span>
          </div>
        );

      default:
        return (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">{lesson.description || "Read this lesson"}</p>
          </div>
        );
    }
  };

  // ── Locked Roadmap ─────────────────────────────────────────────────
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">🔒 Locked</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Complete the previous level to unlock</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const steps = roadmap?.roadmap?.steps ?? [];
  const isCalculating = !steps || steps.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-2xl border-2 overflow-hidden transition-all relative ${
        roadmapProg.completed ? "border-green-200 bg-green-50/20" : "border-blue-100 bg-white"
      }`}
    >
      {/* ✅ Refetching Overlay — بيظهر لما الـ Backend بيعيد حساب الـ Progress */}
      {isRefetching && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 font-medium">Updating progress...</span>
          </div>
        </div>
      )}

      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${roadmapProg.completed ? "bg-green-100" : "bg-blue-100"}`}>
            {roadmapProg.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <span className="text-sm font-bold text-blue-600">{roadmap.order}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{roadmap.roadmap?.title}</h2>
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
              {roadmapProg.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Completed</span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{roadmap.roadmap?.description}</p>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl flex-shrink-0">
          <div className="relative">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={roadmapProg.completed ? "#22c55e" : "#3B82F6"}
                strokeWidth="3"
                strokeDasharray={`${roadmapProg.progressPercentage}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-700">
              {roadmapProg.progressPercentage}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="font-bold text-gray-900 text-sm">
              {roadmapProg.completedSteps} / {roadmapProg.totalSteps} Steps
            </p>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-5 space-y-4">
        {isCalculating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 font-medium">Loading steps...</p>
          </div>
        ) : steps.length > 0 ? (
          <AnimatePresence>
            {steps.map((step, index) => {
              const stepProg = step.progress || {
                completedLessons: 0,
                totalLessons: 0,
                progressPercentage: 0,
                completed: false,
              };

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    step.locked ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 hover:border-blue-200 bg-white"
                  }`}
                >
                  {/* Step Header */}
                  <button
                    onClick={() => !step.locked && toggleModule(step.id)}
                    disabled={step.locked}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      step.locked ? "cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {step.locked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : stepProg.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm ${step.locked ? "text-gray-400" : "text-gray-900"}`}>{step.title}</h3>
                        {step.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{step.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">
                          {stepProg.completedLessons ?? 0} / {stepProg.totalLessons ?? 0} lessons
                        </p>
                        <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stepProg.progressPercentage ?? 0}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      {!step.locked &&
                        (expandedModule === step.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ))}
                    </div>
                  </button>

                  {/* Lessons */}
                  <AnimatePresence>
                    {expandedModule === step.id && !step.locked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                          {step.lessons?.length > 0 ? (
                            step.lessons.map((lesson) => {
                              // ✅ ندمج الـ Backend data مع الـ Optimistic state
                              const backendProg = getProgress(lesson.progress);
                              const isOptimistic = optimisticCompleted.has(lesson.id);
                              const isRead = lesson.completed || backendProg.completed || isOptimistic;

                              return (
                                <div
                                  key={lesson.id}
                                  className={`bg-white p-4 rounded-lg border transition-all duration-300 ${
                                    isRead ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:shadow-sm"
                                  } ${isOptimistic ? "ring-2 ring-green-300 ring-offset-1" : ""}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isRead ? "bg-green-100" : lesson.type === "VIDEO" ? "bg-blue-50" : "bg-purple-50"
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
                                              {isOptimistic ? "(Saving...)" : "(Completed)"}
                                            </span>
                                          )}
                                        </h4>
                                        {!isRead && !lesson.locked && lesson.type !== "QUIZ" && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkAsRead(lesson.id);
                                            }}
                                            disabled={isUpdating}
                                            className={`flex-shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                                              isUpdating
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                            }`}
                                          >
                                            {isUpdating ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <CheckCheck className="w-3 h-3" />
                                            )}
                                            {isUpdating ? "Saving..." : "Mark as Read"}
                                          </button>
                                        )}
                                        {!isRead && !lesson.locked && lesson.type === "QUIZ" && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (lesson.quiz?.id) {
                                                router.push(`/learning-paths/${learningPathTitle}/quiz/${lesson.quiz.id}`);
                                              } else {
                                                alert("Quiz is not available yet.");
                                              }
                                            }}
                                            className="flex-shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors bg-purple-50 text-purple-700 hover:bg-purple-100"
                                          >
                                            <FileQuestion className="w-3 h-3" />
                                            Take Quiz
                                          </button>
                                        )}
                                        {lesson.locked && (
                                          <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Locked
                                          </span>
                                        )}
                                      </div>
                                      {lesson.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lesson.description}</p>
                                      )}
                                      {renderLessonContent(lesson)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                              <FileQuestion className="w-10 h-10 mb-2" />
                              <p className="text-sm font-medium">No lessons added yet.</p>
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
          <p className="text-center text-gray-400 py-8">No steps available.</p>
        )}
      </div>
    </motion.div>
  );
};

export default SyllabusSection;