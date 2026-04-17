import { motion } from 'framer-motion';

const variantStyles = {
  popular: 'bg-orange-100 text-orange-600',
  rewards: 'bg-purple-100 text-purple-600',
  live: 'bg-blue-100 text-blue-600',
  default: 'bg-gray-100 text-gray-600',
};

export default function BadgeTag({ label, icon: Icon, variant = 'default' }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </motion.span>
  );
}