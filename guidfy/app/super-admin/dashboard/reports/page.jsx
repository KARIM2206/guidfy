/* The above code is a React component for a Super Admin Reports Page. Here is a breakdown of what the
code is doing: */
// app/super-admin/reports/page.jsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  User,
  FileText,
  HelpCircle,
} from 'lucide-react';
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { PageLoading } from '@/components/dashboard/LoadingState';
import { getAllReportsSA, resolveReportSA, dismissReportSA } from '@/services/superAdmin.service';

// ═══════════════════════════════════════════════════
// Reports Page
// ═══════════════════════════════════════════════════

export default function SuperAdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [resolveAction, setResolveAction] = useState('');
  const [resolveNote, setResolveNote] = useState('');

  // ═══════════════════════════════════════════════════
  // Fetch Reports
  // ═══════════════════════════════════════════════════

  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await getAllReportsSA(params);
      setReports(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ═══════════════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════════════

  const handleResolve = async (reportId) => {
    if (!resolveAction) return;
    setActionLoading('resolve');
    try {
      await resolveReportSA(reportId, {
        action: resolveAction,
        note: resolveNote,
      });
      fetchReports(pagination?.page);
      setShowDetail(false);
      setResolveAction('');
      setResolveNote('');
    } catch (error) {
      console.error('Failed to resolve report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId) => {
    setActionLoading('dismiss');
    try {
      await dismissReportSA(reportId);
      fetchReports(pagination?.page);
      setShowDetail(false);
    } catch (error) {
      console.error('Failed to dismiss report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
    setResolveAction('');
    setResolveNote('');
  };

  // ═══════════════════════════════════════════════════
  // Stats
  // ═══════════════════════════════════════════════════

  const stats = {
    pending: reports.filter((r) => r.status === 'PENDING').length,
    resolved: reports.filter((r) => r.status === 'RESOLVED').length,
    dismissed: reports.filter((r) => r.status === 'DISMISSED').length,
    total: pagination?.total || 0,
  };

  // ═══════════════════════════════════════════════════
  // Target Type Icon
  // ═══════════════════════════════════════════════════

  const getTargetIcon = (type) => {
    switch (type) {
      case 'POST':
        return <FileText size={14} />;
      case 'QUESTION':
        return <HelpCircle size={14} />;
      case 'COMMUNITY':
        return <User size={14} />;
      default:
        return <Flag size={14} />;
    }
  };

  // ═══════════════════════════════════════════════════
  // Table Columns
  // ═══════════════════════════════════════════════════

  const columns = [
    {
      key: 'targetType',
      label: 'Type',
      render: (value) => (
        <Badge variant={value?.toLowerCase()} dot>
          {value}
        </Badge>
      ),
    },
    {
      key: 'reporter',
      label: 'Reporter',
      render: (value) => (
        <span className="text-gray-300">{value?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'community',
      label: 'Community',
      render: (value) => (
        <span className="text-gray-400">{value?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => (
        <span className="text-gray-400 line-clamp-1 max-w-[200px]">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value?.toLowerCase()} dot>
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => (
        <span className="text-gray-500 text-xs">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openDetail(row)}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  setSelectedReport(row);
                  setResolveAction('CONTENT_REMOVED');
                  handleResolve(row.id);
                }}
                disabled={actionLoading === 'resolve'}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                title="Quick Resolve"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleDismiss(row.id)}
                disabled={actionLoading === 'dismiss'}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-500/10 transition-colors disabled:opacity-50"
                title="Dismiss"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Reports"
          value={stats.total}
          icon={Flag}
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={MessageSquare}
          color="amber"
          delay={0.05}
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Dismissed"
          value={stats.dismissed}
          icon={XCircle}
          color="gray"
          delay={0.15}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          {['PENDING', 'RESOLVED', 'DISMISSED', ''].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {status === '' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-800" />
        <div className="flex items-center gap-2">
          {['', 'POST', 'QUESTION', 'COMMUNITY'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {type === '' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <PageLoading />
      ) : (
        <DataTable
          columns={columns}
          data={reports}
          pagination={pagination}
          onPageChange={fetchReports}
          emptyMessage="No reports found"
          emptyIcon={Flag}
        />
      )}

      {/* Report Detail Modal */}
      {showDetail && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Report Details</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <Badge variant={selectedReport.targetType?.toLowerCase()}>
                    {selectedReport.targetType}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge variant={selectedReport.status?.toLowerCase()} dot>
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Reporter</p>
                <p className="text-sm text-gray-300">{selectedReport.reporter?.name}</p>
                <p className="text-xs text-gray-500">{selectedReport.reporter?.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Community</p>
                <p className="text-sm text-gray-300">{selectedReport.community?.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm text-gray-300">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-400">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.post && (
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500 mb-1">Reported Post</p>
                  <p className="text-sm text-gray-300 font-medium">{selectedReport.post.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedReport.post.content}</p>
                </div>
              )}

              {selectedReport.question && (
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500 mb-1">Reported Question</p>
                  <p className="text-sm text-gray-300 font-medium">{selectedReport.question.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedReport.question.content}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Reported On</p>
                <p className="text-sm text-gray-400">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedReport.status === 'PENDING' && (
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Resolution Action
                    </label>
                    <select
                      value={resolveAction}
                      onChange={(e) => setResolveAction(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select action...</option>
                      <option value="CONTENT_REMOVED">Remove Content</option>
                      <option value="USER_WARNED">Warn User</option>
                      <option value="USER_BANNED">Ban User</option>
                      <option value="COMMUNITY_SUSPENDED">Suspend Community</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Note (optional)
                    </label>
                    <textarea
                      value={resolveNote}
                      onChange={(e) => setResolveNote(e.target.value)}
                      rows={3}
                      placeholder="Add additional notes..."
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResolve(selectedReport.id)}
                      disabled={!resolveAction || actionLoading === 'resolve'}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleDismiss(selectedReport.id)}
                      disabled={actionLoading === 'dismiss'}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {selectedReport.resolvedBy && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Resolved By</p>
                  <p className="text-sm text-gray-300">{selectedReport.resolvedBy?.name}</p>
                  {selectedReport.resolutionNote && (
                    <p className="text-xs text-gray-500 mt-1">{selectedReport.resolutionNote}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}