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
  className="
    w-full
    min-w-0
    bg-gradient-to-br from-white to-gray-50
    border border-gray-200
    rounded-2xl
    shadow-sm
    overflow-hidden
    group
  "
>
  {/* Card Header */}
  <div className="p-4 sm:p-6 border-b border-gray-100">
    <div className="flex justify-between items-start gap-3 mb-4">
      
      {/* Left Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap group relative items-center gap-2 mb-2">
          
          <h3 className="text-lg group-hover:underline  sm:text-xl font-bold text-nowrap text-gray-800 break-words">
            {roadmap.title.length > 15 ? `${roadmap.title.slice(0, 15)} ...` : roadmap.title}
          </h3>
       <span className="absolute px-2 py-1 bg-white left-0 -bottom-1.5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {roadmap.title}
       </span>
          <span
            className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${getDifficultyColor(
              roadmap.difficulty
            )}`}
          >
            {roadmap.difficulty.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 break-words mb-4">
          {roadmap.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
            {roadmap.category}
          </span>

          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
            {roadmap.steps.length} steps
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 sm:gap-2 shrink-0">
        <motion.button
          onClick={() => onEdit(roadmap)}
          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>

        <motion.button
          onClick={() => onDelete(roadmap)}
          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      </div>
    </div>

    {/* Stats */}
    <div className="
      grid 
      grid-cols-2 
      sm:grid-cols-3 
      gap-3 sm:gap-4 
      pt-4 
      border-t border-gray-100
    ">
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-gray-600 text-xs sm:text-sm">
          <Users size={12} />
          <span>Enrolled</span>
        </div>
        <p className="font-bold text-gray-800 text-sm sm:text-base">
          {roadmap.enrolledUsers.toLocaleString()}
        </p>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-gray-600 text-xs sm:text-sm">
          <Clock size={12} />
          <span>Duration</span>
        </div>
        <p className="font-bold text-gray-800 text-sm sm:text-base">
          {roadmap.estimatedDuration}
        </p>
      </div>

      <div className="text-center col-span-2 sm:col-span-1">
        <div className="flex items-center justify-center gap-1 text-gray-600 text-xs sm:text-sm">
          <BarChart3 size={12} />
          <span>Updated</span>
        </div>
        <p className="font-bold text-gray-800 text-sm sm:text-base">
          {roadmap.lastUpdated}
        </p>
      </div>
    </div>
  </div>

  {/* Steps Preview */}
  <RoadmapStepsPreview roadmapId={roadmap.id} steps={roadmap.steps} />
</motion.div>

  );
}
