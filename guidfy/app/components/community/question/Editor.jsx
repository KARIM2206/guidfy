// components/question/Editor.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Bold, 
  Italic, 
  List, 
  Link, 
  Image, 
  Quote,
  Eye,
  Type
} from 'lucide-react';

import CodeBlock from '../../ui/CodeBlock';

const Editor = ({ 
  content, 
  code, 
  language, 
  onContentChange, 
  onCodeChange,
  onLanguageChange 
}) => {
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const formattingOptions = [
    { icon: Bold, action: 'bold', label: 'Bold' },
    { icon: Italic, action: 'italic', label: 'Italic' },
    { icon: List, action: 'list', label: 'List' },
    { icon: Link, action: 'link', label: 'Link' },
    { icon: Image, action: 'image', label: 'Image' },
    { icon: Quote, action: 'quote', label: 'Quote' },
    { icon: Code2, action: 'code', label: 'Code', isActive: showCodeEditor }
  ];

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash' }
  ];

  const insertFormatting = (type) => {
    const textarea = document.querySelector('#description-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'list item'}\n- another item`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](https://example.com)`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'image':
        formattedText = `![alt text](https://example.com/image.png)`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'quote text'}`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'code':
        formattedText = `\`\`\`${language}\n${selectedText || '// your code here'}\n\`\`\``;
        cursorOffset = selectedText ? 0 : language.length + 4;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    onContentChange(newContent);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length - (selectedText ? 0 : cursorOffset);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        {formattingOptions.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.label}
              type="button"
              onClick={() => {
                if (option.action === 'code') {
                  setShowCodeEditor(!showCodeEditor);
                } else {
                  insertFormatting(option.action);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded transition-colors ${option.isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              aria-label={option.label}
            >
              <Icon size={18} />
            </motion.button>
          );
        })}
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <div className="flex items-center gap-2">
          <Type size={16} className="text-gray-500 dark:text-gray-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Question Details (Markdown supported)
        </label>
        
        <textarea
          id="description-editor"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Describe your problem in detail. Use Markdown for formatting..."
          className="w-full h-96 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none font-mono text-sm"
        />
      </div>

      {/* Code Editor Toggle */}
      <motion.button
        initial={false}
        animate={{ rotate: showCodeEditor ? 180 : 0 }}
        onClick={() => setShowCodeEditor(!showCodeEditor)}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium"
      >
        <Code2 size={16} />
        <span>{showCodeEditor ? 'Hide Code Editor' : 'Add Code Snippet'}</span>
        <Eye size={14} />
      </motion.button>

      {/* Code Editor */}
      <AnimatePresence>
        {showCodeEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Code Snippet
              </label>
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder={`// Add your ${language} code here...`}
                className="w-full h-48 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none font-mono text-sm"
              />
            </div>
            
            {/* Live Preview */}
            {code && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Code Preview
                </h4>
                <CodeBlock code={code} language={language} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Markdown Guide */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Markdown Quick Reference
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <code className="text-gray-700 dark:text-gray-300">**bold**</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Bold text</span>
          </div>
          <div>
            <code className="text-gray-700 dark:text-gray-300">*italic*</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Italic text</span>
          </div>
          <div>
            <code className="text-gray-700 dark:text-gray-300"># Heading</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Large heading</span>
          </div>
          <div>
            <code className="text-gray-700 dark:text-gray-300">- Item</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Bullet list</span>
          </div>
          <div>
            <code className="text-gray-700 dark:text-gray-300">[text](url)</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Link</span>
          </div>
          <div>
            <code className="text-gray-700 dark:text-gray-300">```code```</code>
            <span className="text-gray-600 dark:text-gray-400 ml-2">→ Code block</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;