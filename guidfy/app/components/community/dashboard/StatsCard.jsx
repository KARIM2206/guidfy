'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  StatsCard - Display metric with trend
// ═══════════════════════════════════════════════════════════════

export default function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  backgroundColor = 'bg-blue-500/10',
  textColor = 'text-blue-400',
  borderColor = 'border-blue-500/20',
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg border ${borderColor} ${backgroundColor} 
                   backdrop-blur-sm p-6 transition-all duration-300`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-lg ${backgroundColor} p-2.5`}>
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>

      {/* Label */}
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        {changeLabel && <p className="mt-1 text-xs text-slate-500">{changeLabel}</p>}
      </div>
    </motion.div>
  );
}
