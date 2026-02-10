// components/question/AnswerForm.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Code, Image, Bold, Italic } from 'lucide-react';
import CodeBlock from '../../ui/CodeBlock';

const AnswerForm = ({ onSubmit, onCancel }) => {
  const [answer, setAnswer] = useState('');
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  const insertText = (text) => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = answer.substring(0, start) + text + answer.substring(end);
    setAnswer(newText);
    
    // Focus back on textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Your Answer
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium transition-colors"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            aria-label="Cancel"
          >
            <X size={20} />
          </motion.button>
        </div>
      </div>

      {preview ? (
        <div className="prose prose-lg dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {answer || <p className="text-gray-500 dark:text-gray-400 italic">Nothing to preview</p>}
        </div>
      ) : (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <motion.button
              type="button"
              onClick={() => insertText('**bold text**')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Bold"
            >
              <Bold size={16} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => insertText('*italic text*')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Italic"
            >
              <Italic size={16} />
            </motion.button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <motion.button
              type="button"
              onClick={() => insertText('```js\n// your code here\n```')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Insert code"
            >
              <Code size={16} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here. Use Markdown for formatting, and include code examples when relevant..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={10}
              autoFocus
            />

            {/* Code Example Preview */}
            {answer.includes('```') && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Code Preview
                </h4>
                <CodeBlock
                  code={answer.match(/```[\w]*\n([\s\S]*?)\n```/)?.[1] || ''}
                  language={answer.match(/```(\w+)/)?.[1] || 'javascript'}
                />
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="mb-1">• Be specific and provide code examples</p>
                  <p>• Explain why your solution works</p>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={!answer.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${answer.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                  <span>Post Answer</span>
                </motion.button>
              </div>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
};

export default AnswerForm;