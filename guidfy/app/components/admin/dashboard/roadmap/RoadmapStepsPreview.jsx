// app/components/RoadmapStepsPreview.tsx
"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, ArrowRight, BookOpen, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

// Types




// Helper functions (can be moved to separate utils file)
export const getStepTypeColor = (type) => {
  switch (type) {
    case 'course': return 'bg-purple-100 text-purple-800';
    case 'article': return 'bg-blue-100 text-blue-800';
    case 'project': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStepTypeIcon = (type) => {
  const IconMap= {
    course: BookOpen,
    article: FileText,
    project: Target,
  };
  
  const Icon = IconMap[type] || BookOpen;
  return <Icon size={14} />;
};

export default function RoadmapStepsPreview({ 
  steps, 
  roadmapId, 
  className = "" 
}) {
  const router = useRouter();
  
  // Handle click on individual step
  const handleStepClick = (stepId) => {
    router.push(`/admin/dashboard/roadmaps/${roadmapId}/steps/${stepId}`);
  };
  
  // Handle click on "view all steps"
  const handleViewAllSteps = () => {
    router.push(`/admin/dashboard/roadmaps/${roadmapId}/steps`);
  };
  
  // Calculate animation delay based on index
  const getAnimationDelay = (index)  => index * 0.05;
  
  return (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className={`${className} w-full`}
>
  <div className="p-4 sm:p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    
    {/* Header */}
    <div className="flex flex-wrap items-center justify-between mb-4 gap-2 min-w-0">
      <h4 className="font-semibold text-gray-800 flex items-center gap-2 truncate min-w-0">
        <ChevronRight size={18} className="text-green-600 flex-shrink-0" />
        Learning Path
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
          {steps.length} steps
        </span>
      </h4>

      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
        {steps.filter(s => s.completed).length} completed
      </div>
    </div>

    {/* Steps List */}
    <div className="space-y-3 w-full">
      {steps.slice(0, 3).map((step, stepIndex) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: stepIndex * 0.05 }}
          whileHover={{ scale: 1.02, x: 2 }} // محدود scale و x translation
          whileTap={{ scale: 0.98 }}
          onClick={() => handleStepClick(step.id)}
          className="relative overflow-hidden group cursor-pointer w-full"
        >
          {/* Hover Effect Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-50/0 to-green-50/0 group-hover:to-green-50/50"
            initial={false}
            transition={{ duration: 0.2 }}
          />

          {/* Step Card */}
          <div className="relative flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 group-hover:border-green-300 transition-colors min-w-0 w-full">
            {/* Step Number */}
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
              {stepIndex + 1}
            </div>

            {/* Step Type Icon */}
            <div className={`p-2 rounded-lg ${getStepTypeColor(step.type)} transition-transform flex-shrink-0`}>
              {getStepTypeIcon(step.type)}
            </div>

            {/* Step Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between min-w-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800 group-hover:text-green-700 transition-colors truncate break-words">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate break-words">
                    {step.description}
                  </p>
                </div>

                <motion.div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <ArrowRight size={14} className="text-green-500" />
                </motion.div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 mt-2 min-w-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {step.duration}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {step.resources} resources
                </span>
              </div>
            </div>

            {/* Completion Status */}
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* View All Steps */}
    {steps.length > 3 && (
      <motion.div className="pt-3">
        <motion.button
          onClick={handleViewAllSteps}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <div className="flex items-center justify-between p-3 text-sm font-medium text-green-700 bg-gradient-to-r from-green-50/50 to-emerald-50/50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 hover:border-green-300 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <ChevronRight size={16} className="text-green-600" />
              </div>
              <span className="font-semibold truncate">View all {steps.length} steps</span>
            </div>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <ArrowRight size={16} />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>
    )}
  </div>
</motion.div>

  );
}