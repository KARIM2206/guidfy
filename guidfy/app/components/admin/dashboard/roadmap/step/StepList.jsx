// StepList.jsx - امسح الـ fetch من جوه StepList
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import StepItem from './StepItem';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import { useSteps } from '@/app/hooks/useStep';

const StepList = ({ roadmapId, onAddStep, onEditStep, onDeleteStep, setStepId, stepsLength }) => {
  const { user } = useAuth();
  
  // ✅ بس استخدم الـ steps من الـ context من غير ما تعمل fetch تاني
  const { steps, loading: stepsLoading } = useSteps();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ✅ لو لسه loading متعرضش حاجة
  if (stepsLoading) {
    return (
      <div className="mt-8 bg-white/50 rounded-2xl p-6 shadow-xl border border-gray-100 flex justify-center py-12">
        <p className="text-gray-400">Loading steps...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Layers size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Learning Steps</h3>
            <p className="text-sm text-gray-500">
              {stepsLength || 0} step{stepsLength !== 1 ? 's' : ''} • Organize your roadmap content
            </p>
          </div>
        </div>
        {user?.role === 'ADMIN' && (
          <Button
            variant="primary"
            onClick={() => onAddStep(roadmapId)}
            className="gap-2"
          >
            <Plus size={18} />
            Add Step
          </Button>
        )}
      </div>

      {/* Steps List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            >
              <StepItem
                step={step}
                index={index}
                onEdit={onEditStep}
                onDelete={onDeleteStep}
                setStepId={setStepId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-4"
        >
          <div className="bg-gray-50 rounded-2xl p-8">
            <Layers size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No steps yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start building your roadmap by adding the first step
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StepList;