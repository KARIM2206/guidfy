'use client';

import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5"
    >
      {/* صورة skeleton (اختياري) */}
      <div className="h-40 -mx-5 -mt-5 mb-4 bg-gray-200 animate-pulse" />

      {/* العنوان والشارات */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse" />
      </div>

      {/* الوصف */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>

      {/* شريط التقدم (اختياري) */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse" />
      </div>

      {/* التذييل */}
      <div className="flex justify-between items-center border-t pt-3">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    </motion.div>
  );
}