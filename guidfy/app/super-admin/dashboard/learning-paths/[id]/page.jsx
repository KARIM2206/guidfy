'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Tag,
  BarChart,
  Clock,
  User,
  Users,
  BookOpen,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react';

import { useLearningPathById, useUpdateLearningPath } from '@/app/hooks/useLearningPath';
import {
  useRoadmaps,
  useCreateRoadmap,
  useUpdateRoadmap,
  useDeleteRoadmap,
} from '@/app/hooks/useRoadmaps';

import Loader from '@/app/components/ui/Loader';
import Button from '@/app/components/ui/Button';
import RoadmapForm from '@/app/components/super-admin/dashboard/RoadmapsForm';
import LearningPathForm from '@/app/components/super-admin/dashboard/LearningPathForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';

export default function LearningPathDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const numericId = Number(id); // ✅ حول لـ number عشان الـ comparison يشتغل

  // ─── UI State ───
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [lpModalOpen, setLpModalOpen] = useState(false);

  // ─── Queries ───
  const { data: lpData, isLoading: lpLoading } = useLearningPathById(id);
  const { data: roadmapsData, isLoading: roadmapsLoading } = useRoadmaps({
    learningPathId: id,
  });

  // ─── Mutations ───
  const createMutation = useCreateRoadmap();
  const updateMutation = useUpdateRoadmap();
  const deleteMutation = useDeleteRoadmap();
  const updateLpMutation = useUpdateLearningPath();

  // ─── Derived Data ───
  const currentLearningPath = lpData?.data ?? lpData;

  // ✅ الـ API بيرجع { data: [...], pagination: {...} }
  const allRoadmaps = roadmapsData?.data ?? roadmapsData ?? [];

  // ✅ فلترة صحيحة: نفحص كل learningPaths array ونقارن بـ number
  const relatedRoadmaps = useMemo(() => {
    if (!numericId || isNaN(numericId)) return [];
    return allRoadmaps.filter((rm) =>
      rm.learningPaths?.some((lp) => lp.learningPathId === numericId)
    );
  }, [allRoadmaps, numericId]);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // ─── Handlers ───
  const handleAddRoadmap = useCallback(() => {
    setEditingRoadmap(null);
    setRoadmapModalOpen(true);
  }, []);

  const handleEditRoadmap = useCallback((roadmap) => {
    setEditingRoadmap(roadmap);
    setRoadmapModalOpen(true);
  }, []);

  const handleDeleteRoadmap = useCallback((roadmapId) => {
    setDeleteModal({ open: true, id: roadmapId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteModal.id) {
      await deleteMutation.mutateAsync(deleteModal.id);
      setDeleteModal({ open: false, id: null });
    }
  }, [deleteModal.id, deleteMutation]);

  const handleRoadmapSubmit = useCallback(
    async (formData) => {
      const payload = { ...formData, learningPathId: numericId };
      if (editingRoadmap) {
        await updateMutation.mutateAsync({
          id: editingRoadmap.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setRoadmapModalOpen(false);
      setEditingRoadmap(null);
    },
    [editingRoadmap, numericId, createMutation, updateMutation]
  );

  const handleLpSubmit = useCallback(
    async (formData) => {
      await updateLpMutation.mutateAsync({
        id,
        data: formData,
      });
      setLpModalOpen(false);
    },
    [id, updateLpMutation]
  );

  if (lpLoading || !currentLearningPath) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 min-h-screen bg-gray-50"
    >
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
          <h1 className="text-2xl font-bold text-gray-900">
            {currentLearningPath.title}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setLpModalOpen(true)}
          className="gap-2"
        >
          <Edit size={18} />
          Edit Path
        </Button>
      </motion.div>

      {/* Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8"
      >
        {currentLearningPath.description && (
          <p className="text-gray-700 mb-6 leading-relaxed">
            {currentLearningPath.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Level */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div
              className={`p-2 rounded-lg ${
                currentLearningPath.level === 'Beginner'
                  ? 'bg-green-100'
                  : currentLearningPath.level === 'Intermediate'
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              }`}
            >
              <BarChart
                size={20}
                className={
                  currentLearningPath.level === 'Beginner'
                    ? 'text-green-600'
                    : currentLearningPath.level === 'Intermediate'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.level}
              </p>
            </div>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.category}
              </p>
            </div>
          </motion.div>

          {/* Jobs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jobs Available</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.jobs?.toLocaleString() || 0}
              </p>
            </div>
          </motion.div>

          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.projects || 0}
              </p>
            </div>
          </motion.div>

          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-pink-100 rounded-lg">
              <Clock size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. Duration</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.estimatedDuration || 'N/A'}
              </p>
            </div>
          </motion.div>

          {/* Created By */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-gray-200 rounded-lg">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium text-gray-800">
                {currentLearningPath.createdBy?.name || 'Unknown'}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Roadmaps Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Roadmaps in this Path ({relatedRoadmaps.length})
          </h2>
          <Button onClick={handleAddRoadmap} size="sm">
            <Plus size={16} className="mr-1" /> Add Roadmap
          </Button>
        </div>

        {roadmapsLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : relatedRoadmaps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No roadmaps yet. Click &quot;Add Roadmap&quot; to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedRoadmaps.map((roadmap, index) => (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="relative max-w-[75%] group/title">
                    <h3 className="font-semibold text-gray-800 truncate cursor-pointer">
                      {roadmap.title}
                    </h3>
                    <div className="absolute left-0 top-full mt-1 hidden group-hover/title:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg max-w-xs">
                        {roadmap.title}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      roadmap.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {roadmap.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {roadmap.description || 'No description provided.'}
                </p>

                {/* Assignments */}
                {roadmap.assignments?.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Users size={14} />
                    <span className="truncate">
                      {roadmap.assignments.length} admin(s) assigned
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`${roadmap?.learningPaths[0]?.learningPathId}/roadmaps/${roadmap.id}`)
                      }
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleEditRoadmap(roadmap)}
                      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteRoadmap(roadmap.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <span className="text-xs text-gray-400 font-medium">
                    {roadmap.steps?.length || 0} steps
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Learning Path Modal */}
      {currentLearningPath && (
        <LearningPathForm
          isOpen={lpModalOpen}
          initialData={currentLearningPath}
          onSubmit={handleLpSubmit}
          onCancel={() => setLpModalOpen(false)}
        />
      )}

      {/* Form Modal */}
      <RoadmapForm
        isOpen={roadmapModalOpen}
        loading={isMutating}
        initialData={editingRoadmap}
        onSubmit={handleRoadmapSubmit}
        onCancel={() => {
          setRoadmapModalOpen(false);
          setEditingRoadmap(null);
        }}
      />

      {/* Delete Modal */}
      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        confirmDelete={confirmDelete}
      />
    </motion.div>
  );
}