'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3, Users, FileText, MessageSquare, ArrowLeft, Loader
} from 'lucide-react';
import { getCommunityAnalyticsSA } from '@/services/community/superAdmin.service';
import { StatCard, LoadingRows, EmptyState } from '@/app/components/shared/DashboardCard';

// ═══════════════════════════════════════════════════
// FETCH ANALYTICS
// ═══════════════════════════════════════════════════
function useCommunityAnalytics(communityId) {
  return useQuery({
    queryKey: ['community-analytics', communityId],
    queryFn: () => getCommunityAnalyticsSA(communityId),
    enabled: !!communityId,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function CommunityAnalyticsPage() {
  const { communityId } = useParams();

  const { data, isLoading, error } = useCommunityAnalytics(communityId);

  const analytics = data?.data || data || null;
  const overview = analytics?.overview;
  const weeklyActivity = analytics?.weeklyActivity || [];

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8 flex items-center justify-center">
        <EmptyState
          icon={BarChart3}
          title="Failed to load analytics"
          description={error?.message || 'Something went wrong'}
        />
      </div>
    );
  }

  // ── Empty State ──
  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8 flex items-center justify-center">
        <EmptyState
          icon={BarChart3}
          title="No analytics available"
          description="No data found for this community"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link
          href="/super-admin/dashboard/communities"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community Analytics</h1>
          <p className="text-xs text-gray-500">Statistical and detailed reports</p>
        </div>
      </motion.div>

      {/* ═══ Stats Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Members"
          value={overview.totalMembers?.toLocaleString() ?? 0}
          color="blue"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Questions"
          value={overview.totalQuestions?.toLocaleString() ?? 0}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={overview.totalPosts?.toLocaleString() ?? 0}
          color="cyan"
        />
      </div>

      {/* ═══ Weekly Activity Chart ═══ */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Activity</h2>
        {weeklyActivity.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No activity this week</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={weeklyActivity}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="questions"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                name="Questions"
                maxBarSize={50}
              />
              <Bar
                dataKey="posts"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                name="Posts"
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}