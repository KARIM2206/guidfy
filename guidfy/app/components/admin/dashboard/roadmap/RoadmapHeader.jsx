import { Map, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function RoadmapHeader({ onNew }) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Map className="text-green-600" />
          Learning Roadmaps
        </h2>
        <p className="text-gray-600">
          Create and manage structured learning paths
        </p>
      </div>

      <motion.button
        onClick={onNew}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl"
      >
        <Plus size={18} />
        New Roadmap
      </motion.button>
    </div>
  );
}
