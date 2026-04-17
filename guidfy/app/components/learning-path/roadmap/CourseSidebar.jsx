"use client";

import { motion } from "framer-motion";
import {
  Clock,
  BarChart,
  CheckCircle,
  PlayCircle,
  Calendar,
} from "lucide-react";

const CourseSidebar = ({ learningPath }) => {
  if (!learningPath) return null;

  const {
    title,
    description,
    estimatedDuration,
    updatedAt,
    image,
    roadmaps = [],
  } = learningPath;

  /* ================================
     ✅ حساب Progress حقيقي
  ================================= */

  const totalRoadmaps = roadmaps.length;

  const totalProgress = roadmaps.reduce((acc, item) => {
    return acc + (item.roadmap?.progress?.progressPercentage || 0);
  }, 0);

  const averageProgress =
    totalRoadmaps === 0
      ? 0
      : Math.round(totalProgress / totalRoadmaps);

  const completedRoadmaps = roadmaps.filter(
    (item) => item.roadmap?.progress?.completed
  ).length;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-GB")
    : null;

  return (
    <div className="space-y-6">

      {/* ================= Header ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

        {image && (
          <div className="h-40 rounded-xl overflow-hidden">
            <img
              src={`http://localhost:8000${image}`}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

       <div className="relative group">
  <h2 className="text-xl font-bold text-gray-900 break-words line-clamp-2">
    {title}
  </h2>

  {/* Tooltip */}
  <div className="absolute z-20 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-2 mt-2 w-max max-w-xs">
    {title}
  </div>
</div>

       <div className="relative group">
  <p className="text-sm text-gray-600 break-words line-clamp-3">
    {description}
  </p>

  {/* Tooltip */}
  <div className="absolute z-20 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-2 mt-2 w-max max-w-xs">
    {description}
  </div>
</div>
      </div>

      {/* ================= Course Info ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            Duration
          </span>
          <span className="font-semibold">
            {estimatedDuration} hrs
          </span>
        </div>

        {/* Roadmaps */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <BarChart size={16} />
            Roadmaps
          </span>
          <span className="font-semibold">
            {totalRoadmaps}
          </span>
        </div>

        {/* Completed */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={16} />
            Completed
          </span>
          <span className="font-semibold">
            {completedRoadmaps}/{totalRoadmaps}
          </span>
        </div>

        {/* Updated */}
        {formattedDate && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              Updated
            </span>
            <span className="font-semibold">
              {formattedDate}
            </span>
          </div>
        )}

      </div>

      {/* ================= Progress ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

        <div className="flex justify-between text-sm">
          <span>Your Progress</span>
          <span className="font-bold text-blue-600">
            {averageProgress}%
          </span>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${averageProgress}%` }}
            transition={{ duration: 0.8 }}
            className="h-2 bg-blue-600 rounded-full"
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <PlayCircle size={14} />
            {totalRoadmaps - completedRoadmaps} left
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} />
            {completedRoadmaps} done
          </span>
        </div>

      </div>

    </div>
  );
};

export default CourseSidebar;