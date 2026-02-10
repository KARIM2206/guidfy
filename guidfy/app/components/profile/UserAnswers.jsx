// components/profile/UserAnswers.jsx
import { motion } from 'framer-motion';
import { CheckCircle, ChevronUp, Clock, Eye, MessageSquare,ChevronDown } from 'lucide-react';

const UserAnswers = ({ username }) => {
  const answers = [
    {
      id: 1,
      question: 'How to optimize React re-renders with useMemo and useCallback?',
      excerpt: 'Use useMemo for expensive calculations and useCallback for functions passed as props. The key is to understand when React re-renders...',
      votes: 89,
      comments: 12,
      views: 3400,
      isAccepted: true,
      answered: '1 day ago'
    },
    {
      id: 2,
      question: 'Best practices for TypeScript with Next.js API routes?',
      excerpt: 'Always type your request and response objects. Use Zod for runtime validation and create reusable types for common patterns...',
      votes: 45,
      comments: 5,
      views: 2100,
      isAccepted: false,
      answered: '3 days ago'
    },
    {
      id: 3,
      question: 'Implementing authentication in Next.js 14 with middleware?',
      excerpt: 'The new middleware approach in Next.js 14 simplifies authentication. Here\'s a complete example with JWT tokens and protected routes...',
      votes: 67,
      comments: 8,
      views: 2900,
      isAccepted: true,
      answered: '1 week ago'
    }
  ];

  return (
    <div className="space-y-4">
      {answers.map((answer, index) => (
        <motion.article
          key={answer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex gap-4">
            {/* Votes & Acceptance */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <button className="p-1 text-gray-400 hover:text-green-500">
                  <ChevronUp size={20} />
                </button>
                <span className="text-lg font-bold text-gray-900 dark:text-white my-1">
                  {answer.votes}
                </span>
                <button className="p-1 text-gray-400 hover:text-red-500">
                  <ChevronDown size={20} />
                </button>
              </div>
              
              {answer.isAccepted && (
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Question Title */}
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Answered on:
              </h4>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {answer.question}
              </h3>

              {/* Answer Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {answer.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {answer.answered}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MessageSquare size={12} />
                    {answer.comments} comments
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Eye size={12} />
                    {answer.views.toLocaleString()} views
                  </span>
                </div>
                
                {answer.isAccepted && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg">
                    Accepted
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default UserAnswers;