'use client';

import { useEffect, useState } from 'react';
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
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  EyeClosed,
  EyeOff,
} from 'lucide-react';

// Hooks
import { useRoadmaps } from '@/app/hooks/useRoadmaps';
import { useSteps } from '@/app/hooks/useStep';

// Components
import Loader from '@/app/components/ui/Loader';
import Button from '@/app/components/ui/Button';
import StepList from '@/app/components/admin/dashboard/roadmap/step/StepList';
import StepForm from '@/app/components/admin/dashboard/roadmap/step/StepForm';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import ConfirmModal from '@/app/components/admin/dashboard/ConfirmModal';
import { toggleRoadmapPublish } from '@/services/admin/roadmap';

export default function SuperAdminRoadmapDetailPage() {
  const { roadmapId: id } = useParams();
  const router = useRouter();

  // Roadmap context
  const { currentRoadmap, fetchRoadmapById, loading: roadmapLoading } = useRoadmaps();

  // Steps context
  const {
    steps,
    loading: stepsLoading,
    fetchStepsByRoadmap,
    currentStep,
    fetchStepById,
    createStep,
    editStep,
    removeStep,
    refreshTrigger,
  } = useSteps();

  // Local state
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, stepId: null });
  const [isOpenconfirmModel, setIsOpenConfirmModel] = useState(false);
const [stepId,setStepId]=useState(null)
  // Fetch roadmap details
  useEffect(() => {
    if (id) fetchRoadmapById(id);
  }, [id, fetchRoadmapById, refreshTrigger]);
console.log(currentRoadmap,'currentRoadmap in roadmap page');
console.log(steps,'stepId in roadmap page');
  // Fetch steps when id changes
  const handleFetchSteps = async() => {
    try {
      await fetchStepsByRoadmap(currentRoadmap.id);
    } catch (error) {
      console.error(error);
      
    }
  }
useEffect(() => {
  if (currentRoadmap?.id) {
    handleFetchSteps()
  }
}, [currentRoadmap, fetchStepsByRoadmap, refreshTrigger]);
  useEffect(() => {
    if (stepId) fetchStepById(stepId);
  }, [stepId, fetchStepById]);
console.log(currentRoadmap,'current roadmap');

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
        setDeleteModal({ open: false, stepId: null });
      } catch (error) {
        console.error('Failed to delete step:', error);
      }
    }
  };
const handlePublish = async () => {
  try {
    await toggleRoadmapPublish(id); // ننتظر تغيير الحالة
    setIsOpenConfirmModel(false);
    await fetchRoadmapById(id); // نجيب الحالة الجديدة بعد التغيير
  } catch (err) {
    console.error("Failed to toggle publish:", err);
  }
};

  const handleStepSubmit = async (data) => {
    if (editingStep?.id) {
      await editStep(editingStep.id, data);
    } else {
      await createStep({ ...data, roadmapId: id });
    }
    setStepFormOpen(false);
  };

  if (roadmapLoading || !currentRoadmap) {
    return <Loader />;
  }

  // Extract assigned admins from assignments (if any)
  const assignedAdmins = currentRoadmap.assignments?.map((a) => a.admin) || [];

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
          <div className="relative max-w-[200px] sm:max-w-[300px] md:max-w-[500px] group/title">
  <motion.h1
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate cursor-pointer"
  >
    {currentRoadmap.title}
  </motion.h1>

  {/* Tooltip */}
  <div className="absolute left-0 top-full mt-2 hidden group-hover/title:block z-[9999]">
    <div className="bg-gray-900 text-white text-xs sm:text-sm rounded-md px-3 py-2 shadow-lg max-w-xs break-words">
      {currentRoadmap.title}
    </div>
  </div>
</div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className='flex items-center gap-2'
        >
         <Button
        variant={currentRoadmap.isPublished ? "secondary" : "outline"} // ثانوي للـ Published و Outline للـ Unpublished
        onClick={() => setIsOpenConfirmModel(true)}
        className="gap-2  px-3 py-1"
      >
        <span>{currentRoadmap.isPublished ?<EyeOff size={16}/> :<Eye size={16} />}</span>
       <span> {currentRoadmap.isPublished ? "Unpublish" : "Publish"}</span>
      </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/super-admin/dashboard/roadmaps/${id}/edit`)}
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
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8"
      >
        {currentRoadmap.description && (
          <div className="relative group/desc max-w-full">
  <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base line-clamp-2">
    {currentRoadmap.description || "No description provided."}
  </p>

  {/* Tooltip */}
  <div className="absolute left-0 top-full mt-2 hidden group-hover/desc:block z-[9999]">
    <div className="bg-gray-900 text-white text-xs sm:text-sm rounded-md px-3 py-2 shadow-lg max-w-md break-words">
      {currentRoadmap.description}
    </div>
  </div>
</div>
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
              <p className="font-medium text-gray-800">
                {currentRoadmap.estimatedDuration} minutes
              </p>
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
              <p className="font-medium text-gray-800">
                {currentRoadmap.createdBy?.name || 'Unknown'}
              </p>
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
              <p className="font-medium text-gray-800">
                {currentRoadmap.enrollments?.length || 0}
              </p>
            </div>
          </motion.div>

          {/* Assigned Admins (new card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned Admins</p>
              <div className="font-medium text-gray-800">
                {assignedAdmins.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {assignedAdmins.map((admin) => (
                      <span
                        key={admin.id}
                        className="inline-block bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200"
                      >
                        {admin.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>
          </motion.div>
        <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 1.0 }}
  className="flex items-start gap-3 p-4 rounded-xl"
  // ديناميكي حسب الحالة
  style={{
    backgroundColor:
      currentRoadmap.isPublished === true
        ? 'rgba(134, 239, 172, 0.3)' // أخضر فاتح
        : 'rgba(254, 202, 202, 0.3)' // أحمر فاتح
  }}
>
  <div
    className={`p-2 rounded-lg ${
      currentRoadmap.isPublished === true ? 'bg-green-100' : 'bg-red-100'
    }`}
  >
    {currentRoadmap.isPublished === true ? (
      <CheckCircle size={20} className="text-green-600" />
    ) : (
      <XCircle size={20} className="text-red-600" />
    )}
  </div>
  <div>
    <p className="text-sm text-gray-500">Status</p>
    <p className="font-medium text-gray-800">
      {currentRoadmap.isPublished === true ? 'Published' : 'Not Published'}
    </p>
  </div>
</motion.div>
          <ConfirmModal confirmToggle={handlePublish} isOpen={isOpenconfirmModel} onClose={()=>setIsOpenConfirmModel(false)} />
        </div>
      </motion.div>

      {/* Step List */}
      <StepList
        steps={steps || []}
        stepsLength={currentRoadmap?.steps.length}
        setStepId={setStepId}
        roadmapId={id}
        // lessonLength={currentRoadmap?.steps?.lessons?.length}
        onAddStep={handleAddStep}
        onEditStep={handleEditStep}
        onDeleteStep={handleDeleteClick}
        loading={stepsLoading}
      />

      {/* Step Form Modal */}
 
    </motion.div>
  );
}