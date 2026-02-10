"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BadgeCheck, PlayCircle } from "lucide-react";


const CourseHeader = ({
  title,
  description,
  thumbnailUrl,
  badge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-10">
        {/* Left Content */}
        <div className="flex flex-col justify-center text-white space-y-4">
          {badge && (
            <span className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium w-fit">
              <BadgeCheck size={16} />
              {badge}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight">
            {title}
          </h1>

          <p className="text-white/90 text-base md:text-lg max-w-xl">
            {description}
          </p>

          <div className="flex items-center gap-4 pt-4">
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
              <PlayCircle size={20} />
              Preview Course
            </button>
          </div>
        </div>

        {/* Right Thumbnail */}
        <div className="relative w-full h-[220px] md:h-[280px] lg:h-full rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CourseHeader;
