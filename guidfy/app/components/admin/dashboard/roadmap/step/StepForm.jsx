'use client';

import { useEffect, useState } from 'react';
import Modal from '../../../../ui/Modal';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';
import Textarea from '../../../../ui/Textarea';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Hash, Save, X } from 'lucide-react';

const StepForm = ({ isOpen, onClose, onSubmit, initialData = {}, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        order: initialData?.order || 0,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Type size={20} className="text-blue-600" />
          </div>
          <span className="text-xl font-bold">
            {initialData?.id ? 'Edit Step' : 'Add New Step'}
          </span>
        </div>
      }
    >
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Introduction to React"
            leftIcon={<Type size={18} className="text-gray-400" />}
          />
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe what this step covers..."
            leftIcon={<AlignLeft size={18} className="text-gray-400" />}
          />
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="Display order"
            leftIcon={<Hash size={18} className="text-gray-400" />}
          />
        </motion.div>

        <motion.div
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-end gap-3 pt-4 border-t border-gray-100"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X size={18} />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Save size={18} />
            )}
            {loading ? 'Saving...' : 'Save Step'}
          </Button>
        </motion.div>
      </motion.form>
    </Modal>
  );
};

export default StepForm;