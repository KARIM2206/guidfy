// components/question/PreviewPanel.jsx
import { motion } from 'framer-motion';
import { User, Calendar, Eye, Tag, Code2 } from 'lucide-react';
import CodeBlock from '../../ui/CodeBlock';

const PreviewPanel = ({ title, description, tags, code, language }) => {
  const parseMarkdown = (text) => {
    if (!text) return <p className="text-gray-500 dark:text-gray-400 italic">No description provided</p>;
    
    const parts = text.split(/(```[\s\S]*?```|\*\*[\s\S]*?\*\*|\n\*\*|\n-\s)/);    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const language = part.match(/```(\w+)/)?.[1] || 'javascript';
        const codeContent = part.replace(/```[\w]*\n/, '').replace(/\n```$/, '');
        return <CodeBlock key={index} code={codeContent} language={language} />;
      }
      
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      
      if (part.startsWith('*') && part.endsWith('*') && !part.includes('\n')) {
        return <em key={index} className="italic text-gray-800 dark:text-gray-200">{part.slice(1, -1)}</em>;
      }
      
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      
      if (part.startsWith('# ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{part.slice(2)}</h2>;
      }
      
      if (part.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mt-3 mb-2">{part.slice(3)}</h3>;
      }
      
      if (part.startsWith('\n- ')) {
        return (
          <div key={index} className="flex items-start gap-2 mt-1 ml-4">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{part.slice(2)}</span>
          </div>
        );
      }
      
      if (part.startsWith('\n>')) {
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 my-2 text-gray-600 dark:text-gray-400 italic">
            {part.slice(2)}
          </blockquote>
        );
      }
      
      if (part.startsWith('\n') && part.match(/^\n\d+\./)) {
        const match = part.match(/^\n(\d+)\.\s(.*)/);
        return (
          <div key={index} className="flex items-start gap-2 mt-1 ml-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{match[1]}.</span>
            <span className="text-gray-700 dark:text-gray-300">{match[2]}</span>
          </div>
        );
      }
      
      return <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{part}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Preview Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preview
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={14} />
            <span>Just now</span>
          </div>
        </div>
      </div>

      {/* Question Preview */}
      <div className="p-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title || <span className="text-gray-400 italic">Your question title will appear here</span>}
        </h1>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                Your Name
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                0 rep
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Asking now
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
          {parseMarkdown(description)}
        </div>

        {/* Code Block Preview */}
        {code && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Code Snippet
              </span>
            </div>
            <CodeBlock code={code} language={language} />
          </div>
        )}

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No tags added
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Votes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Answers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewPanel;