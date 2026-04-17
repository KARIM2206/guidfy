'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, ChevronDown, ChevronUp, BookOpen, Eye, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import LessonList from '../lessons/LessonList';
import { useLessons } from '@/app/hooks/useLesson';
import { getLessonsByStep } from '@/services/admin/lesson';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

const StepItem = ({ step, index, onEdit, onDelete, setStepId }) => {
  const [expanded, setExpanded] = useState(false);
const {lessonsByStep,fetchLessonsByStep} = useLessons()
const {user}=useAuth()
useEffect(()=>{
if(step.id) fetchLessonsByStep(step.id)
},[step.id])
  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Step Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{step?.title}</h4>
            {/* ✅ بيظهر بس لو lessons موجودة وليست undefined */}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen size={12} />
              {step?.lessons.length} lesson{step?.lessons.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View button */}
          {setStepId && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setStepId(step.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View step details"
            >
              <Eye size={18} />
            </motion.button>
          )}

{
user.role=='ADMIN'&&       
<>
   <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(step);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Edit step"
          >
            <Edit size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(step?.id);
            }}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
            title="Delete step"
          >
            <Trash2 size={18} />
          </motion.button>
          </>
}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
              setStepId(step.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-4">
              {step?.description && (
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
              )}
              {/* ✅ بنبعت lessons مضمونة كـ array */}
              <LessonList stepId={step?.id} lessons={lessonsByStep[step?.id]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StepItem;