// components/profile/UserQuestions.jsx
import { motion } from 'framer-motion';
import { MessageSquare, Eye, CheckCircle, Clock, ChevronUp, ChevronDown } from 'lucide-react';

const UserQuestions = ({ username }) => {
  const questions = [
    {
      id: 1,
      title: 'How to optimize React re-renders with useMemo and useCallback?',
      tags: ['react', 'performance', 'hooks'],
      votes: 124,
      answers: 8,
      views: 2450,
      isAnswered: true,
      createdAt: '2 days ago'
    },
    {
      id: 2,
      title: 'Best practices for TypeScript generics in React components?',
      tags: ['typescript', 'react', 'generics'],
      votes: 67,
      answers: 5,
      views: 1200,
      isAnswered: true,
      createdAt: '1 week ago'
    },
    {
      id: 3,
      title: 'Implementing real-time features with Next.js and WebSockets',
      tags: ['nextjs', 'websockets', 'real-time'],
      votes: 89,
      answers: 3,
      views: 1800,
      isAnswered: false,
      createdAt: '3 weeks ago'
    }
  ];

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <motion.article
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex gap-4">
            {/* Votes */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <button className="p-1 text-gray-400 hover:text-green-500">
                  <ChevronUp size={20} />
                </button>
                <span className="text-lg font-bold text-gray-900 dark:text-white my-1">
                  {question.votes}
                </span>
                <button className="p-1 text-gray-400 hover:text-red-500">
                  <ChevronDown size={20} />
                </button>
              </div>
              
              {question.isAnswered && (
                <div className="mt-2 p-1 bg-green-100 dark:bg-green-900/30 rounded">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Meta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {question.createdAt}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {question.title}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare size={14} />
                  <span className="text-sm">{question.answers} answers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Eye size={14} />
                  <span className="text-sm">{question.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default UserQuestions;