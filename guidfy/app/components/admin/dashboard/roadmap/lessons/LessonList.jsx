// components/lessons/LessonList.jsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../../../../ui/Button';
import LessonForm from './LessonForm';
import { Plus, BookOpen } from 'lucide-react';
import { useLessons } from '@/app/hooks/useLesson';
import LessonItem from './LessonItem';
import DeleteModel from '../DeleteModel';
import { createPortal } from 'react-dom';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

const LessonList = ({ stepId,lessons }) => {
  const{user}=useAuth()
  const role=user.role=='ADMIN'
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lessonId, setLessonId] = useState(null);
  const { fetchLessonsByStep,currentLesson,removeLesson,refreshTrigger } = useLessons();
  // console.log('lessons in LessonList \n', lessons);
  

  useEffect(() => {
    // console.log('refreshTrigger', refreshTrigger);
    
    if (refreshTrigger || stepId) {
      fetchLessonsByStep(stepId);
    }
  }, [refreshTrigger, stepId]);

  const handleAdd = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

const handleEdit = (lesson) => {
  console.log('Edit lesson ', lesson);
  setEditingLesson(lesson); // lesson كامل
  setShowForm(true);
};

  const handleDelete = (lessonId) => {
    console.log('Delete lesson', lessonId);
setLessonId(lessonId);
setIsOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editingLesson) {
      console.log('Update lesson', editingLesson.id, data);

    } else {
      console.log('Add lesson', { ...data, stepId });
    }
    setShowForm(false);
  };
const confirmDelete =  () => {
  if(!lessonId) return;
  removeLesson(lessonId);
  setIsOpen(false);
}
  // 🔹 Helper لقص التايتل
  const truncateTitle = (title) => {
    if (!title) return '';
    return title.length > 20 ? title.slice(0, 20) + '...' : title;
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h5 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
          <BookOpen size={18} />
          Lessons
        </h5>

      { role&& <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="flex items-center gap-1"
        >
          <Plus size={14} />
          Add Lesson
        </Button>}
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        <AnimatePresence>
          {lessons?.map((lesson) => (
           <LessonItem key={lesson.id} lesson={lesson} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </AnimatePresence>

        {lessons?.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">
            No lessons available
          </p>
        )}
      </div>

      {/* Form Modal */}
      <LessonForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        stepId={stepId}
        lesson={editingLesson}
      />
      {
        createPortal(
          <DeleteModel isOpen={isOpen} onClose={() => setIsOpen(false)} confirmDelete={confirmDelete} />
          ,
          document.body
        )
      }
      
    </div>
  );
};

export default LessonList;