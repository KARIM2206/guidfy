'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Clock,
  FolderTree,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Layers,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Modal from '../../ui/Modal';

export default function LearningPathForm({
  initialData = null,
  roadmaps = [],
  onSubmit,
  onCancel,
  isOpen
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobs: '',
    projects: '',
    estimatedDuration: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        jobs: initialData.jobs || '',
        projects: initialData.projects || '',
        estimatedDuration: initialData.estimatedDuration || '',
      });
      // Set image preview if there's an existing image URL
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [initialData]);

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    // Image is optional, but we could add validation if needed
    return newErrors;
  };

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      // Reset if invalid file
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedFormData = new FormData();
    formattedFormData.append('title', formData.title);
    formattedFormData.append('description', formData.description);
    formattedFormData.append('jobs', formData.jobs);
    formattedFormData.append('projects', formData.projects);
    formattedFormData.append('estimatedDuration', formData.estimatedDuration);

    // Handle image: if new file selected, append it; otherwise, if existing image URL and no new file, maybe append the URL? 
    // But the API likely expects a file or a URL. We'll assume the API can handle both.
    if (imageFile) {
      formattedFormData.append('image', imageFile);
    } else if (imagePreview && !imageFile) {
      // If there's a preview URL but no new file, it means it's the existing image from initialData.
      // We can append the existing image URL as a string, but the API might expect a file.
      // Better approach: send the existing image ID or URL as a separate field.
      // For simplicity, we'll append the URL as a string, assuming backend can handle it.
      formattedFormData.append('existingImage', imagePreview);
    }

    setIsSubmitting(true);
    await onSubmit(formattedFormData);
    // Reset form after submission (optional)
    setFormData({
      title: '',
      description: '',
      jobs: '',
      projects: '',
      estimatedDuration: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  // Animation variants
  const fieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Layers size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">
            {initialData?.id ? 'Edit Learning Path' : 'Create New Learning Path'}
          </span>
        </div>
      }
      containerClassName="max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-gray-100"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <div className="p-6 space-y-5">
        {/* Image Upload Area */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            Cover Image (optional)
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer
              ${isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }
              ${imagePreview ? 'border-solid border-indigo-200 bg-indigo-50/30' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Title Field */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
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
            placeholder="e.g., Frontend Developer Path"
          />
        </motion.div>

        {/* Description Field */}
        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FolderTree className="w-4 h-4 text-gray-500" />
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the learning path..."
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Jobs & Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <Input
              label={
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Jobs (optional)
                </span>
              }
              type="number"
              min="0"
              value={formData.jobs}
              onChange={(e) => setFormData({ ...formData, jobs: e.target.value })}
              placeholder="Number of jobs"
            />
          </motion.div>

          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <Input
              label={
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-gray-500" />
                  Projects (optional)
                </span>
              }
              type="number"
              min="0"
              value={formData.projects}
              onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
              placeholder="Number of projects"
            />
          </motion.div>
        </div>

        {/* Estimated Duration */}
        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label={
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                Estimated Duration (hours, optional)
              </span>
            }
            type="number"
            min="0"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
            placeholder="e.g., 40"
          />
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Learning Path'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}