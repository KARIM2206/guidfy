'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Plus } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  EmptyState - Display when no data
// ═══════════════════════════════════════════════════════════════

export default function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action = null,
  actionLabel = 'Create',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-lg border border-dashed 
                 border-slate-700/50 bg-slate-800/30 py-12 px-4 text-center"
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-slate-800/50 p-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm text-slate-400">{description}</p>

      {/* Action */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm 
                     font-semibold text-white transition-all hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
