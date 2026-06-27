'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAdminCommunities } from '@/app/hooks/useAdminCommunities';

import {
  Search, Users, MessageSquare, HelpCircle,
  ExternalLink, Loader2, SlidersHorizontal,
  AlertTriangle, Shield, Lock, RefreshCw,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

// ─── Color map ────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose:    'bg-rose-100 text-rose-700',
  amber:   'bg-amber-100 text-amber-700',
  cyan:    'bg-cyan-100 text-cyan-700',
  orange:  'bg-orange-100 text-orange-700',
  pink:    'bg-pink-100 text-pink-700',
};

// ─── Status Badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
}

// ─── Stat Cell ────────────────────────────────────────────────────────────
function StatCell({ icon: Icon, value }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-gray-700">
      <Icon size={14} className="text-gray-400" />
      <span className="font-medium">{value ?? 0}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────
function SkeletonRows({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100">
      {Array.from({ length: 6 }).map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  ));
}

// ─── Pagination ───────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange, disabled }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;

  return (
    <div className="flex items-center justify-between pt-4 text-sm text-gray-600">
      <span className="text-xs text-gray-400">{total} communities total</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 font-medium">{page} / {pages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages || disabled}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function AdminCommunitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();

  const [searchQuery, setSearchQuery]   = useState('');
  const [sortOrder, setSortOrder]       = useState('newest');
  const [page, setPage]                 = useState(1);

  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useAdminCommunities(page, searchQuery, sortOrder);

  const communities  = data?.communities || data?.data || [];
  const pagination   = data?.pagination  || { page: 1, pages: 1, total: communities.length };

  // client-side sort (server sort takes priority when available)
  const sorted = useMemo(() => {
    const list = [...communities];
    switch (sortOrder) {
      case 'newest':       return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':       return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'members_high': return list.sort((a, b) => (b.stats?.members || 0) - (a.stats?.members || 0));
      case 'members_low':  return list.sort((a, b) => (a.stats?.members || 0) - (b.stats?.members || 0));
      case 'name_asc':     return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':    return list.sort((a, b) => b.name.localeCompare(a.name));
      default:             return list;
    }
  }, [communities, sortOrder]);

  // ── Auth Guard ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!isAuthenticated || !user ||
      (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield size={24} className="text-blue-600" />
            My Communities
            {!isLoading && (
              <span className="text-sm font-normal bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">
                {pagination.total ?? communities.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Communities assigned to you by Super Admin
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────── */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to load communities</p>
            <p className="text-xs opacity-80 mt-0.5">
              Make sure you have admin permissions and{' '}
              <code className="bg-red-100 px-1 rounded">GET /admin/communities</code> is available.
            </p>
          </div>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative sm:w-56">
            <SlidersHorizontal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="members_high">Most Members</option>
              <option value="members_low">Least Members</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-gray-50">
                <th className="px-6 py-3 text-left">Community</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Members</th>
                <th className="px-4 py-3 text-center">Posts</th>
                <th className="px-4 py-3 text-center">Questions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
              {isLoading && sorted.length === 0 ? (
                <SkeletonRows rows={5} />
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <Shield size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No communities assigned to you.</p>
                    <p className="text-xs mt-1 text-gray-300">Contact a Super Admin to get assigned.</p>
                  </td>
                </tr>
              ) : (
                sorted.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* Community */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${COLOR_MAP[row.color] || 'bg-gray-100 text-gray-600'}`}>
                          {row.icon || '💬'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{row.name}</p>
                          {row.description && (
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {row.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        /{row.slug}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-4">
                      <StatCell icon={Users} value={row.stats?.members} />
                    </td>
                    <td className="px-4 py-4">
                      <StatCell icon={MessageSquare} value={row.stats?.posts} />
                    </td>
                    <td className="px-4 py-4">
                      <StatCell icon={HelpCircle} value={row.stats?.questions} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => router.push(`community/${row.slug}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Shield size={14} />
                          Manage
                        </button>
                        <button
                          onClick={() => router.push(`/community/${row.slug}`)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                          title="View community"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && sorted.length > 0 && (
          <div className="px-6 pb-4">
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              disabled={isPlaceholderData}
            />
          </div>
        )}
      </div>
    </div>
  );
}