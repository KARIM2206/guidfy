// // app/super-admin/analytics/page.jsx

// 'use client';

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Users,
//   Globe,
//   FileText,
//   HelpCircle,
//   Flag,
//   TrendingUp,
//   ShieldOff,
//   Calendar,
// } from 'lucide-react';
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import StatsCard from '@/components/dashboard/StatsCard';
// import { ChartSkeleton } from '@/components/dashboard/LoadingState';
// import { getPlatformAnalytics, getAnalyticsOverview, getAnalyticsGrowth, getAnalyticsTopCommunities } from '@/services/superAdmin.service';

// // ═══════════════════════════════════════════════════
// // Analytics Page
// // ═══════════════════════════════════════════════════

// export default function SuperAdminAnalyticsPage() {
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [period, setPeriod] = useState('30d');

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setLoading(true);
//       try {
//         const response = await getPlatformAnalytics({ period });
//         setAnalytics(response.data);
//       } catch (error) {
//         console.error('Failed to fetch analytics:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, [period]);

//   // ═══════════════════════════════════════════════════
//   // Mini Bar Chart Component
//   // ═══════════════════════════════════════════════════

//   const MiniBarChart = ({ data, color = 'blue' }) => {
//     if (!data || data.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
//           No data available
//         </div>
//       );
//     }

//     const maxCount = Math.max(...data.map((d) => d.count), 1);
//     const colorClasses = {
//       blue: 'bg-blue-500',
//       green: 'bg-emerald-500',
//       purple: 'bg-purple-500',
//       cyan: 'bg-cyan-500',
//     };

//     return (
//       <div className="flex items-end gap-1 h-48">
//         {data.map((item, index) => (
//           <div key={index} className="flex-1 flex flex-col items-center gap-1">
//             <motion.div
//               initial={{ height: 0 }}
//               transition={{ duration: 0.5 }} />
//           </div>
//         ))}
//       </div>
//     );
//   };
// }

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Analytics Page - Coming Soon
    </div>
  );
}