'use client';
// app/super-admin/communities/page.jsx
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Globe, Search, Trash2, PauseCircle, PlayCircle,
  Users, MessageSquare, FileText, MoreVertical, RefreshCw, Filter,
  BarChart3, Flag, Shield,
} from 'lucide-react';
import {
  getAllCommunitiesSA, suspendCommunity, activateCommunity, deleteCommunitySA,
} from '@/services/community/superAdmin.service';
import {
  StatCard, StatusBadge, EmptyState, LoadingRows, Pagination, ConfirmModal, Avatar,
} from '@/app/components/shared/DashboardCard';

const Table = dynamic(() => import('@/app/components/ui/Table'), {
  ssr: false,
  loading: () => <LoadingRows rows={5} />
});

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SuperAdminCommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // ─── Fetch ───────────────────────────────────────
  const fetchCommunities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAllCommunitiesSA({
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      });
      setCommunities(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCommunities(1);
  }, [fetchCommunities]);

  // ─── Actions ─────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendCommunity(confirm.id, 'Violated community guidelines');
      if (confirm.type === 'activate') await activateCommunity(confirm.id);
      if (confirm.type === 'delete') await deleteCommunitySA(confirm.id);
      setConfirm({ open: false });
      fetchCommunities(pagination.page);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }, [confirm, fetchCommunities, pagination.page]);

  const openConfirm = useCallback((type, id, name) => {
    setOpenMenu(null);
    setConfirm({ open: true, type, id, name });
  }, []);

  // ─── Memoized totals ─────────────────────────────
  const totals = useMemo(() => {
    const active = communities.filter((c) => c.status === 'ACTIVE').length;
    const suspended = communities.filter((c) => c.status === 'SUSPENDED').length;
    return { active, suspended };
  }, [communities]);

  // ─── Table Columns (defined once) ─────────────────
  const columns = useMemo(() => [
    {
      key: 'community',
      label: 'Community',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
            style={{ background: row.color ? `${row.color}22` : '#f3f4f6' }}
            aria-hidden="true"
          >
            {row.icon || '🌐'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">/{row.slug}</p>
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
      key: 'members',
      label: 'Members',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <Users size={12} className="text-gray-400" aria-hidden="true" />
          {row.stats?.members?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'posts',
      label: 'Posts',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <FileText size={12} className="text-gray-400" aria-hidden="true" />
          {row.stats?.posts?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-700">
          <MessageSquare size={12} className="text-gray-400" aria-hidden="true" />
          {row.stats?.questions?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={row.createdBy?.avatar}
            name={row.createdBy?.name}
            size={6}
            alt={`${row.createdBy?.name || 'Community'}'s avatar`}
          />
          <span className="text-xs text-gray-600">{row.createdBy?.name}</span>
        </div>
      ),
    },
  ], []);

  // renderActions (defined once)
  const renderActions = useCallback((row) => {
    const isActive = row.status === 'ACTIVE';
    return (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/super-admin/dashboard/communities/${row.id}/analytics`}
          aria-label={`View analytics for ${row.name}`}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition"
        >
          <BarChart3 size={14} aria-hidden="true" />
        </Link>
        <Link
          href={`/super-admin/dashboard/communities/${row.id}/reports`}
          aria-label={`View reports for ${row.name}`}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition"
        >
          <Flag size={14} aria-hidden="true" />
        </Link>
        <Link
          href={`/super-admin/dashboard/communities/${row.id}/admins`}
          aria-label={`Manage admins for ${row.name}`}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition"
        >
          <Shield size={14} aria-hidden="true" />
        </Link>
        <Link
          href={`/super-admin/dashboard/communities/${row.id}/users`}
          aria-label={`View users of ${row.name}`}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition"
        >
          <Users size={14} aria-hidden="true" />
        </Link>
        <div className="relative">
          <button
            aria-label={`More actions for ${row.name}`}
            onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreVertical size={15} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {openMenu === row.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg"
                role="menu"
              >
                {isActive ? (
                  <button
                    aria-label={`Suspend ${row.name}`}
                    onClick={() => openConfirm('suspend', row.id, row.name)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-amber-600 hover:bg-gray-50"
                    role="menuitem"
                  >
                    <PauseCircle size={13} aria-hidden="true" /> Suspend
                  </button>
                ) : (
                  <button
                    aria-label={`Activate ${row.name}`}
                    onClick={() => openConfirm('activate', row.id, row.name)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-emerald-600 hover:bg-gray-50"
                    role="menuitem"
                  >
                    <PlayCircle size={13} aria-hidden="true" /> Activate
                  </button>
                )}
                <div className="my-1 border-t border-gray-100" aria-hidden="true" />
                <button
                  aria-label={`Delete ${row.name} permanently`}
                  onClick={() => openConfirm('delete', row.id, row.name)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-600 hover:bg-gray-50"
                  role="menuitem"
                >
                  <Trash2 size={13} aria-hidden="true" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }, [openMenu, openConfirm]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2" aria-hidden="true">
            <Globe size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Communities</h1>
            <p className="text-xs text-gray-500">Manage all platform communities</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - تأكد من أن StatCard يستخدم ألوان مناسبة للتباين */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Globe} label="Total" value={pagination.total} color="blue" delay={0.05} />
        <StatCard icon={PlayCircle} label="Active" value={totals.active} color="green" delay={0.1} />
        <StatCard icon={PauseCircle} label="Suspended" value={totals.suspended} color="red" delay={0.15} />
        <StatCard icon={Users} label="This page" value={communities.length} color="purple" delay={0.2} />
      </div>

      {/* Filters - مع تحسين التباين والوصول */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="community-search" className="sr-only">Search communities</label>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="community-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            aria-label="Search by community name or slug"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" aria-hidden="true" />
          <span className="sr-only">Filter by status</span>
          {['', 'ACTIVE', 'SUSPENDED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                statusFilter === s
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={statusFilter === s}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchCommunities(pagination.page)}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50"
          aria-label="Refresh communities list"
        >
          <RefreshCw size={14} aria-hidden="true" />
        </button>
      </div>

      {/* الجدول المعاد استخدامه مع lazy loading */}
      <Table
        columns={columns}
        data={communities}
        renderActions={renderActions}
        loading={loading}
        emptyMessage="No communities found"
        hoverable
        striped
        compact={false}
      />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination pagination={pagination} onPageChange={fetchCommunities} />
      </div>

      {/* Confirm Modal - تم تحسينه مسبقاً في DashboardCard */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === 'delete' ? `Delete "${confirm.name}"?` :
          confirm.type === 'suspend' ? `Suspend "${confirm.name}"?` :
          `Activate "${confirm.name}"?`
        }
        description={
          confirm.type === 'delete'
            ? 'This action cannot be undone. All content will be permanently removed.'
            : confirm.type === 'suspend'
            ? 'Members will not be able to post or interact until the community is reactivated.'
            : 'The community and all its content will be accessible again.'
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false })}
        loading={actionLoading}
        danger={confirm.type !== 'activate'}
      />
    </div>
  );
}