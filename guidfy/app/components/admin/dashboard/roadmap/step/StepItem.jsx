'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, ChevronDown, Eye, BookOpen } from 'lucide-react';
import LessonList from '../lessons/LessonList';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import Link from 'next/link';
// import { Link } from 'next/link';


const StepItem = memo(({ step, index, onEdit, onDelete, setStepId }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);
  const { user } = useAuth();

  // ✅ بيانات حقيقية من الـ API
  const lessons = step?.lessons ?? [];
  const lessonCount = lessons.length;

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => {
      if (!prev) setHasExpanded(true);
      return !prev;
    });
  }, []);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(step);
  }, [onEdit, step]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(step?.id);
  }, [onDelete, step?.id]);

  const handleSetStepId = useCallback((e) => {
    e.stopPropagation();
    setStepId(step.id);
    router.push(`/admin/roadmaps/${step.roadmapId}/steps/${step.id}`);
  }, [setStepId, step?.id]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Step Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-800 truncate">{step?.title}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen size={12} />
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {user?.role === 'ADMIN' && (
            <Link
              href={`${step?.roadmapId}/steps/${step?.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="View step details"
            >
              <Eye size={25} />
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Edit step"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                title="Delete step"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}

          <button
            onClick={handleToggle}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {hasExpanded && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key={`step-${step?.id}-content`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                {step?.description && (
                  <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                )}
                
                {/* ✅ بيانات حقيقية من الـ step */}
                <LessonList
                  stepId={step?.id}
                  lessons={lessons}
                  loading={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
});

StepItem.displayName = 'StepItem';

export default StepItem;