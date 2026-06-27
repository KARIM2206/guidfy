'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flag, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { useCommunityReports, useResolveReport } from '@/app/hooks/useCommunityReports';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  LoadingRows, EmptyState, Pagination, ConfirmModal
} from '@/app/components/shared/DashboardCard';

const isAdmin = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

export default function CommunityReportsPage() {
  const { communityId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const { data, isLoading, isPlaceholderData } = useCommunityReports(communityId, page);
  const resolve = useResolveReport();

  const reports = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const handleResolve = async () => {
    if (!confirm.id) return;
    try {
      await resolve.mutateAsync({ reportId: confirm.id, notes: 'Resolved by admin' });
      setConfirm({ open: false, id: null });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);

  // Auth Guard (after all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 px-8 py-6 rounded-2xl text-center">
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/super-admin/dashboard/communities" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community Reports</h1>
          <p className="text-xs text-gray-500">View and resolve flagged content</p>
        </div>
      </motion.div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-4 text-left">Reporter</th>
                <th className="px-4 py-4 text-left">Content Type</th>
                <th className="px-4 py-4 text-left">Reason</th>
                <th className="px-4 py-4 text-left">Status</th>
                <th className="px-4 py-4 text-left">Date</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
              {isLoading && reports.length === 0 ? (
                <tr><td colSpan={6} className="p-6"><LoadingRows rows={5} /></td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Flag} title="No reports found" /></td></tr>
              ) : (
                reports.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-xs text-gray-800">{r.reporter?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-xs capitalize text-gray-800">{r.targetType}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'PENDING' ? (
                        <button
                          onClick={() => setConfirm({ open: true, id: r.id })}
                          className="text-emerald-600 hover:text-emerald-800 text-xs flex items-center gap-1 ml-auto transition"
                        >
                          <CheckCircle size={13} /> Resolve
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 pb-4">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            disabled={isPlaceholderData}
          />
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Resolve Report"
        description="Are you sure you want to mark this report as resolved?"
        onConfirm={handleResolve}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={resolve.isPending}
        danger={false}
      />
    </div>
  );
}