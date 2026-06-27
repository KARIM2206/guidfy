'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  useCommunities,
  useCommunitiesStats,
  useCommunityActions,
} from '@/app/hooks/useCommunitiesQueries';
import { useCreateCommunity, useUpdateCommunity } from '@/app/hooks/useCommunitiesQueries';

import {
  Globe, Search, Trash2, PauseCircle, PlayCircle,
  Users, MessageSquare, FileText, MoreVertical, RefreshCw,
  Filter, BarChart3, Flag, Shield, Crown, Lock, Loader,
  UserCog, Plus, Pencil,
} from 'lucide-react';

import {
  StatCard, StatusBadge, LoadingRows, Pagination, ConfirmModal, Avatar,
} from '@/app/components/shared/DashboardCard';
import CreateCommunityModal from '@/app/components/community/CreateCommunityModal';

const Table = dynamic(() => import('@/app/components/ui/Table'), {
  ssr: false,
  loading: () => <LoadingRows rows={5} />,
});

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const isSuperAdmin = (role) => role === 'SUPER_ADMIN';
const isAdmin      = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'text-amber-600', bgColor: 'bg-amber-50',  borderColor: 'border-amber-200', icon: Crown  },
  ADMIN:       { label: 'Admin',       color: 'text-blue-600',  bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',  icon: Shield },
};

const SuperAdminOnly = ({ role, children }) => isSuperAdmin(role) ? children : null;

function AdminBadge({ admin }) {
  if (!admin) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
        <Shield size={10} /> No Admin
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {admin.avatar ? (
        <img src={admin.avatar} className="w-6 h-6 rounded-full object-cover" alt={admin.name} />
      ) : (
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
          {admin.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <span className="text-xs text-gray-700 font-medium">{admin.name}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function SuperAdminCommunitiesPage() {

  // ── Auth ──────────────────────────────────────────────────────────────
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();

  // ── UI State ──────────────────────────────────────────────────────────
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu]       = useState(null);
  const [confirm, setConfirm]         = useState({ open: false, type: null, id: null, name: '' });

  // ── Modal state ───────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null); // null = create, object = edit

  // ── Data ──────────────────────────────────────────────────────────────
  const { data, isLoading, isPlaceholderData, refetch } =
    useCommunities(page, search, statusFilter);

  const { suspend, activate, remove } = useCommunityActions();

  const communities = data?.data       || [];
  const pagination  = data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const { total: statsTotal, active: statsActive, suspended: statsSuspended } =
    useCommunitiesStats();

  const roleConfig      = useMemo(() => ROLE_CONFIG[user?.role] || ROLE_CONFIG.ADMIN, [user?.role]);
  const isActionPending = suspend.isPending || activate.isPending || remove.isPending;

  // ── Handlers ──────────────────────────────────────────────────────────
  const openConfirm = useCallback((type, id, name) => {
    setOpenMenu(null);
    setConfirm({ open: true, type, id, name });
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      if (confirm.type === 'suspend')  await suspend.mutateAsync({ id: confirm.id, reason: 'Violated community guidelines' });
      if (confirm.type === 'activate') await activate.mutateAsync(confirm.id);
      if (confirm.type === 'delete')   await remove.mutateAsync(confirm.id);
      setConfirm({ open: false });
    } catch (err) {
      console.error(err);
    }
  }, [confirm, suspend, activate, remove]);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setOpenMenu(null);
    setEditTarget(row);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
    // refresh بعد الإغلاق عشان يجيب البيانات الجديدة
    refetch();
  }, [refetch]);

  // ── Table Columns ─────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: 'community',
      label: 'Community',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
            style={{ background: row.color ? `${row.color}22` : '#f3f4f6' }}
          >
            {row.icon || '🌐'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400 font-mono">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'admin',
      label: 'Assigned Admin',
      render: (row) => <AdminBadge admin={row.admin} />,
    },
    {
      key: 'members',
      label: 'Members',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <Users size={12} className="text-gray-400" />
          {row.stats?.members?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      key: 'posts',
      label: 'Posts',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <FileText size={12} className="text-gray-400" />
          {row.stats?.posts?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <MessageSquare size={12} className="text-gray-400" />
          {row.stats?.questions?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.createdBy?.avatar} name={row.createdBy?.name} size={6} />
          <span className="text-xs text-gray-500">{row.createdBy?.name || 'Unknown'}</span>
        </div>
      ),
    },
  ], []);

  // ── Row Actions ────────────────────────────────────────────────────────
  const renderActions = useCallback((row) => {
    const isActive = row.status === 'ACTIVE';
    return (
      <div className="flex items-center justify-end gap-1">

        {/* Edit — Super Admin فقط */}
        <SuperAdminOnly role={user?.role}>
          <button
            onClick={() => openEdit(row)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition"
            title="Edit Community"
          >
            <Pencil size={14} />
          </button>
        </SuperAdminOnly>

        {/* Analytics */}
        <Link
          href={`communities/${row.id}/analytics`}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
          title="Analytics"
        >
          <BarChart3 size={14} />
        </Link>

        {/* Reports */}
        <Link
          href={`communities/${row.id}/reports`}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition"
          title="Reports"
        >
          <Flag size={14} />
        </Link>

        {/* Admins */}
        <Link
          href={`communities/${row.id}/admins`}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
          title="Manage Admin"
        >
          <UserCog size={14} />
        </Link>

        {/* Members */}
        <Link
          href={`communities/${row.id}/users`}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
          title="Members"
        >
          <Users size={14} />
        </Link>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <MoreVertical size={15} />
          </button>

          <AnimatePresence>
            {openMenu === row.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
              >
                {/* Suspend / Activate */}
                {isActive ? (
                  <button
                    onClick={() => openConfirm('suspend', row.id, row.name)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-amber-600 hover:bg-amber-50 transition"
                  >
                    <PauseCircle size={13} /> Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => openConfirm('activate', row.id, row.name)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <PlayCircle size={13} /> Activate
                  </button>
                )}

                {/* Delete — Super Admin فقط */}
                <SuperAdminOnly role={user?.role}>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => openConfirm('delete', row.id, row.name)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </SuperAdminOnly>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }, [openMenu, openConfirm, openEdit, user?.role]);

  // ── Auth Guards ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-500 text-sm">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-red-50 border border-red-200 px-8 py-6 rounded-2xl max-w-md text-center">
          <Lock className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
          <p className="text-red-600 text-sm">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2">
            <Globe size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Communities</h1>
            <p className="text-xs text-gray-500">Manage all platform communities</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create button — Super Admin فقط */}
          <SuperAdminOnly role={user.role}>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus size={15} />
              New Community
            </button>
          </SuperAdminOnly>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Role badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.bgColor} ${roleConfig.color} ${roleConfig.borderColor}`}>
            <roleConfig.icon size={14} />
            {roleConfig.label}
          </span>
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Globe}       label="Total"     value={statsTotal}        color="blue"   delay={0.05} />
        <StatCard icon={PlayCircle}  label="Active"    value={statsActive}       color="green"  delay={0.10} />
        <StatCard icon={PauseCircle} label="Suspended" value={statsSuspended}    color="red"    delay={0.15} />
        <StatCard icon={Users}       label="This page" value={communities.length} color="purple" delay={0.20} />
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search communities…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {['', 'ACTIVE', 'SUSPENDED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                statusFilter === s
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className={`transition-opacity duration-200 ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
        <Table
          columns={columns}
          data={communities}
          renderActions={renderActions}
          loading={isLoading}
          emptyMessage="No communities found"
          hoverable
          striped
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="mt-6">
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          disabled={isPlaceholderData}
        />
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === 'delete'  ? `Delete "${confirm.name}"?`  :
          confirm.type === 'suspend' ? `Suspend "${confirm.name}"?` :
                                       `Activate "${confirm.name}"?`
        }
        description={
          confirm.type === 'delete'
            ? 'This action cannot be undone. All content will be permanently removed.'
            : confirm.type === 'suspend'
            ? 'Members will not be able to post or interact until reactivated.'
            : 'The community and all its content will be accessible again.'
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false })}
        loading={isActionPending}
        danger={confirm.type !== 'activate'}
      />

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      <CreateCommunityModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        isEdit={!!editTarget}
        data={editTarget}
        // ✅ بدل setRefresh — بنستخدم refetch من TanStack مباشرة
        setRefresh={refetch}
      />
    </div>
  );
}