// components/dashboard/Badge.jsx

'use client';

// ═══════════════════════════════════════════════════
// Badge Component
// ═══════════════════════════════════════════════════

const variants = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  banned: 'bg-red-500/10 text-red-400 border-red-500/20',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  super_admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  student: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  post: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  question: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  community: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}) {
  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizeMap[size] || sizeMap.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${variantStyle} ${sizeStyle}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'active'
              ? 'bg-emerald-400'
              : variant === 'suspended' || variant === 'banned'
              ? 'bg-red-400'
              : variant === 'pending'
              ? 'bg-amber-400'
              : 'bg-gray-400'
          }`}
        />
      )}
      {children}
    </span>
  );
}