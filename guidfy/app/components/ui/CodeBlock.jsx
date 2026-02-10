// components/ui/CodeBlock.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 my-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {language}
          </span>
        </div>
        
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 bg-white dark:bg-gray-700 rounded transition-colors"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Code */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '14px',
            background: 'transparent'
          }}
          showLineNumbers
          lineNumberStyle={{
            color: '#6B7280',
            minWidth: '3em',
            paddingRight: '1em',
            userSelect: 'none'
          }}
        >
          {code}
        </SyntaxHighlighter>
        
        {/* Line highlight overlay */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="h-full w-1 bg-blue-500/20 ml-12" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        {code.split('\n').length} lines • {new Blob([code]).size} bytes
      </div>
    </motion.div>
  );
};

export default CodeBlock;