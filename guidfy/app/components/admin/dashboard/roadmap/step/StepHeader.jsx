// app/components/StepHeader.tsx
"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Edit2,
  CheckCircle,
  Clock,
  Lock,
  Globe,
  Users,
  Calendar
} from 'lucide-react';


export default function StepHeader({
  step,
  roadmapTitle,
  roadmapId,
  onEdit,
  onPreview
}) {
  const router = useRouter();

  const getStatusConfig = (status) => {
    switch (status) {
      case 'published':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle size={16} />,
          label: 'Published'
        };
      case 'draft':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Edit2 size={16} />,
          label: 'Draft'
        };
      case 'locked':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Lock size={16} />,
          label: 'Locked'
        };
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock size={16} />,
          label: 'Archived'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock size={16} />,
          label: 'Unknown'
        };
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusConfig = getStatusConfig(step.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-50 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push(`/roadmaps/${roadmapId}`)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Roadmap</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{roadmapTitle}</span>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">{step.title}</span>
          </nav>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Section - Step Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {step.title}
              </h1>
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            <p className="text-lg text-gray-600 mb-6 max-w-3xl">
              {step.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{step.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{step.estimatedDuration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled</p>
                  <p className="font-medium text-gray-900">
                    {step.enrolledStudents.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{step.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getDifficultyColor(step.difficulty)}`}>
                {step.difficulty.charAt(0).toUpperCase() + step.difficulty.slice(1)}
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Interactive
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Hands-on
              </span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={onPreview}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              <Eye size={20} />
              Preview as Student
            </motion.button>

            <motion.button
              onClick={onEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={20} />
              Edit Step Details
            </motion.button>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                Publish
              </button>
              <button className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                Save Draft
              </button>
              <button className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                Duplicate
              </button>
              <button className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                Archive
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar (Optional) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Progress</span>
            <span className="text-sm text-gray-600">65%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}