'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Tag, BarChart, Clock, User, Users } from 'lucide-react';

import { useRoadmapById } from '@/app/hooks/useRoadmaps';
import {
  useStepsByRoadmap,
  useStepById,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from '@/app/hooks/useStep';

import Loader from '@/app/components/ui/Loader';
import Button from '@/app/components/ui/Button';
import StepList from '@/app/components/admin/dashboard/roadmap/step/StepList';
import StepForm from '@/app/components/admin/dashboard/roadmap/step/StepForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const router = useRouter();

  // ─── UI State ───
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, stepId: null });
  const [stepId, setStepId] = useState(null);

  // ─── Queries ───
  const { data: roadmapData, isLoading: roadmapLoading } = useRoadmapById(roadmapId);
  const { data: stepsData, isLoading: stepsLoading } = useStepsByRoadmap(roadmapId);
  
  useStepById(stepId);

  // ─── Mutations ───
  const createStepMutation = useCreateStep();
  const updateStepMutation = useUpdateStep();
  const deleteStepMutation = useDeleteStep();

  // ─── Derived Data ───
  const currentRoadmap = roadmapData?.data ?? roadmapData;
  const steps = stepsData ?? [];

  const isMutating =
    createStepMutation.isPending ||
    updateStepMutation.isPending ||
    deleteStepMutation.isPending;

  // ─── Handlers ───
  const handleAddStep = useCallback(() => {
    setEditingStep({});
    setStepFormOpen(true);
  }, []);

  const handleEditStep = useCallback((step) => {
    setEditingStep(step);
    setStepFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((stepId) => {
    setDeleteModal({ open: true, stepId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteModal.stepId) {
      try {
        // ✅ ابعت roadmapId عشان invalidate يشتغل صح
        await deleteStepMutation.mutateAsync({ 
          id: deleteModal.stepId, 
          roadmapId: roadmapId 
        });
        setDeleteModal({ open: false, stepId: null });
      } catch (error) {
        console.error('Failed to delete step:', error);
      }
    }
  }, [deleteModal.stepId, deleteStepMutation, roadmapId]);

  const handleStepSubmit = useCallback(
    async (formData) => {
      if (editingStep?.id) {
        // ✅ Update
        await updateStepMutation.mutateAsync({ 
          id: editingStep.id, 
          data: { ...formData, roadmapId: roadmapId } 
        });
      } else {
        // ✅ Create - roadmapId هنا ضروري
        await createStepMutation.mutateAsync({ 
          ...formData, 
          roadmapId: roadmapId 
        });
      }
      setStepFormOpen(false);
      setEditingStep({});
    },
    [editingStep, roadmapId, createStepMutation, updateStepMutation]
  );

  // ─── Loading State ───
  if (roadmapLoading || !currentRoadmap) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
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
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
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
              <p className="font-medium text-gray-800">
                {currentRoadmap.estimatedDuration} minutes
              </p>
            </div>
          </motion.div>

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
              <p className="font-medium text-gray-800">
                {currentRoadmap.createdBy?.name || 'Unknown'}
              </p>
            </div>
          </motion.div>

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
              <p className="font-medium text-gray-800">
                {currentRoadmap.enrolledUsers?.length || 0}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step List */}
      <StepList
        steps={steps}
        roadmapId={roadmapId}
        stepsLength={steps?.length || 0}
        setStepId={setStepId}
        onAddStep={handleAddStep}
        onEditStep={handleEditStep}
        onDeleteStep={handleDeleteClick}
        loading={stepsLoading || isMutating}
      />

      {/* Step Form Modal */}
      <StepForm
        isOpen={stepFormOpen}
        onClose={() => {
          setStepFormOpen(false);
          setEditingStep({});
        }}
        onSubmit={handleStepSubmit}
        initialData={editingStep}
        loading={createStepMutation.isPending || updateStepMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, stepId: null })}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}