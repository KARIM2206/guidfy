'use client';

import { useState, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';

// ✅ استدعاء useLessonsByStep لجلب البيانات مباشرة
import {
  useLessonsByStep,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/app/hooks/useLesson'; // تأكد من صحة مسار الملف
import { useAuth } from '@/app/CONTEXT/AuthProvider';

import Button from '../../../../ui/Button';
import LessonForm from './LessonForm';
import LessonItem from './LessonItem';
import DeleteModel from '../DeleteModel';

// ✅ إزالة lessons و loading من الـ props والاعتماد على الـ Hook
const LessonList = memo(({ stepId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ─── UI State ───
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lessonId, setLessonId] = useState(null);

  // ─── Queries & Mutations ───
  // ✅ استخدام الـ Hook لجلب الدروس الخاصة بالخطوة
  const { data: lessons = [], isLoading } = useLessonsByStep(stepId);

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();
  
  console.log('LessonList Fetched lessons:', lessons);

  // ─── Handlers ───
  const handleAdd = useCallback(() => {
    setEditingLesson(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setLessonId(id);
    setIsOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!lessonId) return;
    await deleteMutation.mutateAsync(lessonId);
    setIsOpen(false);
    setLessonId(null);
  }, [lessonId, deleteMutation]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingLesson(null);
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      if (editingLesson) {
        await updateMutation.mutateAsync({ id: editingLesson.id, data });
      } else {
        await createMutation.mutateAsync({
          stepId,
          data: { ...data, stepId },
        });
      }
      setShowForm(false);
      setEditingLesson(null);
    },
    [editingLesson, stepId, createMutation, updateMutation]
  );

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h5 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
          <BookOpen size={18} />
          Lessons ({lessons.length})
        </h5>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
          >
            <Plus size={14} className="mr-1" />
            Add Lesson
          </Button>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <LessonItem
                lesson={lesson}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ الاعتماد على isLoading بدلاً من loading القادمة من الـ props */}
        {lessons.length === 0 && !isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm text-center py-6"
          >
            No lessons available
          </motion.p>
        )}

        {isLoading && (
          <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <LessonForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          stepId={stepId}
          lesson={editingLesson}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Modal */}
      <DeleteModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        confirmDelete={confirmDelete}
      />
    </div>
  );
});

LessonList.displayName = 'LessonList';

export default LessonList;