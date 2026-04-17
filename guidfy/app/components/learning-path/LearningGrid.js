'use client';

import { motion } from 'framer-motion';
import LearningCard from './LearningCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LearningGrid({ paths=[] }) {
  
  if (!paths.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No learning paths match your criteria.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {paths.map((path) => (
        <LearningCard key={path.id} path={path} />
      ))}
    </motion.div>
  );
}