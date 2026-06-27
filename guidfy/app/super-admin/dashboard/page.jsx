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
  Lock,
  Briefcase,
  Map
} from 'lucide-react';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

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
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();

  const loading = authLoading || statsLoading;

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
  const userRole = user.role;
  const hasAccess = isAdmin(userRole);

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
          <StatCard title="Total Students" value={statsData?.students || 0} icon={Users} color="blue" />
          <StatCard title="Total Admins" value={statsData?.admins || 0} icon={Shield} color="purple" />
          <StatCard title="Learning Paths" value={statsData?.learningPaths || 0} icon={BookOpen} color="green" />
          <StatCard title="Communities" value={statsData?.communities || 0} icon={MessageSquare} color="orange" />
        </div>

        {/* ── Super Admin Stats & Charts ──────────────────────────────── */}
        <SuperAdminOnly role={userRole}>
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown size={20} className="text-amber-500" />
              Platform Analytics
            </h2>
            
            {/* Real Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard title="Total Jobs" value={statsData?.jobs || 0} icon={Briefcase} color="purple" />
              <StatCard title="Total Roadmaps" value={statsData?.roadmaps || 0} icon={Map} color="green" />
              <StatCard title="Total Lessons" value={statsData?.lessons || 0} icon={BookOpen} color="orange" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Content Metrics */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4">Content Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Roadmaps', count: statsData?.roadmaps || 0 },
                      { name: 'Lessons', count: statsData?.lessons || 0 },
                      { name: 'Jobs', count: statsData?.jobs || 0 },
                      { name: 'Projects', count: statsData?.projects || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Lesson Types */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4">Lessons Distribution</h3>
                <div className="h-64 flex justify-center">
                  {statsData?.lessonsByType?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statsData.lessonsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {statsData.lessonsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No lesson data available
                    </div>
                  )}
                </div>
              </div>
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