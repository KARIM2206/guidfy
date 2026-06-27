/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEARNING PATHS CONTAINER - SMART COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is a SMART/CONTAINER COMPONENT:
 * - Handles all data fetching via custom hooks
 * - Manages state and side effects
 * - Passes data to presentational components
 * - Handles user interactions and mutations
 * 
 * This component is NOT exported directly to pages.
 * Pages import the presentational component and pass data from hooks.
 */

'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { LearningPathsList } from './LearningPathsList';
import {
  useLearningPathsQuery,
  useDeleteLearningPath,
} from '@/app/hooks/useLearningPathsQuery';
import { useAdminLearningPaths } from '@/app/hooks/useLearningPath';
import { useAuthStore } from '@/lib/stores/authStore';

export function LearningPathsContainer({ showActions = false }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // ─── Data Fetching ──────────────────────────────────────────────────
  const superAdminQuery = useLearningPathsQuery(page, limit, {}, { enabled: isSuperAdmin });
  const adminQuery = useAdminLearningPaths('JOB', { enabled: !isSuperAdmin });
  
  const { data, isLoading, error } = isSuperAdmin ? superAdminQuery : adminQuery;

  // ─── Mutations ───────────────────────────────────────────────────────
  const deletePathMutation = useDeleteLearningPath();

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this learning path?')) {
      return;
    }

    try {
      await deletePathMutation.mutateAsync(id);
      toast.success('Learning path deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete learning path');
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    window.location.href = `/admin/dashboard/learning-paths/${id}/edit`;
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      {showActions && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Learning Paths</h2>
          <a
            href="/admin/dashboard/learning-paths/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New
          </a>
        </div>
      )}

      {/* List Component */}
      <LearningPathsList
        paths={data?.data}
        isLoading={isLoading}
        error={error}
        onDelete={showActions ? handleDelete : null}
        onEdit={showActions ? handleEdit : null}
        showActions={showActions}
      />

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {page} of {data.pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
