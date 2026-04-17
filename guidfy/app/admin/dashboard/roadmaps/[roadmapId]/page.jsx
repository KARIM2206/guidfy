// app/(admin)/roadmaps/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Tag, BarChart, Clock, User, Users } from 'lucide-react';

// Hooks & Context
import { useRoadmaps } from '@/app/hooks/useRoadmaps';
import { useSteps } from '@/app/hooks/useStep';

// Components
import Loader from '@/app/components/ui/Loader';
import Button from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import StepList from '@/app/components/admin/dashboard/roadmap/step/StepList';
import StepForm from '@/app/components/admin/dashboard/roadmap/step/StepForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';

export default function RoadmapDetailPage() {
  const { roadmapId: id } = useParams();
  const router = useRouter();

  // Roadmap context
  const { currentRoadmap, fetchRoadmapById, loading: roadmapLoading } = useRoadmaps();

  // Steps context
  const {
    steps,
    currentStep,
    loading: stepsLoading,
    fetchStepsByRoadmap,
    fetchStepById,
    createStep,
    editStep,
    removeStep,
    refreshTrigger,
    setRefreshSteps,
  } = useSteps();

  // Local state
  const [stepId, setStepId] = useState(null);
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, stepId: null });

  // Fetch roadmap details
  useEffect(() => {
    if (id || refreshTrigger) fetchRoadmapById(id);
  }, [id, fetchRoadmapById, refreshTrigger]); // refreshSteps might be needed if roadmap updates

  // Fetch steps when id or refreshSteps changes
  useEffect(() => {
    if (id) fetchStepsByRoadmap(id);
  }, [id, fetchStepsByRoadmap, refreshTrigger]);

  // Fetch single step when stepId changes (optional)
  useEffect(() => {
    if (stepId) fetchStepById(stepId);
  }, [stepId, fetchStepById]);

  // Handlers
  const handleAddStep = () => {
    setEditingStep({});
    setStepFormOpen(true);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
    setStepFormOpen(true);
  };

  const handleDeleteClick = (stepId) => {
    setDeleteModal({ open: true, stepId });
  };

  const confirmDelete = async () => {
    if (deleteModal.stepId) {
      try {
        await removeStep(deleteModal.stepId);
        // Steps list will update via context state update
        setDeleteModal({ open: false, stepId: null });
      } catch (error) {
        console.error('Failed to delete step:', error);
      }
    }
  };

  const handleStepSubmit = async (data) => {
    if (editingStep?.id) {
      // Update existing step
      await editStep(editingStep.id, data);
    } else {
      // Create new step
      await createStep({ ...data, roadmapId: id });
    }
    setStepFormOpen(false);
  };

  // Loading state
  if (roadmapLoading || !currentRoadmap) {
    return <Loader />;
  }

  return (
    <div>
      {/* Header with back button and title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-2  mb-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {currentRoadmap.title}
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => router.push('edit')}
            className="gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit size={18} />
            Edit Roadmap
          </Button>
        </motion.div>
      </motion.div>

      {/* Roadmap Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 mb-8"
      >
        {currentRoadmap.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-700 mb-6 leading-relaxed"
          >
            {currentRoadmap.description}
          </motion.p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-800">{currentRoadmap.category}</p>
            </div>
          </motion.div>

          {/* Level */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div
              className={`p-2 rounded-lg ${
                currentRoadmap.level === 'BEGINNER'
                  ? 'bg-green-100'
                  : currentRoadmap.level === 'INTERMEDIATE'
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              }`}
            >
              <BarChart
                size={20}
                className={
                  currentRoadmap.level === 'BEGINNER'
                    ? 'text-green-600'
                    : currentRoadmap.level === 'INTERMEDIATE'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium text-gray-800">{currentRoadmap.level}</p>
            </div>
          </motion.div>

          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-800">{currentRoadmap.estimatedDuration} minutes</p>
            </div>
          </motion.div>

          {/* Created By */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium text-gray-800">{currentRoadmap.createdBy?.name || 'Unknown'}</p>
            </div>
          </motion.div>

          {/* Enrolled Students */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled Students</p>
              <p className="font-medium text-gray-800">{currentRoadmap.enrolledUsers?.length || 0}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step List */}
      <StepList
        steps={steps} // Use steps from context
        roadmapId={id}
        stepsLength={currentRoadmap?.steps?.length || 0}
        setStepId={setStepId}
        onAddStep={handleAddStep}
        onEditStep={handleEditStep}
        onDeleteStep={handleDeleteClick}
      />

      {/* Step Form Modal */}
      <StepForm
        isOpen={stepFormOpen}
        onClose={() => setStepFormOpen(false)}
        onSubmit={handleStepSubmit}
        initialData={editingStep}
      />

      {/* Delete Confirmation Modal */}
  <DeleteModel isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, stepId: null })} confirmDelete={confirmDelete} />
    </div>
  );
}