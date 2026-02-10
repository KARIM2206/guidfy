import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function DeleteRoadmapModal({
  roadmap,
  onCancel,
  onConfirm
}) {
  if (!roadmap) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>

            <h3 className="text-lg font-bold mb-2">
              Delete Roadmap
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{roadmap.title}</strong>?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
