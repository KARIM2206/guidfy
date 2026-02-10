// app/components/ModuleStats.tsx
"use client";

import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  Edit2,
  Lock,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';



export default function ModuleStats({ stats, className = "" }) {
  const statCards = [
    {
      id: 1,
      title: "Total Lessons",
      value: stats.totalLessons,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      description: "All lessons in module",
      trend: stats.totalLessons > 0 ? "+" + Math.floor(stats.totalLessons * 0.1) : "0",
      isPositive: true
    },
    {
      id: 2,
      title: "Published",
      value: stats.publishedLessons,
      icon: Eye,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      description: "Live and accessible",
      trend: `${Math.round((stats.publishedLessons / stats.totalLessons) * 100)}%`,
      isPositive: true
    },
    {
      id: 3,
      title: "Draft",
      value: stats.draftLessons,
      icon: Edit2,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      description: "Under preparation",
      trend: `${Math.round((stats.draftLessons / stats.totalLessons) * 100)}%`,
      isPositive: false
    },
    {
      id: 4,
      title: "Locked",
      value: stats.lockedLessons,
      icon: Lock,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
      description: "Requires completion",
      trend: `${Math.round((stats.lockedLessons / stats.totalLessons) * 100)}%`,
      isPositive: false
    }
  ];

  const additionalStats = [
    {
      id: 5,
      title: "Total Duration",
      value: stats.totalDuration,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      id: 6,
      title: "Avg. Completion",
      value: `${stats.averageCompletion}%`,
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50"
    },
    {
      id: 7,
      title: "Enrolled Students",
      value: stats.enrolledStudents.toLocaleString(),
      icon: Users,
      color: "from-teal-500 to-green-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-green-50"
    },
    {
      id: 8,
      title: "Last Updated",
      value: stats.lastUpdated,
      icon: CheckCircle,
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
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
    <div className={`${className}`}>
      {/* Main Stats Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Module Statistics
          </h3>
          <div className="text-sm text-gray-500">
            Real-time updates
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const percentage = Math.round((stat.value / stats.totalLessons) * 100);

            return (
              <motion.div
                key={stat.id}
                variants={cardVariants}
                whileHover="hover"
                custom={index * 0.1}
                className="relative group"
              >
                <div className={`${stat.bgColor} rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <motion.h3 
                        className="text-3xl font-bold text-gray-800"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {stat.value}
                      </motion.h3>
                    </div>
                    
                    {/* Icon */}
                    <motion.div
                      className={`p-3 rounded-lg ${stat.color.replace('from-', 'bg-gradient-to-br ')} text-white`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4">
                    {stat.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${stat.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3, duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.isPositive ? (
                        <TrendingUp size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      <span>{stat.trend}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      of total
                    </div>
                  </div>
                </div>

                {/* Hover Effect Lines */}
                <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-px h-20 bg-white/30"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: '-20px',
                      }}
                      animate={{
                        y: [0, '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Additional Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-md font-semibold text-gray-700 mb-4">Additional Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`${stat.bgColor} rounded-xl p-4 border border-gray-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color.replace('from-', 'bg-gradient-to-br ')} text-white`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Summary Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Module Health Score</p>
              <p className="text-sm text-gray-600">
                {stats.publishedLessons > 0 ? 'Good' : 'Needs attention'} • Updated daily
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {Math.round((stats.publishedLessons / stats.totalLessons) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Published Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalLessons - stats.draftLessons}
              </div>
              <div className="text-xs text-gray-500">Ready Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.averageCompletion}%
              </div>
              <div className="text-xs text-gray-500">Avg. Completion</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual Progress Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-medium text-gray-800 mb-4">Lesson Distribution</h4>
          <div className="flex items-center h-8 rounded-lg overflow-hidden bg-gray-100">
            {/* Published */}
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(stats.publishedLessons / stats.totalLessons) * 100}%` 
              }}
              transition={{ delay: 0.9, duration: 1 }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                {stats.publishedLessons} Published
              </div>
            </motion.div>
            
            {/* Draft */}
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(stats.draftLessons / stats.totalLessons) * 100}%` 
              }}
              transition={{ delay: 1, duration: 1 }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                {stats.draftLessons} Draft
              </div>
            </motion.div>
            
            {/* Locked */}
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(stats.lockedLessons / stats.totalLessons) * 100}%` 
              }}
              transition={{ delay: 1.1, duration: 1 }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                {stats.lockedLessons} Locked
              </div>
            </motion.div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Published ({stats.publishedLessons})</span>
            <span>Draft ({stats.draftLessons})</span>
            <span>Locked ({stats.lockedLessons})</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}