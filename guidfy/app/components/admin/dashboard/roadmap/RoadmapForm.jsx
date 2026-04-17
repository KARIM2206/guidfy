// components/roadmaps/RoadmapForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '../../../ui/Button';
import RoadmapFormField from './RoadmapFormField';
import { FileText, Tag, BarChart, Clock, Save, X } from 'lucide-react';
import { LEVEL_OPTIONS, CATEGORY_OPTIONS } from '../../../../utils/constants';

const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true, icon: FileText },
  { name: 'description', label: 'Description', type: 'textarea', required: false, icon: FileText },
  { name: 'category', label: 'Category', type: 'select', required: true, icon: Tag },
  { name: 'level', label: 'Level', type: 'select', required: true, icon: BarChart },
  { name: 'estimatedDuration', label: 'Duration (minutes)', type: 'number', required: true, icon: Clock },
];

const RoadmapForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const router = useRouter();
  console.log(initialData, 'initial data in roadmap form');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    level: initialData?.level || 'BEGINNER',
    estimatedDuration: initialData?.estimatedDuration || 60,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.estimatedDuration || formData.estimatedDuration <= 0)
      newErrors.estimatedDuration = 'Duration must be greater than 0';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      router.push('/admin/dashboard/roadmaps');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5 } },
  };

  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto"
    >
      {/* Header with gradient */}
      <motion.div variants={headerVariants} className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isEditing ? 'Edit Roadmap' : 'Create New Roadmap'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isEditing
            ? 'Update the details of your learning path'
            : 'Design a new learning path for your students'}
        </p>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-4" />
      </motion.div>

      {/* Form fields */}
      <div className="space-y-5">
        {fields.map((field, index) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <RoadmapFormField
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              error={errors}
              options={field.name === 'category' ? CATEGORY_OPTIONS : LEVEL_OPTIONS}
            />
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4 mt-8 pt-6 border-t border-gray-100"
      >
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1 gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          {loading ? 'Saving...' : isEditing ? 'Update Roadmap' : 'Create Roadmap'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X size={20} className="mr-2" />
          Cancel
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default RoadmapForm;