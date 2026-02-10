import { motion } from "framer-motion";

export default function RoadmapGrid({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {children}
    </motion.div>
  );
}
