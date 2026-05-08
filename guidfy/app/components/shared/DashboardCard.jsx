'use client';
// components/shared/DashboardCard.jsx
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback } from 'react';

// إعدادات عامة للحركات لتقليل إعادة التصيير
const transitionSettings = { duration: 0.2, ease: 'easeOut' };

export function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
  const colors = {
    blue:   'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    green:  'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
    red:    'from-red-50 to-red-100 border-red-200 text-red-700',
    amber:  'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
  };

  const iconColors = {
    blue:   'text-blue-600',
    purple: 'text-purple-600',
    green:  'text-emerald-600',
    red:    'text-red-600',
    amber:  'text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...transitionSettings }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${colors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          {/* تحسين التباين: text-gray-600 بدلاً من 500 لأن الخط صغير */}
          <p className="text-xs font-medium uppercase tracking-widest text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
          {sub && <p className="mt-1 text-xs text-gray-600">{sub}</p>}
        </div>
        <div className={`rounded-xl bg-white/80 p-2 shadow-sm ${iconColors[color]}`} aria-hidden="true">
          <Icon size={22} className={iconColors[color]} />
        </div>
      </div>
    </motion.div>
  );
}

export function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    ACTIVE:    'bg-emerald-100 text-emerald-800 border-emerald-200', // تحسين التباين
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    ARCHIVED:  'bg-gray-100 text-gray-800 border-gray-200',
    PENDING:   'bg-amber-100 text-amber-800 border-amber-200',
    RESOLVED:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    DISMISSED: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map.PENDING}`}>
      {status}
    </span>
  );
}

export function Avatar({ src, name, size = 8, alt }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const sizeClass = `w-${size} h-${size}`;
  const imageAlt = alt || (name ? `${name}'s avatar` : 'User avatar');

  return src ? (
    <div className={`relative ${sizeClass} rounded-full overflow-hidden bg-gray-100`}>
      <Image
        src={`http://localhost:8000${src}`}
        unoptimized
        alt={imageAlt}
        fill
        className="absolute inset-0 object-cover"
      />
    </div>
  ) : (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm`}
      aria-label={imageAlt}
      role="img"
    >
      {initials}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-gray-100 p-4" aria-hidden="true">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-xs text-gray-600">{description}</p>}
    </div>
  );
}

export function LoadingRows({ rows = 5 }) {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
      ))}
      <span className="sr-only">Loading community data</span>
    </div>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  const handlePrev = useCallback(() => {
    if (page > 1) onPageChange(page - 1);
  }, [page, onPageChange]);

  const handleNext = useCallback(() => {
    if (page < pages) onPageChange(page + 1);
  }, [page, pages, onPageChange]);

  return (
    <nav
      className="flex items-center justify-between border-t border-gray-100 px-2 pt-4"
      aria-label="Pagination navigation"
    >
      <p className="text-xs text-gray-600">
        Page {page} of {pages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={page <= 1}
          aria-label="Go to previous page"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={page >= pages}
          aria-label="Go to next page"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  if (!open) return null;

  const modalLabelId = 'confirm-modal-label';
  const modalDescId = 'confirm-modal-desc';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel} // إغلاق عند النقر على الخلفية
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={transitionSettings}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalLabelId}
        aria-describedby={modalDescId}
        className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // منع إغلاق عند النقر داخل المودال
      >
        <h3 id={modalLabelId} className="text-base font-semibold text-gray-900">
          {title}
        </h3>
        <p id={modalDescId} className="mt-2 text-sm text-gray-700">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}