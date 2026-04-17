'use client';
import { useSuperAdmin } from '@/app/CONTEXT/SuperAdminContext';
import  Card  from '@/app/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import OverviewStats from '@/app/components/admin/dashboard/OverviewStats';
import { useEffect, useState } from 'react';
import { getAllUsers,getAllDashboardStats } from '@/services/auth';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

export default function DashboardPage() {
  const {  learningPaths, roadmaps } = useSuperAdmin();
 const {token}=useAuth()
    const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const totalLessons = roadmaps.reduce(
    (acc, r) => acc + r.steps.reduce((stepAcc, s) => stepAcc + s.lessons.length, 0),
    0
  );
   const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers({ token });
  
      setUsers(usersData?.data);     // لا تستخدم .data هنا
    } catch (error) {
      console.error('Fetch users error:', error.message);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const statsData = await getAllDashboardStats({ token });
      setDashboardStats(statsData?.data);
    } catch (error) {
      console.error('Fetch dashboard stats error:', error.message);
    }
  };

  useEffect(() => {
    if (!token) return; // تحقق فقط من وجود التوكن
    fetchUsers();
    fetchDashboardStats();
  }, [token]);
console.log(users.length,'users');

  const data = [
    { name: 'Users', count: dashboardStats?.users || users.length },
    { name: 'Learning Paths', count: dashboardStats?.learningPaths || learningPaths.length },
    { name: 'Roadmaps', count: dashboardStats?.roadmaps || roadmaps.length },
    { name: 'Lessons', count: dashboardStats?.lessons || totalLessons },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <OverviewStats />

      <Card>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}