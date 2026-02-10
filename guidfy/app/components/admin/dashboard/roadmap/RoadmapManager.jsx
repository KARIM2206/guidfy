"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Map,
  Edit2,
  Trash2,
  Clock,
  Users,
  Target,
  ChevronRight,
  GripVertical,
  BookOpen,
  FileText,
  CheckCircle,
  X,
  Search,
  Filter,
  BarChart3,
  Award
} from 'lucide-react';
import RoadmapEditor from './RoadmapEditor';
import RoadmapFilters from './RoadmapFilters';
import RoadmapHeader from './RoadmapHeader';
import RoadmapGrid from './RoadmapGrid';
import RoadmapStats from './RoadmapStats';
import DeleteRoadmapModal from './DeleteRoadmapModal';
import RoadmapCard from './RoadmapCard';





export default function RoadmapManager() {
  const [roadmaps, setRoadmaps] = useState([
    {
      id: 1,
      title: "Full-Stack Web Development",
      description: "Complete guide to becoming a full-stack web developer with modern technologies",
      category: "Web Development",
      difficulty: "intermediate",
      steps: [
        { id: 1, title: "HTML & CSS Fundamentals", description: "Master the basics of web structure and styling", type: "course", duration: "2 weeks", resources: 5, completed: true },
        { id: 2, title: "JavaScript Deep Dive", description: "Learn JavaScript from basics to advanced concepts", type: "course", duration: "4 weeks", resources: 8, completed: true },
        { id: 3, title: "React & Modern Frontend", description: "Build dynamic UIs with React ecosystem", type: "course", duration: "6 weeks", resources: 12, completed: false },
        { id: 4, title: "Node.js & Backend Development", description: "Create server-side applications with Node.js", type: "course", duration: "5 weeks", resources: 10, completed: false },
        { id: 5, title: "Database Design & Management", description: "Learn SQL and NoSQL databases", type: "article", duration: "3 weeks", resources: 6, completed: false },
      ],
      enrolledUsers: 1245,
      estimatedDuration: "20 weeks",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      description: "Learn data analysis, visualization, and machine learning basics",
      category: "Data Science",
      difficulty: "beginner",
      steps: [
        { id: 1, title: "Python for Data Science", description: "Python programming and libraries", type: "course", duration: "3 weeks", resources: 7, completed: true },
        { id: 2, title: "Statistics & Probability", description: "Essential statistical concepts", type: "article", duration: "2 weeks", resources: 4, completed: true },
        { id: 3, title: "Data Visualization", description: "Creating effective data visualizations", type: "course", duration: "3 weeks", resources: 6, completed: false },
      ],
      enrolledUsers: 890,
      estimatedDuration: "8 weeks",
      lastUpdated: "2024-01-10"
    },
    {
      id: 3,
      title: "Mobile App Development",
      description: "Build cross-platform mobile applications with React Native",
      category: "Mobile Development",
      difficulty: "intermediate",
      steps: [
        { id: 1, title: "React Native Basics", description: "Introduction to React Native", type: "course", duration: "3 weeks", resources: 5, completed: true },
        { id: 2, title: "State Management", description: "Managing app state effectively", type: "article", duration: "2 weeks", resources: 3, completed: true },
        { id: 3, title: "Native Features", description: "Accessing device native features", type: "course", duration: "4 weeks", resources: 8, completed: false },
      ],
      enrolledUsers: 567,
      estimatedDuration: "9 weeks",
      lastUpdated: "2024-01-18"
    },
    {
      id: 4,
      title: "DevOps Engineering",
      description: "Master CI/CD, containerization, and cloud infrastructure",
      category: "System Operations",
      difficulty: "advanced",
      steps: [
        { id: 1, title: "Linux Fundamentals", description: "Essential Linux commands and administration", type: "course", duration: "2 weeks", resources: 4, completed: true },
        { id: 2, title: "Docker & Containers", description: "Containerization with Docker", type: "course", duration: "3 weeks", resources: 6, completed: false },
        { id: 3, title: "Kubernetes Orchestration", description: "Container orchestration at scale", type: "article", duration: "4 weeks", resources: 7, completed: false },
        { id: 4, title: "Cloud Infrastructure", description: "AWS/Azure/GCP fundamentals", type: "course", duration: "5 weeks", resources: 9, completed: false },
      ],
      enrolledUsers: 342,
      estimatedDuration: "14 weeks",
      lastUpdated: "2024-01-12"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const categories = ["all", "Web Development", "Data Science", "Mobile Development", "System Operations", "Design", "Programming"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         roadmap.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || roadmap.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || roadmap.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepTypeIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen size={14} />;
      case 'article': return <FileText size={14} />;
      case 'project': return <Target size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const getStepTypeColor = (type) => {
    switch (type) {
      case 'course': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (roadmap) => {
    setEditingRoadmap(roadmap);
    setIsEditorOpen(true);
  };

  const handleDelete = (roadmap) => {
    setRoadmapToDelete(roadmap);
  };

  const confirmDelete = () => {
    if (roadmapToDelete) {
      setRoadmaps(roadmaps.filter(r => r.id !== roadmapToDelete.id));
      setRoadmapToDelete(null);
    }
  };

  const handleSaveRoadmap = (updatedRoadmap) => {
    if (editingRoadmap) {
      // Update existing roadmap
      setRoadmaps(roadmaps.map(r => 
        r.id === editingRoadmap.id ? updatedRoadmap : r
      ));
      setEditingRoadmap(null);
    } else if (isCreatingNew) {
      // Add new roadmap
      setRoadmaps([updatedRoadmap, ...roadmaps]);
      setIsCreatingNew(false);
    }
    setIsEditorOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
  <RoadmapHeader onNew={() => setIsEditorOpen(true)} />

<RoadmapFilters
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  selectedDifficulty={selectedDifficulty}
  setSelectedDifficulty={setSelectedDifficulty}
  categories={categories}
  difficulties={difficulties}
/>

<RoadmapGrid>
  {filteredRoadmaps.map((roadmap, index) => (
    
    <RoadmapCard
      key={roadmap.id}
      index={index}
      roadmap={roadmap}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</RoadmapGrid>

<RoadmapStats roadmaps={roadmaps} />

<DeleteRoadmapModal
  roadmap={roadmapToDelete}
  onCancel={() => setRoadmapToDelete(null)}
  onConfirm={confirmDelete}
/>



      {/* Roadmap Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <RoadmapEditor
            roadmap={editingRoadmap}
            isCreatingNew={isCreatingNew}
            onSave={handleSaveRoadmap}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingRoadmap(null);
              setIsCreatingNew(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {roadmapToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Roadmap</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{roadmapToDelete.title}"? All steps and data will be permanently removed.
                </p>
                <div className="flex justify-center space-x-3">
                  <motion.button
                    onClick={() => setRoadmapToDelete(null)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Roadmap
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}