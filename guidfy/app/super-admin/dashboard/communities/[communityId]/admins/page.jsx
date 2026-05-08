'use client';
// app/super-admin/admins/page.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, RefreshCw, UserX } from 'lucide-react';
import { getCommunityAdminsSA, removeAdminFromCommunity } from '@/services/community/superAdmin.service';
import {
  StatCard, EmptyState, LoadingRows, Pagination, ConfirmModal, Avatar,
} from '@/app/components/shared/DashboardCard';

// ═══════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════

export default function SuperAdminAdminsPage() {
  const [admins,     setAdmins]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [confirm,    setConfirm]    = useState({ open: false, userId: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdmins = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getCommunityAdminsSA({ page, limit: 10 });
      setAdmins(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(1); }, [fetchAdmins]);

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      // Pass 0 as communityId — backend just demotes the user role
      await removeAdminFromCommunity(0, confirm.userId);
      setConfirm({ open: false });
      fetchAdmins(pagination.page);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2">
            <Shield size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admins</h1>
            <p className="text-xs text-slate-400">Manage all community administrators</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Shield} label="Total Admins" value={pagination.total} color="amber" delay={0.05} />
        <StatCard icon={Users}  label="This page"   value={admins.length}     color="blue"  delay={0.10} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">All Administrators</h3>
          <button onClick={() => fetchAdmins(pagination.page)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 text-left">Admin</th>
                <th className="px-4 py-4 text-left">Email</th>
                <th className="px-4 py-4 text-left">Joined</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-6"><LoadingRows rows={5} /></td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon={Shield} title="No admins found" /></td></tr>
              ) : (
                admins.map((admin, i) => (
                  <motion.tr
                    key={admin.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={admin.avatar} name={admin.name} size={8} />
                        <div>
                          <p className="font-medium text-white">{admin.name}</p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <Shield size={10} className="text-amber-400" />
                            <span className="text-xs text-amber-400">Admin</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-400">{admin.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setConfirm({ open: true, userId: admin.id, name: admin.name })}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 ml-auto"
                      >
                        <UserX size={12} /> Demote
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <Pagination pagination={pagination} onPageChange={fetchAdmins} />
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title={`Demote "${confirm.name}"?`}
        description="This admin will be demoted to a regular student. They will lose all admin privileges."
        onConfirm={handleRemove}
        onCancel={() => setConfirm({ open: false })}
        loading={actionLoading}
        danger
      />
    </div>
  );
}