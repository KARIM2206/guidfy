'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import {
  Layers,
  BookOpen,
  Tag,
  Clock,
  CheckCircle,
  X,
  Users,
  FileText
} from 'lucide-react';

export default function RoadmapForm({
  isOpen,
  onCancel,
  onSubmit,
  initialData = null,
  loading = false,
  learningPathId,          // ID of the current learning path (required)
  admins = []               // array of { id, name } for assignment
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    level: 'BEGGINER',
    estimatedDuration: '',
    assignedAdminIds: [],
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when editing or opening
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        level: initialData.level || '',
        estimatedDuration: initialData.estimatedDuration || '',
        assignedAdminIds: initialData.assignedAdminIds || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        level: '',
        estimatedDuration: '',
        assignedAdminIds: [],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    // estimatedDuration is optional (number)
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build payload exactly as server expects
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      estimatedDuration: formData.estimatedDuration
        ? Number(formData.estimatedDuration)
        : undefined,
      learningPathId: Number(learningPathId),  // ensure number
      assignedAdminIds: formData.assignedAdminIds,
    };

    await onSubmit(payload);
  };

  // Options for selects
  const levelOptions = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  const categoryOptions = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Design', label: 'Design' }
  ];

  // Animation variants
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    })
  };

  // Handle multi‑select for admins
  const handleAdminToggle = (adminId) => {
    setFormData(prev => ({
      ...prev,
      assignedAdminIds: prev.assignedAdminIds.includes(adminId)
        ? prev.assignedAdminIds.filter(id => id !== adminId)
        : [...prev.assignedAdminIds, adminId]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md"
          >
            <Layers size={20} className="text-white" />
          </motion.div>
          <span className="text-xl font-bold text-gray-800">
            {initialData?.id ? 'Edit Roadmap' : 'Create New Roadmap'}
          </span>
        </div>
      }
      containerClassName="max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 p-1"
      >
        {/* Title */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label={
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-500" />
                Title <span className="text-red-500">*</span>
              </span>
            }
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            placeholder="e.g., React Developer Roadmap"
          />
        </motion.div>

        {/* Description */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FileText className="w-4 h-4 text-gray-500" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Brief description of the roadmap..."
          />
        </motion.div>

        {/* Category & Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <Select
              label={
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Category <span className="text-red-500">*</span>
                </span>
              }
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              options={categoryOptions}
              error={errors.category}
              placeholder="Select category"
            />
          </motion.div>

          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <Select
              label={
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Level <span className="text-red-500">*</span>
                </span>
              }
              value={formData.level}
              onChange={(e) => {
                setFormData({ ...formData, level: e.target.value });
                if (errors.level) setErrors((prev) => ({ ...prev, level: undefined }));
              }}
              options={levelOptions}
              error={errors.level}
              placeholder="Select level"
            />
          </motion.div>
        </div>

        {/* Estimated Duration */}
        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label={
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                Estimated Duration (hours)
              </span>
            }
            type="number"
            min="0"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
            placeholder="e.g., 40"
          />
        </motion.div>

        {/* Assigned Admins - Multi-select */}
        {admins.length > 0 && (
          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              Assign to Admins
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
              {admins.map((admin) => {
                const isSelected = formData.assignedAdminIds.includes(admin.id);
                return (
                  <motion.div
                    key={admin.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAdminToggle(admin.id)}
                    className={`
                      flex items-center justify-between p-2 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                      }
                    `}
                  >
                    <span className="text-sm font-medium text-gray-800">{admin.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                  </motion.div>
                );
              })}
              {admins.length === 0 && (
                <div className="col-span-2 text-center py-2 text-gray-500">
                  No admins available
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Hidden learningPathId – not editable, but we use the prop */}
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="secondary" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}