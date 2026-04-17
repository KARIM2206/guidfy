'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, FileText,
  Zap, TrendingUp, Calendar, Loader2, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import { getCommunityAnalytics } from '@/services/community';
// import { getCommunityAnalytics } from '@/services/community.js';

const COLOR = {
  blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
  green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
};

function formatNumber(n) {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function ChartSkeleton() {
  return (
    <div className="h-[250px] flex items-end gap-2 px-4 animate-pulse">
      {[40, 65, 55, 80, 70, 45, 60].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col gap-1 items-center justify-end">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-md" style={{ height: `${h}%` }} />
          <div className="h-2 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

const DomainStats = ({ stats = {}, communityId }) => {
  const [activeChart,  setActiveChart]  = useState('activity');
  const [chartData,    setChartData]    = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError,   setChartError]   = useState(null);
const {fetchCommunityAnalyticsById} = useCommunity()
  const loadAnalytics = async () => {
    if (!communityId) return;
    setChartLoading(true);
    setChartError(null);
    try {
      const data = await getCommunityAnalytics(communityId);
      setChartData(data);
    } catch (err) {
      setChartError(err.message || 'Failed to load analytics');
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, [communityId]);

  const statCards = [
    { icon: Users,         label: 'Members',   value: formatNumber(stats.members),   color: 'blue'   },
    { icon: MessageSquare, label: 'Questions',  value: formatNumber(stats.questions), color: 'green'  },
    { icon: FileText,      label: 'Posts',      value: formatNumber(stats.posts),     color: 'purple' },
    { icon: Zap,           label: 'Online Now', value: stats.online ? formatNumber(stats.online) : 'Live', color: 'yellow' },
  ];

  const renderChart = () => {
    if (chartLoading) return <ChartSkeleton />;

    if (chartError) {
      return (
        <div className="h-[250px] flex flex-col items-center justify-center gap-3 text-gray-400">
          <AlertCircle size={24} />
          <p className="text-sm">{chartError}</p>
          <button onClick={loadAnalytics} className="text-xs text-blue-500 hover:underline">Try again</button>
        </div>
      );
    }

    if (!chartData) {
      return <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No data available</div>;
    }

    if (activeChart === 'activity') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day"   fontSize={10} />
            <YAxis               fontSize={10} />
            <Tooltip />
            <Legend />
            <Bar dataKey="questions" name="Questions" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="posts"     name="Posts"     fill="#8b5cf6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeChart === 'growth') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData.monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis               fontSize={10} />
            <Tooltip />
            <Area type="monotone" dataKey="growth" name="Members" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie data={chartData.engagement} dataKey="value" nameKey="name" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
            {chartData.engagement.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="mt-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Community Analytics</h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
          <TrendingUp size={14} />
          {chartLoading
            ? <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading...</span>
            : 'Real-time analytics'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm"
            >
              <div className={`h-10 w-10 ${COLOR[stat.color]} rounded-lg flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <div className="mt-3">
                <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'activity',   label: 'Weekly Activity' },
            { key: 'growth',     label: 'Member Growth'   },
            { key: 'engagement', label: 'Engagement'      },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors ${
                activeChart === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {renderChart()}
      </div>

      <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs sm:text-sm text-blue-700 dark:text-blue-300">
        <div className="flex gap-2 items-center">
          <Calendar size={16} className="flex-shrink-0" />
          Data updates in real-time as members interact with the community.
        </div>
      </div>
    </div>
  );
};

export default DomainStats;