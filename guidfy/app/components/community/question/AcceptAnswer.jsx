// components/question/AcceptAnswer.jsx
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const AcceptAnswer = ({ isAccepted, onAccept }) => {
  if (isAccepted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
        <CheckCircle size={16} />
        <span className="font-medium">Accepted Answer</span>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAccept}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
      aria-label="Mark as accepted answer"
    >
      <CheckCircle size={16} />
      <span>Mark as Accepted</span>
    </motion.button>
  );
};

export default AcceptAnswer;