// components/question/AnswerList.jsx
import { motion, AnimatePresence } from 'framer-motion';
import AnswerItem from './AnswerItem';

const AnswerList = ({ answers = [], onAcceptAnswer, onAddComment }) => {
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    return b.votes - a.votes;
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {sortedAnswers.map((answer, index) => (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnswerItem
              answer={answer}
              onAcceptAnswer={onAcceptAnswer}
              onAddComment={onAddComment}
              isTopAnswer={index === 0 && answer.votes > 0}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {answers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No answers yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to answer this question and help the community!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AnswerList;