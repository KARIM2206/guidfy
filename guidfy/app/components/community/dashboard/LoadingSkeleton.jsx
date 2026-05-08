'use client';

import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
//  LoadingSkeleton - Loading state placeholder
// ═══════════════════════════════════════════════════════════════

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/50">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-12 bg-slate-700/50" />

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-700/50" />
          <div className="h-4 w-1/2 rounded bg-slate-700/50" />

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-6 w-12 mx-auto rounded bg-slate-700/50" />
                <div className="h-3 w-16 mx-auto rounded bg-slate-700/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50">
      <table className="w-full">
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-b border-slate-700/50 animate-pulse">
              <td colSpan="5" className="p-4">
                <div className="h-4 bg-slate-700/50 rounded w-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-6 animate-pulse">
          <div className="mb-3 h-10 w-10 rounded-lg bg-slate-700/50" />
          <div className="mb-2 h-8 w-20 rounded bg-slate-700/50" />
          <div className="h-4 w-32 rounded bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}
