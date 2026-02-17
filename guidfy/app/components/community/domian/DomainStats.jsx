'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  FileText,
  Code2,
  Zap,
  TrendingUp,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Filter
} from 'lucide-react';

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const DomainStats = ({ stats = {} }) => {
  const [activeChart, setActiveChart] = useState('activity');
  const [timeRange, setTimeRange] = useState('week');

  const statCards = [
    { icon: Users, label: 'Members', value: stats.members || '45.2k', color: 'blue', change: '+12%', trend: 'up' },
    { icon: MessageSquare, label: 'Questions', value: stats.questions || '18.7k', color: 'green', change: '+8%', trend: 'up' },
    { icon: FileText, label: 'Posts', value: stats.posts || '9.3k', color: 'purple', change: '+15%', trend: 'up' },
    { icon: Code2, label: 'Projects', value: stats.projects || '3.4k', color: 'orange', change: '+23%', trend: 'up' },
    { icon: Zap, label: 'Online Now', value: stats.online || '2.4k', color: 'yellow', change: null, trend: null }
  ];

  const weeklyActivityData = [
    { day: 'Mon', questions: 240, posts: 180, projects: 45 },
    { day: 'Tue', questions: 320, posts: 210, projects: 52 },
    { day: 'Wed', questions: 380, posts: 250, projects: 68 },
    { day: 'Thu', questions: 420, posts: 280, projects: 72 },
    { day: 'Fri', questions: 380, posts: 240, projects: 65 },
    { day: 'Sat', questions: 290, posts: 190, projects: 48 },
    { day: 'Sun', questions: 210, posts: 160, projects: 38 }
  ];

  const monthlyGrowthData = [
    { month: 'Jan', growth: 12 },
    { month: 'Feb', growth: 18 },
    { month: 'Mar', growth: 22 },
    { month: 'Apr', growth: 25 },
    { month: 'May', growth: 28 },
    { month: 'Jun', growth: 32 }
  ];

  const engagementData = [
    { name: 'Questions', value: 45, color: '#3b82f6' },
    { name: 'Posts', value: 25, color: '#8b5cf6' },
    { name: 'Projects', value: 15, color: '#f59e0b' },
    { name: 'Comments', value: 10, color: '#10b981' },
    { name: 'Reactions', value: 5, color: '#ef4444' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  const renderChart = () => {
    if (activeChart === 'activity') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyActivityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            <Bar dataKey="questions" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="posts" fill="#8b5cf6" radius={[4,4,0,0]} />
            <Bar dataKey="projects" fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeChart === 'growth') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyGrowthData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Area type="monotone" dataKey="growth" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie data={engagementData} dataKey="value" outerRadius={80}>
            {engagementData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="mt-6 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Community Analytics
        </h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
          <TrendingUp size={14} />
          Real-time analytics
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className={`h-10 w-10 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                {stat.change && (
                  <span className="text-xs text-green-600">{stat.change}</span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 sm:p-6 shadow-sm">
        
        {/* Chart Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['activity','growth','engagement'].map(type => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition ${
                activeChart === type
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gray-100 dark:bg-gray-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {renderChart()}
      </div>

      {/* Notice */}
      <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs sm:text-sm">
        <div className="flex gap-2">
          <Calendar size={16} className="flex-shrink-0" />
          Click any data point for deeper insights.
        </div>
      </div>

    </div>
  );
};

export default DomainStats;
