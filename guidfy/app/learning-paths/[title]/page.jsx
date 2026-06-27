'use client';

import { useParams } from 'next/navigation';
import { useTabs } from '@/app/CONTEXT/LearningProvider';
import { useStudentRoadmaps } from '@/app/hooks/useStudent';
import BlogSection from '@/app/components/learning-path/BlogSection';
import JobsSection from '@/app/components/learning-path/Jobs';
import CoursePage from '@/app/components/learning-path/RoadmapSection';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPathPage() {
  const { currentTab } = useTabs();
  const { title } = useParams();

  const {
    data: learningPath,
    isLoading,
    isError,
    error,
  } = useStudentRoadmaps(title);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm font-medium">Loading your learning path...</p>
        </motion.div>
      </div>
    );
  }

  if (isError || !learningPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-100"
        >
          <AlertCircle className="w-8 h-8" />
          <p className="font-medium">{error?.message || 'Failed to load learning path'}</p>
        </motion.div>
      </div>
    );
  }

  const tab = currentTab?.toLowerCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-gray-50">
      {tab === 'jobs' ? (
        <JobsSection learningPathId={learningPath?.id} />
      ) : tab === 'blog' ? (
        <BlogSection />
      ) : (
        <CoursePage learningPath={learningPath} />
      )}
    </motion.div>
  );
}