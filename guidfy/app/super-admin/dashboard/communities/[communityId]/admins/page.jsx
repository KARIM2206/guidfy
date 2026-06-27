'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, RefreshCw, UserX, UserPlus, Loader, Search } from 'lucide-react';
import {
  useCommunityAdmins,
  useRemoveAdmin,
  useAssignAdmin,
} from '@/app/hooks/useCommunityAdmins';
import { useAuthStore } from '@/lib/stores/authStore';
import { getAllUsers } from '@/services/auth';
import {
  StatCard, EmptyState, LoadingRows, Pagination, ConfirmModal, Avatar,
} from '@/app/components/shared/DashboardCard';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const isSuperAdmin = (role) => role === 'SUPER_ADMIN';

// ═══════════════════════════════════════════════════
// ASSIGN MODAL
// ═══════════════════════════════════════════════════
function AssignAdminModal({ open, communityId, onClose }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const assign = useAssignAdmin();

  // جيب كل اليوزرز اللي role = ADMIN أو STUDENT عشان تعينهم
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-for-assign'],
    queryFn: () => getAllUsers({ role: 'ADMIN', limit: 100 }),
    enabled: open,
  });

  const users = usersData?.data || [];

  const handleClose = () => {
    setSelectedUserId('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedUserId || !communityId) return;
    setError('');
    try {
      await assign.mutateAsync({
        communityId: Number(communityId),
        userId: Number(selectedUserId),
      });
      handleClose();
    } catch (err) {
      setError(err?.message || 'Failed to assign admin.');
    }
  };

  const selectedUser = users.find((u) => u.id === Number(selectedUserId));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4"
          >
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2">
                <UserPlus size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Assign New Admin</h3>
                <p className="text-xs text-gray-400">Community #{communityId}</p>
              </div>
            </div>

            {/* Users List */}
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={20} className="animate-spin text-amber-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No users available
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {users.map((u) => {
                  const isSelected = Number(selectedUserId) === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(String(u.id))}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-amber-50 ${
                        isSelected ? 'bg-amber-50 border-l-2 border-amber-500' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-semibold text-amber-700">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                            <svg viewBox="0 0 10 10" className="w-2 h-2 fill-white">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-amber-700' : 'text-gray-900'}`}>
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>

                      {/* ID badge */}
                      <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                        #{u.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected preview */}
            {selectedUser && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-700">
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <p className="text-xs text-amber-700 font-medium">
                  {selectedUser.name} will be assigned as admin
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={handleClose}
                disabled={assign.isPending}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedUserId || assign.isPending}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition"
              >
                {assign.isPending
                  ? <Loader size={14} className="animate-spin" />
                  : <UserPlus size={14} />
                }
                {assign.isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function AdminsPage() {
  const { communityId } = useParams();
  console.log('Community ID from params:', communityId);
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [page, setPage]       = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, userId: null, name: '' });

  const { data, isLoading, isPlaceholderData, refetch } =
    useCommunityAdmins(page, communityId ?? null);

  const remove = useRemoveAdmin();

  const admins     = data?.data       || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  // ── Handlers ────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirm.userId || !communityId) return;
    try {
      await remove.mutateAsync({
        communityId: Number(communityId),
        userId: confirm.userId,
      });
      setConfirm({ open: false, userId: null, name: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Auth Guard ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isSuperAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 px-8 py-6 rounded-2xl text-center">
          <Shield className="w-10 h-10 text-red-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
          <p className="mt-1 text-sm text-red-500">Super Admin only</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2">
            <Shield size={22} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Admins
              {communityId && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  — Community #{communityId}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              {communityId
                ? 'Admin assigned to this community'
                : 'All platform administrators'}
            </p>
          </div>
        </div>

        {/* Assign button — only when communityId is provided */}
        {communityId && (
          <button
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 transition"
          >
            <UserPlus size={15} />
            Assign Admin
          </button>
        )}
      </motion.div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Shield} label="Total Admins" value={pagination.total} color="amber" delay={0.05} />
        <StatCard icon={Users}  label="This page"    value={admins.length}    color="blue"  delay={0.10} />
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Table header bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {communityId ? 'Assigned Administrator' : 'All Administrators'}
          </h3>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/60">
                <th className="px-6 py-3 text-left">Admin</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>

              {/* Loading */}
              {isLoading && admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6">
                    <LoadingRows rows={3} />
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && admins.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Shield}
                      title={communityId
                        ? 'No admin assigned to this community'
                        : 'No admins found'}
                    />
                  </td>
                </tr>
              )}

              {/* Rows */}
              {admins.map((admin, i) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Name + Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={admin.avatar} name={admin.name} size={8} />
                      <div>
                        <p className="font-medium text-gray-900">{admin.name}</p>
                        <p className="text-xs text-gray-400">ID: {admin.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500">{admin.email}</span>
                  </td>

                  {/* Role badge */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      admin.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Shield size={10} />
                      {admin.role}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setConfirm({ open: true, userId: admin.id, name: admin.name })}
                      disabled={!communityId || remove.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 ml-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title={!communityId ? 'Open from a community page' : `Remove ${admin.name}`}
                    >
                      <UserX size={12} />
                      Remove
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && admins.length > 0 && (
          <div className="px-6 pb-4">
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              disabled={isPlaceholderData}
            />
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <AssignAdminModal
        open={assignOpen}
        communityId={communityId}
        onClose={() => setAssignOpen(false)}
      />

      <ConfirmModal
        open={confirm.open}
        title={`Remove "${confirm.name}"?`}
        description="This admin will be removed from the community and their role will revert to Student."
        onConfirm={handleRemove}
        onCancel={() => setConfirm({ open: false, userId: null, name: '' })}
        loading={remove.isPending}
        danger
      />
    </div>
  );
}