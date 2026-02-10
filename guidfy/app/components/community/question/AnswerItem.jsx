// components/question/AnswerItem.jsx
import { motion } from 'framer-motion';
import { User, Award, Clock, MessageSquare, ChevronUp, ChevronDown, CheckCircle, Star } from 'lucide-react';
import CodeBlock from '../../ui/CodeBlock';
import CommentList from './CommentList';
import AcceptAnswer from './AcceptAnswer';

const AnswerItem = ({ 
  answer, 
  onAcceptAnswer, 
  onAddComment,
  isTopAnswer = false 
}) => {
  const parseContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```|##\s[\s\S]*?(?=\n##|\n-|\n\*\*|$))/);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const language = part.match(/```(\w+)/)?.[1] || 'javascript';
        const code = part.replace(/```[\w]*\n/, '').replace(/\n```$/, '');
        return <CodeBlock key={index} code={code} language={language} />;
      }
      
      if (part.startsWith('## ')) {
        const content = part.slice(3);
        const [title, ...rest] = content.split('\n');
        return (
          <div key={index} className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {rest.length > 0 && (
              <div className="text-gray-700 dark:text-gray-300">
                {rest.join('\n')}
              </div>
            )}
          </div>
        );
      }
      
      return <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{part}</p>;
    });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border ${answer.isAccepted
        ? 'border-green-500 dark:border-green-500'
        : isTopAnswer
        ? 'border-yellow-400 dark:border-yellow-500'
        : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Answer Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              {answer.author.badges?.includes('gold') && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Award size={8} className="text-white" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {answer.author.name}
                </h4>
                <span className="text-xs font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                  {answer.author.reputation?.toLocaleString() || '1k'} rep
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  Answered {answer.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-green-500"
                  aria-label="Upvote answer"
                >
                  <ChevronUp size={18} />
                </motion.button>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {answer.votes}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  aria-label="Downvote answer"
                >
                  <ChevronDown size={18} />
                </motion.button>
              </div>
            </div>
            
            {isTopAnswer && !answer.isAccepted && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-medium">
                <Star size={10} />
                <span>Top Answer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Content */}
      <div className="p-6">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {parseContent(answer.content)}
        </div>

        {/* Accept Answer Button (for question owner) */}
        <div className="mt-6">
          <AcceptAnswer
            isAccepted={answer.isAccepted}
            onAccept={() => onAcceptAnswer(answer.id)}
          />
        </div>

        {/* Comments */}
        <div className="mt-8">
          <CommentList
            comments={answer.comments}
            onAddComment={() => onAddComment(answer.id)}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddComment(answer.id)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            >
              <MessageSquare size={14} />
              <span>Add comment</span>
            </motion.button>
          </div>
          
          {answer.isAccepted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Accepted Answer</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnswerItem;