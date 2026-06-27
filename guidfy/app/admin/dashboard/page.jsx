// 'use client';
// import { useSuperAdmin } from '@/app/CONTEXT/SuperAdminContext';
// import  Card  from '@/app/components/ui/Card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { motion } from 'framer-motion';
// import OverviewStats from '@/app/components/admin/dashboard/OverviewStats';
// import { useEffect, useState } from 'react';
// import { getAllUsers,getAllDashboardStats } from '@/services/auth';
// import { useAuth } from '@/app/CONTEXT/AuthProvider';

// export default function DashboardPage() {
//   const {  learningPaths, roadmaps } = useSuperAdmin();
//  const {token}=useAuth()
//     const [users, setUsers] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState(null);
//   const totalLessons = roadmaps.reduce(
//     (acc, r) => acc + r.steps.reduce((stepAcc, s) => stepAcc + s.lessons.length, 0),
//     0
//   );
//    const fetchUsers = async () => {
//     try {
//       const usersData = await getAllUsers({ token });
  
//       setUsers(usersData?.data);     // لا تستخدم .data هنا
//     } catch (error) {
//       console.error('Fetch users error:', error.message);
//     }
//   };

//   const fetchDashboardStats = async () => {
//     try {
//       const statsData = await getAllDashboardStats({ token });
//       setDashboardStats(statsData?.data);
//     } catch (error) {
//       console.error('Fetch dashboard stats error:', error.message);
//     }
//   };

//   useEffect(() => {
//     if (!token) return; // تحقق فقط من وجود التوكن
//     fetchUsers();
//     fetchDashboardStats();
//   }, [token]);
// console.log(users.length,'users');

//   const data = [
//     { name: 'Users', count: dashboardStats?.users || users.length },
//     { name: 'Learning Paths', count: dashboardStats?.learningPaths || learningPaths.length },
//     { name: 'Roadmaps', count: dashboardStats?.roadmaps || roadmaps.length },
//     { name: 'Lessons', count: dashboardStats?.lessons || totalLessons },
//   ];

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
//       <OverviewStats />

//       <Card>
//         <h2 className="text-xl font-semibold mb-4">Overview</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="count" fill="#3b82f6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </Card>
//     </motion.div>
//   );
// }

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN DASHBOARD PAGE - REFACTORED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page demonstrates the new architecture with:
 * - Server-side middleware protection (checked in middleware.ts)
 * - Zustand for auth state
 * - React Query for data fetching
 * - Presentational components
 */

'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { LearningPathsContainer } from '@/app/components/learning-path/LearningPathsContainer';
import { useQuery } from '@tanstack/react-query';
import { getAllDashboardStats } from '@/services/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  AlertCircle, 
  Loader, 
  Shield, 
  Crown, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Activity,
  Settings,
  Lock
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const isSuperAdmin = (role) => role === 'SUPER_ADMIN';
const isAdmin = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    canManageAdmins: true,
    canDeleteData: true,
    canAccessSettings: true,
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    canManageAdmins: false,
    canDeleteData: false,
    canAccessSettings: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: RoleBadge
// ═══════════════════════════════════════════════════════════════════════════

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: StatCard
// ═══════════════════════════════════════════════════════════════════════════

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-200',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg border ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: SuperAdminOnly
// ═══════════════════════════════════════════════════════════════════════════

const SuperAdminOnly = ({ role, children }) => {
  if (!isSuperAdmin(role)) return null;
  return children;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading } = useAuthStore();

  const userRole = user?.role;
  const hasAccess = !!userRole && isAdmin(userRole);

  // ─── Dashboard Stats ────────────────────────────────────────────────
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getAllDashboardStats,
    enabled: hasAccess && !loading,
    staleTime: 5 * 60 * 1000,
  });

  const stats = statsRes?.data || { users: 0, learningPaths: 0, roadmaps: 0, lessons: 0 };
  
  const chartData = [
    { name: 'Users', count: stats.users || 0 },
    ...(isSuperAdmin(userRole) ? [{ name: 'Paths', count: stats.learningPaths || 0 }] : []),
    { name: 'Roadmaps', count: stats.roadmaps || 0 },
    { name: 'Lessons', count: stats.lessons || 0 },
  ];

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // ─── Not Authenticated ──────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-6 py-4 rounded-xl">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="text-red-700 font-medium">Not authenticated. Please sign in.</span>
        </div>
      </div>
    );
  }

  // ─── Role Check ─────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4 bg-red-50 border border-red-200 px-8 py-6 rounded-xl max-w-md text-center">
          <Lock className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
          <p className="text-red-600">
            You don't have permission to access the admin dashboard. 
            Contact a Super Admin if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.admin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <RoleBadge role={userRole} />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-900">{user.name || user.email}</span>
            </span>
            
            {/* Super Admin Quick Actions */}
            <SuperAdminOnly role={userRole}>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                <Settings size={16} />
                System Settings
              </button>
            </SuperAdminOnly>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={statsLoading ? "..." : stats.users} icon={Users} color="blue" />
          <SuperAdminOnly role={userRole}>
            <StatCard title="Learning Paths" value={statsLoading ? "..." : stats.learningPaths} icon={BookOpen} color="green" />
          </SuperAdminOnly>
          <StatCard title="Roadmaps" value={statsLoading ? "..." : stats.roadmaps} icon={MessageSquare} color="purple" />
          <StatCard title="Total Lessons" value={statsLoading ? "..." : stats.lessons} icon={Activity} color="orange" />
        </div>

        {/* ── Overview Chart ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Super Admin Stats (Extra) ──────────────────────────────── */}
        <SuperAdminOnly role={userRole}>
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown size={20} className="text-amber-500" />
              Super Admin Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Admins" value="12" icon={Shield} color="purple" />
              <StatCard title="System Health" value="99.9%" icon={Activity} color="green" />
              <StatCard title="Pending Reviews" value="23" icon={AlertCircle} color="orange" />
            </div>
          </div>
        </SuperAdminOnly>

        {/* ── Learning Paths Management ──────────────────────────────── */}
        <SuperAdminOnly role={userRole}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Learning Paths</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage and monitor all learning paths
                </p>
              </div>
              
              {/* Admin-level actions */}
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  + Create Path
                </button>
                
                <button className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Bulk Actions
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <LearningPathsContainer showActions={true} />
            </div>
          </div>
        </SuperAdminOnly>

        {/* ── Footer Info ────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between text-xs text-gray-400">
          <p>Logged in as {user.email}</p>
          <p>Role: {roleConfig.label} • Session active</p>
        </div>
      </div>
    </div>
  );
}