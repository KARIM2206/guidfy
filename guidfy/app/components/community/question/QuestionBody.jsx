// components/question/QuestionBody.jsx
import { motion } from 'framer-motion';
import CodeBlock from '../../ui/CodeBlock';
import { Check, AlertCircle, Lightbulb } from 'lucide-react';

const QuestionBody = ({ content }) => {
  // Simple markdown parser for demo purposes
  const parseContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```|\*\*[\s\S]*?\*\*|\n\*\*|\n-\s)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const language = part.match(/```(\w+)/)?.[1] || 'javascript';
        const code = part.replace(/```[\w]*\n/, '').replace(/\n```$/, '');
        return <CodeBlock key={index} code={code} language={language} />;
      }
      
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      
      if (part.startsWith('\n**')) {
        return <h3 key={index} className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">{part.slice(3)}</h3>;
      }
      
      if (part.startsWith('\n- ')) {
        return (
          <div key={index} className="flex items-start gap-2 mt-2">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{part.slice(2)}</span>
          </div>
        );
      }
      
      return <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{part}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      {parseContent(content)}
      
      {/* Additional Tips Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Lightbulb size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Tips for better answers</h4>
            <ul className="space-y-2 text-blue-700 dark:text-blue-400 text-sm">
              <li className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" />
                <span>Provide working code examples</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" />
                <span>Include performance benchmarks if available</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" />
                <span>Mention browser compatibility considerations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionBody;