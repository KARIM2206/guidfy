'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3, Users, FileText, MessageSquare, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { getCommunityAnalyticsSA } from '@/services/community/superAdmin.service';
import { StatCard, LoadingRows, EmptyState } from '@/app/components/shared/DashboardCard';

export default function SuperAdminCommunityAnalytics() {
  const { communityId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCommunityAnalyticsSA(communityId);
        // التعامل مع اختلاف شكل الـ response (قد يكون { data: {...} } أو مباشرة {...})
        setAnalytics(res.data || res);
      } catch (error) {
        console.error(error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [communityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <LoadingRows rows={10} />
      </div>
    );
  }

  if (!analytics || !analytics.overview) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <EmptyState icon={BarChart3} title="No analytics available" />
      </div>
    );
  }

  const { overview, weeklyActivity = [] } = analytics;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 text-white">
      {/* رأس الصفحة */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-4">
        <Link href="/super-admin/dashboard/communities" className="text-gray-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl text-gray-900 font-bold">Community Analytics</h1>
          <p className="text-xs text-gray-400">Statistical and detailed reports</p>
        </div>
      </motion.div>

      {/* بطاقات إحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Overview Member"
          value={overview.totalMembers}
          color="blue"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Questions"
          value={overview.totalQuestions}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={overview.totalPosts}
          color="red"
        />
      </div>

      {/* النشاط الأسبوعي (رسم بياني شريطي مزدوج) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mb-8">
  <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Activity</h2>
  {weeklyActivity.length === 0 ? (
    <p className="text-xs text-gray-500">No activity this week.</p>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={weeklyActivity}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="day" stroke="#64748b" />
        <YAxis stroke="#64748b" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          labelStyle={{ color: '#1e293b' }}
        />
        <Legend wrapperStyle={{ color: '#334155' }} />
        <Bar
          dataKey="questions"
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
          name="Questions"
          aria-label="Questions bar"
        />
        <Bar
          dataKey="posts"
          fill="#06b6d4"
          radius={[4, 4, 0, 0]}
          name="Posts"
          aria-label="Posts bar"
        />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>
    </div>
  );
}