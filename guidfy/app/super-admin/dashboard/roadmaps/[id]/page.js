'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useSuperAdmin } from '@/app/CONTEXT/SuperAdminContext';
import Button from '@/app/components/ui/Button';

import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, Eye } from 'lucide-react';
// import QuizManager from '@/app/components/QuizManager'; // we'll create this

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const { roadmaps, addStep, updateStep, deleteStep, addLesson, updateLesson, deleteLesson } = useSuperAdmin();
  const roadmap = roadmaps.find((r) => r.id === parseInt(id));

  const [expandedSteps, setExpandedSteps] = useState([]);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({ title: '', order: 0 });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'ARTICLE', content: '' });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({ title: '', content: '' });

  const toggleStep = (stepId) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleStepSubmit = () => {
    if (editingStep) {
      updateStep(roadmap.id, editingStep.id, stepForm);
    } else {
      addStep(roadmap.id, { ...stepForm, lessons: [] });
    }
    setStepModalOpen(false);
  };

  const handleLessonSubmit = () => {
    if (editingLesson) {
      updateLesson(roadmap.id, currentStepId, editingLesson.id, lessonForm);
    } else {
      addLesson(roadmap.id, currentStepId, lessonForm);
    }
    setLessonModalOpen(false);
  };

  const openLessonModal = (stepId, lesson = null) => {
    setCurrentStepId(stepId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ title: lesson.title, type: lesson.type, content: lesson.content });
    } else {
      setEditingLesson(null);
      setLessonForm({ title: '', type: 'ARTICLE', content: '' });
    }
    setLessonModalOpen(true);
  };

  const openPreview = (lesson) => {
    setPreviewContent({ title: lesson.title, content: lesson.content });
    setPreviewModalOpen(true);
  };

  if (!roadmap) return <div>Roadmap not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <h1 className="text-2xl font-bold mb-4">{roadmap.title} - Steps & Lessons</h1>

      <Button
        onClick={() => {
          setEditingStep(null);
          setStepForm({ title: '', order: roadmap.steps.length + 1 });
          setStepModalOpen(true);
        }}
        className="mb-4"
      >
        <Plus size={18} className="mr-2" /> Add Step
      </Button>

      <div className="space-y-2">
        {roadmap.steps
          .sort((a, b) => a.order - b.order)
          .map((step) => (
            <div key={step.id} className="border rounded-md">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center">
                  {expandedSteps.includes(step.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <span className="font-medium ml-2">
                    {step.order}. {step.title}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStep(step);
                      setStepForm({ title: step.title, order: step.order });
                      setStepModalOpen(true);
                    }}
                    className="text-blue-600"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStep(roadmap.id, step.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLessonModal(step.id);
                    }}
                    className="text-green-600"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {expandedSteps.includes(step.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pl-8 space-y-2">
                      {step.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-2 bg-white border rounded">
                          <span>
                            {lesson.title} ({lesson.type})
                          </span>
                          <div className="flex space-x-2">
                            <button onClick={() => openPreview(lesson)} className="text-gray-600">
                              <Eye size={18} />
                            </button>
                            <button onClick={() => openLessonModal(step.id, lesson)} className="text-blue-600">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => deleteLesson(roadmap.id, step.id, lesson.id)} className="text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>

      {/* Step Modal */}
      <Modal isOpen={stepModalOpen} onClose={() => setStepModalOpen(false)} title={editingStep ? 'Edit Step' : 'Add Step'}>
        <Input
          label="Title"
          value={stepForm.title}
          onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
        />
        <Input
          label="Order"
          type="number"
          value={stepForm.order}
          onChange={(e) => setStepForm({ ...stepForm, order: parseInt(e.target.value) })}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setStepModalOpen(false)}>Cancel</Button>
          <Button onClick={handleStepSubmit}>Save</Button>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal isOpen={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}>
        <Input
          label="Title"
          value={lessonForm.title}
          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
        />
        <Select
          label="Type"
          value={lessonForm.type}
          onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
          options={[
            { value: 'ARTICLE', label: 'Article' },
            { value: 'VIDEO', label: 'Video' },
            { value: 'QUIZ', label: 'Quiz' },
          ]}
        />
        {lessonForm.type === 'VIDEO' && (
          <>
            <Input
              label="Video URL (external)"
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            />
            <div className="text-sm text-gray-500">Or upload local file (not implemented in demo)</div>
          </>
        )}
        {lessonForm.type === 'ARTICLE' && (
          <Input
            label="Article Content / URL"
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
          />
        )}
        {lessonForm.type === 'QUIZ' && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Quiz will be managed in the Quiz Manager.</p>
            <Input
              label="Quiz ID (reference)"
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            />
            {/* In a real app, you'd embed QuizManager here or navigate to quiz editor */}
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setLessonModalOpen(false)}>Cancel</Button>
          <Button onClick={handleLessonSubmit}>Save</Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title={previewContent.title}>
        <div className="whitespace-pre-wrap">{previewContent.content}</div>
      </Modal>
    </motion.div>
  );
}