'use client';

import { useState, useEffect } from 'react';
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
  const [hoveredBar, setHoveredBar] = useState(null);

  const statCards = [
    {
      icon: Users,
      label: 'Members',
      value: stats.members || '45.2k',
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      icon: MessageSquare,
      label: 'Questions',
      value: stats.questions || '18.7k',
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      icon: FileText,
      label: 'Posts',
      value: stats.posts || '9.3k',
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      icon: Code2,
      label: 'Projects',
      value: stats.projects || '3.4k',
      color: 'orange',
      change: '+23%',
      trend: 'up'
    },
    {
      icon: Zap,
      label: 'Online Now',
      value: stats.online || '2.4k',
      color: 'yellow',
      change: null,
      trend: null
    }
  ];

  // Interactive Chart Data
  const weeklyActivityData = [
    { day: 'Mon', questions: 240, posts: 180, projects: 45, members: 1250 },
    { day: 'Tue', questions: 320, posts: 210, projects: 52, members: 1420 },
    { day: 'Wed', questions: 380, posts: 250, projects: 68, members: 1680 },
    { day: 'Thu', questions: 420, posts: 280, projects: 72, members: 1920 },
    { day: 'Fri', questions: 380, posts: 240, projects: 65, members: 1750 },
    { day: 'Sat', questions: 290, posts: 190, projects: 48, members: 1480 },
    { day: 'Sun', questions: 210, posts: 160, projects: 38, members: 1320 }
  ];

  const monthlyGrowthData = [
    { month: 'Jan', growth: 12, newMembers: 420 },
    { month: 'Feb', growth: 18, newMembers: 580 },
    { month: 'Mar', growth: 22, newMembers: 720 },
    { month: 'Apr', growth: 25, newMembers: 820 },
    { month: 'May', growth: 28, newMembers: 920 },
    { month: 'Jun', growth: 32, newMembers: 1050 },
    { month: 'Jul', growth: 35, newMembers: 1150 },
    { month: 'Aug', growth: 38, newMembers: 1250 },
    { month: 'Sep', growth: 42, newMembers: 1380 },
    { month: 'Oct', growth: 45, newMembers: 1480 },
    { month: 'Nov', growth: 48, newMembers: 1580 },
    { month: 'Dec', growth: 52, newMembers: 1710 }
  ];

  const engagementData = [
    { name: 'Questions', value: 45, color: '#3b82f6' },
    { name: 'Posts', value: 25, color: '#8b5cf6' },
    { name: 'Projects', value: 15, color: '#f59e0b' },
    { name: 'Comments', value: 10, color: '#10b981' },
    { name: 'Reactions', value: 5, color: '#ef4444' }
  ];

  const topContributorsData = [
    { name: 'Alex Chen', contributions: 245, growth: '+28%' },
    { name: 'Sarah Johnson', contributions: 198, growth: '+15%' },
    { name: 'Mike Wilson', contributions: 167, growth: '+32%' },
    { name: 'Emma Davis', contributions: 142, growth: '+12%' },
    { name: 'David Lee', contributions: 128, growth: '+24%' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  const chartConfigs = {
    activity: {
      title: 'Weekly Activity',
      description: 'Daily contributions across content types',
      icon: BarChart3,
      color: 'blue'
    },
    growth: {
      title: 'Monthly Growth',
      description: 'Community growth over the past year',
      icon: LineChart,
      color: 'green'
    },
    engagement: {
      title: 'Engagement Distribution',
      description: 'Breakdown of community interactions',
      icon: PieChart,
      color: 'purple'
    }
  };

  const getChartData = () => {
    switch (activeChart) {
      case 'activity':
        return weeklyActivityData;
      case 'growth':
        return monthlyGrowthData;
      default:
        return weeklyActivityData;
    }
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'activity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyActivityData}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setHoveredBar(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend />
              <Bar 
                dataKey="questions" 
                name="Questions" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                opacity={hoveredBar !== null ? 0.7 : 1}
              />
              <Bar 
                dataKey="posts" 
                name="Posts" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                opacity={hoveredBar !== null ? 0.7 : 1}
              />
              <Bar 
                dataKey="projects" 
                name="Projects" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                opacity={hoveredBar !== null ? 0.7 : 1}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                label={{ value: 'Growth %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="growth"
                name="Growth Rate"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newMembers"
                name="New Members"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'engagement':
        return (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Engagement']}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            {/* Top Contributors List */}
            <div className="flex-1 w-full lg:w-auto">
              <h5 className="font-medium text-gray-900 dark:text-white mb-4">Top Contributors</h5>
              <div className="space-y-3">
                {topContributorsData.map((contributor, index) => (
                  <motion.div
                    key={contributor.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {contributor.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contributor.contributions} contributions
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {contributor.growth}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      {/* Stats Cards */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Community Analytics
        </h3>
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <TrendingUp size={16} />
          <span>Real-time analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 ${colorClasses[stat.color]} rounded-xl flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                {stat.change && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${stat.trend === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        {/* Chart Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = chartConfigs[activeChart].icon;
                return <Icon size={20} className={colorClasses[chartConfigs[activeChart].color].split(' ')[1]} />;
              })()}
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {chartConfigs[activeChart].title}
              </h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chartConfigs[activeChart].description}
            </p>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {Object.entries(chartConfigs).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveChart(key)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeChart === key
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                      }`}
                  >
                    <Icon size={14} />
                    <span className="capitalize">{key}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['week', 'month', 'year'].map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${timeRange === range
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Filter size={14} />
              Export
            </motion.button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[300px]">
          {renderChart()}
        </div>

        {/* Chart Stats Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg. Daily Activity', value: '342', change: '+12%', color: 'blue' },
              { label: 'Engagement Rate', value: '68%', change: '+8%', color: 'green' },
              { label: 'Retention Rate', value: '92%', change: '+5%', color: 'purple' },
              { label: 'Response Time', value: '24m', change: '-15%', color: 'orange' },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
                <div className={`text-xs font-medium mt-1 ${stat.change.startsWith('+')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                  }`}>
                  {stat.change} from last period
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Updates Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Live data updates every 5 minutes
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: Just now
            </span>
          </div>
        </div>
      </motion.div>

      {/* Data Refresh Notice */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-medium">Pro Tip:</span> Click on any data point to see detailed insights. 
              Use the filters above to analyze different time periods and metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainStats;