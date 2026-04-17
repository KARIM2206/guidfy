'use client';

import { motion } from 'framer-motion';
import { Eye, Tag, Clock, Layers } from 'lucide-react';
import Button from '../../../ui/Button';
import { useRouter } from 'next/navigation';

const RoadmapTable = ({ roadmaps }) => {
  const router = useRouter();

  const handleView = (id) => {
    router.push(`roadmaps/${id}`);
  };

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {roadmaps.map((roadmap) => (
        <motion.div
          key={roadmap.id}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden"
        >
          {/* Level Color Bar */}
          <div
            className={`h-2 ${
              roadmap.level === 'BEGINNER'
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : roadmap.level === 'INTERMEDIATE'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                : 'bg-gradient-to-r from-red-400 to-red-500'
            }`}
          />

          <div className="p-5">
            {/* Title + Category */}
            <div className="flex items-start flex-wrap justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {roadmap.title}
              </h3>
              <span className="flex items-center text-xs font-medium text-nowrap text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <Tag size={12} className="mr-1" />
                {roadmap.category}
              </span>
            </div>

            {/* Description */}
            {roadmap.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {roadmap.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock size={16} className="mr-1 text-gray-400" />
                <span>{roadmap.estimatedDuration} min</span>
              </div>
              <div className="flex items-center">
                <Layers size={16} className="mr-1 text-gray-400" />
                <span>{roadmap.steps?.length || 0} steps</span>
              </div>
            </div>

            {/* Level Badge */}
            <div className="mb-4">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  roadmap.level === 'BEGINNER'
                    ? 'bg-green-100 text-green-800'
                    : roadmap.level === 'INTERMEDIATE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {roadmap.level}
              </span>
            </div>

            {/* View Only */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(roadmap.id)}
                aria-label="View roadmap"
                className="!p-2"
              >
                <Eye size={18} />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}

      {roadmaps.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No roadmaps assigned yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapTable;