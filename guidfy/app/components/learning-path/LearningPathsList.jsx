/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEARNING PATHS LIST - PRESENTATIONAL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is a PURE PRESENTATIONAL COMPONENT:
 * - Receives all data via props (from custom hooks)
 * - Does NOT fetch data directly
 * - Does NOT manage state
 * - Only handles rendering and user interactions
 * - Easy to test and reuse
 * 
 * Usage:
 * const { data, isLoading, error } = useLearningPathsQuery();
 * <LearningPathsList paths={data?.data} isLoading={isLoading} error={error} />
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader, AlertCircle, Plus } from 'lucide-react';

export function LearningPathsList({
  paths = [],
  isLoading = false,
  error = null,
  onDelete = null,
  onEdit = null,
  showActions = false,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedIds.length === paths.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paths.map((p) => p.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ─── Render Loading State ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading learning paths...</span>
      </div>
    );
  }

  // ─── Render Error State ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <span className="ml-2 text-red-700">
          {error.message || 'Failed to load learning paths'}
        </span>
      </div>
    );
  }

  // ─── Render Empty State ──────────────────────────────────────────────
  if (!paths || paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <Plus className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">No learning paths yet</p>
        <p className="text-gray-500 text-sm">Create your first learning path to get started</p>
      </div>
    );
  }

  // ─── Render List ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      {showActions && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.length === paths.length && paths.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : 'Select all'}
            </span>
          </label>
        </div>
      )}

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => (
          <div
            key={path.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            {/* Checkbox */}
            {showActions && (
              <div className="mb-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(path.id)}
                  onChange={() => handleSelectOne(path.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {path.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {path.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{path.roadmapCount || 0} roadmaps</span>
              <span>{path.enrollmentCount || 0} enrolled</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/learning-paths/${path.id}`}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
              >
                View
              </Link>

              {showActions && onEdit && (
                <button
                  onClick={() => onEdit(path.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded border border-gray-200"
                >
                  Edit
                </button>
              )}

              {showActions && onDelete && (
                <button
                  onClick={() => onDelete(path.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
