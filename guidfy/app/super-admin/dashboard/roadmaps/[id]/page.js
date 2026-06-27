'use client';

/* ═══════════════════════════════════════════════════════════
   Admin Assignment Modal Component
   ═══════════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  UserPlus,
  Trash2,
  Shield,
  Plus,
  CheckCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { useAdmins } from '@/app/hooks/useAdmins';
import Button from '@/app/components/ui/Button';

function AdminAssignmentModal({ isOpen, onClose, roadmap, onAssign, onRemove, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: allAdmins = [], isLoading: adminsLoading } = useAdmins();

  const assignedAdminIds = useMemo(() => {
    const ids = new Set();
    roadmap?.assignments?.forEach((a) => {
      const id = a.admin?.id ?? a.adminId;
      if (id) ids.add(id);
    });
    return ids;
  }, [roadmap]);

  const currentAdmins = useMemo(() => {
    return (
      roadmap?.assignments
        ?.map((a) => a.admin)
        .filter(Boolean)
        .filter((admin, index, self) => 
          self.findIndex((a) => a?.id === admin?.id) === index
        ) || []
    );
  }, [roadmap]);

  const availableAdmins = useMemo(() => {
    return allAdmins.filter((admin) => !assignedAdminIds.has(admin.id));
  }, [allAdmins, assignedAdminIds]);

  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return availableAdmins;
    const q = searchQuery.toLowerCase();
    return availableAdmins.filter(
      (admin) =>
        admin.name?.toLowerCase().includes(q) ||
        admin.email?.toLowerCase().includes(q)
    );
  }, [availableAdmins, searchQuery]);

  const toggleSelection = (adminId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(adminId)) {
        next.delete(adminId);
      } else {
        next.add(adminId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = filteredAdmins.map((a) => a.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleAssign = () => {
    if (selectedIds.size === 0) return;
    onAssign(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-xl h-fit max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                  <Users size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Manage Admins</h3>
                  <p className="text-sm text-gray-500">
                    {currentAdmins.length} assigned · {availableAdmins.length} available
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-all"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield size={14} className="text-amber-500" />
                    Currently Assigned
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                      {currentAdmins.length}
                    </span>
                  </h4>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {currentAdmins.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 text-gray-400 text-sm bg-gray-50/80 rounded-xl border border-dashed border-gray-200"
                      >
                        <Users size={24} className="mx-auto mb-2 text-gray-300" />
                        No admins assigned yet
                      </motion.div>
                    ) : (
                      currentAdmins.map((admin) => (
                        <motion.div
                          key={admin.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, scale: 0.9 }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-red-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {admin.avatar ? (
                              <img
                                src={admin.avatar}
                                alt={admin.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {admin.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {admin.name}
                              </p>
                              <p className="text-xs text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemove(admin.id)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Remove admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">
                    Add Admins
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search admins by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {filteredAdmins.length > 0 && (
                    <button
                      onClick={selectAll}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2.5 rounded-xl border border-indigo-200 transition-all whitespace-nowrap"
                    >
                      {filteredAdmins.every((a) => selectedIds.has(a.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-gray-100 bg-gray-50/30">
                  {adminsLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Loading admins...
                    </div>
                  ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <Search size={24} className="mx-auto mb-2 text-gray-300" />
                      {searchQuery
                        ? 'No matching admins found'
                        : 'All available admins are assigned'}
                    </div>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isSelected = selectedIds.has(admin.id);
                      return (
                        <motion.button
                          key={admin.id}
                          layout
                          onClick={() => toggleSelection(admin.id)}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-all rounded-lg mx-1 my-0.5 ${
                            isSelected
                              ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                              : 'hover:bg-white hover:shadow-sm border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle size={14} className="text-white" />}
                          </div>

                          {admin.avatar ? (
                            <img
                              src={admin.avatar}
                              alt={admin.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500'
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}
                            >
                              {admin.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {admin.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                          </div>

                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full"
                            >
                              Selected
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>

                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={handleAssign}
                        disabled={isLoading}
                        className="w-full gap-2 py-3 text-base"
                        variant="primary"
                      >
                        <UserPlus size={18} />
                        {isLoading
                          ? 'Assigning...'
                          : `Assign ${selectedIds.size} Admin${selectedIds.size > 1 ? 's' : ''}`}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stat Card Component
   ═══════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, color, delay }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    pink: 'bg-pink-50 border-pink-100 text-pink-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`p-4 rounded-xl border ${colors[color] || colors.blue}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-white/60">{icon}</div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Tag,
  BarChart,
  Clock,
  User,
  Eye,
  XCircle,
  EyeOff,
  Crown,
} from 'lucide-react';

import {
  useRoadmapById,
  useToggleRoadmap,
  useUpdateRoadmap,
  useAssignAdmin,
  useRemoveAdmin,
} from '@/app/hooks/useRoadmaps';
import {
  useStepsByRoadmap,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from '@/app/hooks/useStep';

import Loader from '@/app/components/ui/Loader';
import StepList from '@/app/components/admin/dashboard/roadmap/step/StepList';
import StepForm from '@/app/components/admin/dashboard/roadmap/step/StepForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import ConfirmModal from '@/app/components/admin/dashboard/ConfirmModal';
import RoadmapForm from '@/app/components/super-admin/dashboard/RoadmapsForm';

export default function SuperAdminRoadmapDetailPage() {
  const { roadmapId: id } = useParams();
  const router = useRouter();

  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, stepId: null });
  const [isOpenConfirmModel, setIsOpenConfirmModel] = useState(false);
  const [stepId, setStepId] = useState(null);
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const { data: roadmapData, isLoading: roadmapLoading } = useRoadmapById(id);
  const { data: stepsData, isLoading: stepsLoading } = useStepsByRoadmap(id);

  const toggleMutation = useToggleRoadmap();
  const updateRoadmapMutation = useUpdateRoadmap();
  const createStepMutation = useCreateStep();
  const updateStepMutation = useUpdateStep();
  const deleteStepMutation = useDeleteStep();
  const assignAdminMutation = useAssignAdmin();
  const removeAdminMutation = useRemoveAdmin();

  const currentRoadmap = roadmapData?.data ?? roadmapData;
  const steps = stepsData ?? [];

  const isMutating =
    toggleMutation.isPending ||
    updateRoadmapMutation.isPending ||
    createStepMutation.isPending ||
    updateStepMutation.isPending ||
    deleteStepMutation.isPending ||
    assignAdminMutation.isPending ||
    removeAdminMutation.isPending;

  const handlePublish = useCallback(async () => {
    try {
      await toggleMutation.mutateAsync(id);
      setIsOpenConfirmModel(false);
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  }, [id, toggleMutation]);

  const handleEditRoadmap = useCallback(async (formData) => {
    try {
      await updateRoadmapMutation.mutateAsync({ id, data: formData });
      setShowRoadmapForm(false);
    } catch (err) {
      console.error('Failed to update roadmap:', err);
    }
  }, [id, updateRoadmapMutation]);

  const handleAssignAdmins = useCallback(async (adminIds) => {
    try {
      await assignAdminMutation.mutateAsync({ roadmapId: id, adminIds });
    } catch (err) {
      console.error('Failed to assign admins:', err);
    }
  }, [id, assignAdminMutation]);

  const handleRemoveAdmin = useCallback(async (adminId) => {
    try {
      await removeAdminMutation.mutateAsync({ roadmapId: id, adminId });
    } catch (err) {
      console.error('Failed to remove admin:', err);
    }
  }, [id, removeAdminMutation]);

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
        await deleteStepMutation.mutateAsync(deleteModal.stepId);
        setDeleteModal({ open: false, stepId: null });
      } catch (error) {
        console.error('Failed to delete step:', error);
      }
    }
  }, [deleteModal.stepId, deleteStepMutation]);

  const handleStepSubmit = useCallback(
    async (data) => {
      if (editingStep?.id) {
        await updateStepMutation.mutateAsync({ id: editingStep.id, data });
      } else {
        await createStepMutation.mutateAsync({ ...data, roadmapId: id });
      }
      setStepFormOpen(false);
      setEditingStep({});
    },
    [editingStep, id, createStepMutation, updateStepMutation]
  );

  if (roadmapLoading || !currentRoadmap) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  const assignedAdmins = currentRoadmap.assignments?.map((a) => a.admin).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 min-h-screen bg-gray-50/50"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
          
          <div className="relative group/title">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-[300px] md:max-w-[500px]"
            >
              {currentRoadmap.title}
            </motion.h1>
            <div className="absolute left-0 top-full mt-2 hidden group-hover/title:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs break-words">
                {currentRoadmap.title}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <Button
            variant={currentRoadmap.isPublished ? 'secondary' : 'outline'}
            onClick={() => setIsOpenConfirmModel(true)}
            className="gap-2"
            disabled={toggleMutation.isPending}
          >
            {currentRoadmap.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
            {currentRoadmap.isPublished ? 'Unpublish' : 'Publish'}
          </Button>

          <Button variant="outline" onClick={() => setShowRoadmapForm(true)} className="gap-2">
            <Edit size={16} />
            Edit
          </Button>

          <Button
            variant="primary"
            onClick={() => setShowAdminModal(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white hover:opacity-90"
          >
            <UserPlus size={16} />
            Admins
            {assignedAdmins.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs">
                {assignedAdmins.length}
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8"
      >
        {currentRoadmap.description && (
          <div className="relative group/desc mb-8">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base line-clamp-2">
              {currentRoadmap.description}
            </p>
            <div className="absolute left-0 top-full mt-2 hidden group-hover/desc:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-md break-words">
                {currentRoadmap.description}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Tag size={18} />} label="Category" value={currentRoadmap.category} color="blue" delay={0.4} />
          
          <StatCard
            icon={<BarChart size={18} />}
            label="Level"
            value={currentRoadmap.level}
            color={
              currentRoadmap.level === 'BEGINNER' ? 'green' :
              currentRoadmap.level === 'INTERMEDIATE' ? 'yellow' : 'red'
            }
            delay={0.5}
          />
          
          <StatCard icon={<Clock size={18} />} label="Duration" value={`${currentRoadmap.estimatedDuration} min`} color="purple" delay={0.6} />
          <StatCard icon={<User size={18} />} label="Created By" value={currentRoadmap.createdBy?.name || 'Unknown'} color="indigo" delay={0.7} />
          <StatCard icon={<Users size={18} />} label="Enrolled" value={currentRoadmap.enrollments?.length || 0} color="pink" delay={0.8} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="sm:col-span-2 lg:col-span-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Shield size={16} className="text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Assigned Admins</p>
              </div>
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
              >
                Manage
              </button>
            </div>
            
            {assignedAdmins.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Crown size={14} />
                No admins assigned yet
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {assignedAdmins.map((admin) => (
                    <motion.div
                      key={admin.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white rounded-full border border-amber-200 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {admin.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{admin.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className={`p-4 rounded-xl border ${
              currentRoadmap.isPublished
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${currentRoadmap.isPublished ? 'bg-green-100' : 'bg-red-100'}`}>
                {currentRoadmap.isPublished ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700">Status</p>
            </div>
            <p className={`font-medium ${currentRoadmap.isPublished ? 'text-green-700' : 'text-red-700'}`}>
              {currentRoadmap.isPublished ? 'Published' : 'Draft'}
            </p>
          </motion.div>
        </div>

        <ConfirmModal
          confirmToggle={handlePublish}
          isOpen={isOpenConfirmModel}
          onClose={() => setIsOpenConfirmModel(false)}
        />
      </motion.div>

      <StepList
        steps={steps || []}
        stepsLength={steps?.length}
        setStepId={setStepId}
        roadmapId={id}
        onAddStep={handleAddStep}
        onEditStep={handleEditStep}
        onDeleteStep={handleDeleteClick}
        loading={stepsLoading || isMutating}
      />

      <StepForm
        isOpen={stepFormOpen}
        onCancel={() => { setStepFormOpen(false); setEditingStep({}); }}
        onSubmit={handleStepSubmit}
        initialData={editingStep}
        loading={createStepMutation.isPending || updateStepMutation.isPending}
      />

      <DeleteModel
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, stepId: null })}
        confirmDelete={confirmDelete}
      />

      <RoadmapForm
        isOpen={showRoadmapForm}
        onCancel={() => setShowRoadmapForm(false)}
        onSubmit={handleEditRoadmap}
        initialData={currentRoadmap}
        loading={updateRoadmapMutation.isPending}
        learningPathId={currentRoadmap.learningPathId}
        admins={[]}
      />

      <AdminAssignmentModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        roadmap={currentRoadmap}
        onAssign={handleAssignAdmins}
        onRemove={handleRemoveAdmin}
        isLoading={assignAdminMutation.isPending || removeAdminMutation.isPending}
      />
    </motion.div>
  );
}