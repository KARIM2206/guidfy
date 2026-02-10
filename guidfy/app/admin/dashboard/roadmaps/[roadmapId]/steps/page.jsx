// app/roadmaps/[roadmapId]/steps/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  Search,
  Filter,
  BookOpen,
  FileText,
  Target,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';



export default function RoadmapStepsPage({ params }) {
 
  const router = useRouter();
  const {roadmapId} = use(params); ;

  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "HTML & CSS Fundamentals",
      description: "Master the basics of web structure and styling",
      type: "course",
      duration: "2 weeks",
      resources: 5,
      completed: true,
      order: 1,
      createdAt: "2024-01-10"
    },
    // ... more steps
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stepToDelete, setStepToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);
  const handleCreateStep = () => {
    setShowCreateModal(true);
  };

  const handleEditStep = (stepId) => {
    router.push(`/roadmaps/${roadmapId}/steps/${stepId}/edit`);
  };

  const handleDeleteStep = (step) => {
    setStepToDelete(step);
  };

  const confirmDelete = () => {
    if (stepToDelete) {
      setSteps(steps.filter(s => s.id !== stepToDelete.id));
      setStepToDelete(null);
    }
  };

  const getStepTypeIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen size={16} />;
      case 'article': return <FileText size={16} />;
      case 'project': return <Target size={16} />;
      default: return <BookOpen size={16} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/roadmaps/${roadmapId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Roadmap
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roadmap Steps</h1>
              <p className="text-gray-600 mt-2">Manage learning steps for this roadmap</p>
            </div>
            <motion.button
              onClick={handleCreateStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              <Plus size={20} />
              Add New Step
            </motion.button>
          </div>
        </div>
{
    
}
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Steps</p>
            <p className="text-2xl font-bold text-gray-900">{steps.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.filter(s => s.completed).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.reduce((total, step) => {
                const weeks = parseInt(step.duration.split(' ')[0]);
                return total + weeks;
              }, 0)} weeks
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Resources</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.reduce((total, step) => total + step.resources, 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search steps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="article">Articles</option>
                <option value="project">Projects</option>
              </select>
            </div>
            <div>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>Sort by: Order</option>
                <option>Sort by: Duration</option>
                <option>Sort by: Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-full flex items-center justify-center font-bold">
                        {step.order}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStepTypeColor(step.type)}`}>
                        {getStepTypeIcon(step.type)}
                        {step.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <Clock size={14} />
                        {step.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <BookOpen size={14} />
                        {step.resources} resources
                      </span>
                      {step.completed && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={() => handleEditStep(step.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteStep(step)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}