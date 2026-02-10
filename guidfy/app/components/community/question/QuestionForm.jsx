// components/question/QuestionForm.jsx
import { motion } from 'framer-motion';
import { HelpCircle, AlertCircle, Check } from 'lucide-react';

const QuestionForm = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange, 
  error 
}) => {
  const titleLength = title.length;
  const descriptionLength = description.length;
  
  const isTitleValid = titleLength >= 15 && titleLength <= 150;
  const isDescriptionValid = descriptionLength >= 30;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Question Title
          </label>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {titleLength}/150
            </div>
            {isTitleValid ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
          </div>
        </div>
        
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Be specific and imagine you're asking another person..."
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          maxLength={150}
        />
        
        {error?.title && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error.title}
          </motion.p>
        )}
        
        {/* Title Tips */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle size={14} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-400">
              <p className="font-medium mb-1">Writing a good title</p>
              <ul className="space-y-1">
                <li>• Summarize your problem in one sentence</li>
                <li>• Include key technologies (React, Node.js, etc.)</li>
                <li>• Mention what you're trying to achieve</li>
                <li>• Example: "How to optimize React re-renders with useMemo?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Detailed Description
          </label>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {descriptionLength}/5000
            </div>
            {isDescriptionValid ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
          </div>
        </div>
        
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what you're trying to do, what you've tried, and where you're stuck..."
          className="w-full h-64 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          maxLength={5000}
        />
        
        {error?.description && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error.description}
          </motion.p>
        )}
        
        {/* Description Tips */}
        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle size={14} className="text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-700 dark:text-purple-400">
              <p className="font-medium mb-1">Writing a good description</p>
              <ul className="space-y-1">
                <li>• Explain what you're trying to accomplish</li>
                <li>• Show what you've tried with code examples</li>
                <li>• Describe expected vs actual results</li>
                <li>• Include error messages if applicable</li>
                <li>• Mention your environment (browser, Node version, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;