import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Map,
  X,
  Plus,
  GripVertical,
  Trash2,
  Clock,
  BookOpen,
  CheckCircle
} from "lucide-react";

/* helper */
const getStepTypeColor = (type) => {
  switch (type) {
    case "course":
      return "bg-blue-100 text-blue-700";
    case "article":
      return "bg-purple-100 text-purple-700";
    case "project":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function RoadmapEditor({
  roadmap,
  isCreatingNew,
  onSave,
  onClose
}) {
  const [title, setTitle] = useState(roadmap?.title || "");
  const [description, setDescription] = useState(roadmap?.description || "");
  const [category, setCategory] = useState(
    roadmap?.category || "Web Development"
  );
  const [difficulty, setDifficulty] = useState(
    roadmap?.difficulty || "beginner"
  );
  const [steps, setSteps] = useState(roadmap?.steps || []);

  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    type: "course",
    duration: "2 weeks",
    resources: 3,
    completed: false
  });

  const [isAddingStep, setIsAddingStep] = useState(false);

  const handleAddStep = () => {
    if (!newStep.title.trim()) return;

    setSteps([
      ...steps,
      {
        id: Date.now(),
        ...newStep
      }
    ]);

    setNewStep({
      title: "",
      description: "",
      type: "course",
      duration: "2 weeks",
      resources: 3,
      completed: false
    });

    setIsAddingStep(false);
  };

  const handleRemoveStep = (id) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleSave = () => {
    onSave({
      id: roadmap?.id || Date.now(),
      title,
      description,
      category,
      difficulty,
      steps,
      enrolledUsers: roadmap?.enrolledUsers || 0,
      estimatedDuration: `${steps.length * 2} weeks`,
      lastUpdated: new Date().toISOString().split("T")[0]
    });
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Map className="text-green-600" />
              {roadmap ? "Edit Roadmap" : "Create New Roadmap"}
            </h3>

            <motion.button
              onClick={onClose}
              whileHover={{ rotate: 90 }}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X />
            </motion.button>
          </div>

          {/* Basic Info */}
          <div className="space-y-6 mb-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Roadmap title"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Roadmap description"
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>

          {/* Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              <h4 className="font-bold">Steps ({steps.length})</h4>
              <button
                onClick={() => setIsAddingStep(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>

            <AnimatePresence>
              {isAddingStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 mb-4 bg-gray-50 rounded-xl"
                >
                  <input
                    value={newStep.title}
                    onChange={(e) =>
                      setNewStep({ ...newStep, title: e.target.value })
                    }
                    placeholder="Step title"
                    className="w-full mb-3 px-3 py-2 border rounded-lg"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingStep(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStep}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Reorder.Group
              axis="y"
              values={steps}
              onReorder={setSteps}
              className="space-y-3"
            >
              {steps.map((step, index) => (
                <Reorder.Item key={step.id} value={step}>
                  <div className="p-4 border rounded-xl flex gap-3">
                    <GripVertical className="text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h5 className="font-bold">{step.title}</h5>
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex gap-4 text-sm text-gray-500 mt-2">
                        <span className={getStepTypeColor(step.type)}>
                          {step.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {step.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} /> {step.resources}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          {step.completed ? "Done" : "In progress"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title || steps.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-xl disabled:opacity-50"
            >
              {roadmap ? "Update Roadmap" : "Create Roadmap"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
