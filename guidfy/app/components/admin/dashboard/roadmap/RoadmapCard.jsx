import { Edit2, Trash2,Users, Clock, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDifficultyColor } from "./utils";
import RoadmapStepsPreview from "./RoadmapStepsPreview";

export default function RoadmapCard({ roadmap, index, onEdit, onDelete }) {
     const roadmapCardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
          }
        },
        hover: {
          y: -5,
          scale: 1.02,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
          }
        }
      };
  return (
    <motion.div
      variants={roadmapCardVariants}
      whileHover="hover"
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden group"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{roadmap.title}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(roadmap.difficulty)}`}>
                      {roadmap.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {roadmap.category}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {roadmap.steps.length} steps
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => onEdit(roadmap)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(roadmap)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Users size={14} />
                    <span className="text-sm">Enrolled</span>
                  </div>
                  <p className="font-bold text-gray-800">{roadmap.enrolledUsers.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Clock size={14} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-bold text-gray-800">{roadmap.estimatedDuration}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <BarChart3 size={14} />
                    <span className="text-sm">Updated</span>
                  </div>
                  <p className="font-bold text-gray-800">{roadmap.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Steps Preview */}
       <RoadmapStepsPreview roadmapId={roadmap.id} steps={roadmap.steps} />
          </motion.div>

  );
}
