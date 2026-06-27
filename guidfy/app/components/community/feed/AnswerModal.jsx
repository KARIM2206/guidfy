'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Edit3, Code, Trash2, GripVertical, CheckCircle2
} from 'lucide-react';
import { useAddAnswer } from '@/app/hooks/useCommunityQuery';
import CodeBlock from '@/app/components/ui/CodeBlock';

const LANGUAGES = [
  'javascript','typescript','jsx','tsx',
  'python','java','csharp','cpp','c',
  'go','rust','php','ruby','swift',
  'css','html','sql','bash','json',
];

function uid() { return Math.random().toString(36).slice(2, 8); }

function TextBlock({ block, onChange, onDelete, isOnly }) {
  return (
    <div className="group relative">
      <textarea
        value={block.content}
        onChange={(e) => onChange(block.id, { content: e.target.value })}
        placeholder="Type your answer here..."
        className="w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[60px]"
        rows={Math.max(2, block.content.split('\n').length)}
      />
      {!isOnly && (
        <button
          onClick={() => onDelete(block.id)}
          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
          title="Delete block"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function CodeBlockEditor({ block, onChange, onDelete }) {
  const [showLangs, setShowLangs] = useState(false);

  return (
    <div className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 my-4">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-gray-400 cursor-grab active:cursor-grabbing" />
          <div className="relative">
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="text-xs font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {block.language || 'select lang'}
            </button>
            {showLangs && (
              <div className="absolute top-full left-0 mt-1 w-32 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 py-1 scrollbar-thin">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => { onChange(block.id, { language: lang }); setShowLangs(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-blue-50 dark:hover:bg-blue-900/20 ${block.language === lang ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(block.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-3">
        <textarea
          value={block.content}
          onChange={(e) => onChange(block.id, { content: e.target.value })}
          placeholder="// Paste or type your code here..."
          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-mono text-gray-800 dark:text-gray-200 min-h-[100px] resize-none"
          spellCheck={false}
          rows={Math.max(4, block.content.split('\n').length)}
        />
      </div>
    </div>
  );
}

export default function AnswerModal({ isOpen, onClose, questionId, communityId }) {
  const [blocks, setBlocks] = useState([{ id: uid(), type: 'text', content: '' }]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const addAnswerMutation = useAddAnswer();

  const handleAddBlock = (type) => {
    setBlocks([...blocks, { id: uid(), type, content: '', language: type === 'code' ? 'javascript' : undefined }]);
  };

  const handleUpdateBlock = (id, data) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleDeleteBlock = (id) => {
    if (blocks.length === 1) {
      setBlocks([{ id: uid(), type: 'text', content: '' }]);
      return;
    }
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSubmit = () => {
    setError('');

    const formattedBody = blocks.map(b => {
      if (b.type === 'code') {
        return `\`\`\`${b.language}\n${b.content}\n\`\`\``;
      }
      return b.content;
    }).join('\n\n').trim();

    if (!formattedBody) {
      setError('Please provide an answer.');
      return;
    }

    addAnswerMutation.mutate(
      { communityId, questionId, data: { body: formattedBody } },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setBlocks([{ id: uid(), type: 'text', content: '' }]);
            onClose();
          }, 1500);
        },
        onError: (err) => {
          setError(err.response?.data?.message || 'Failed to post answer.');
        }
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Write an Answer
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
              <div className="space-y-4">
                {blocks.map((block) => (
                  block.type === 'text' ? (
                    <TextBlock
                      key={block.id}
                      block={block}
                      onChange={handleUpdateBlock}
                      onDelete={handleDeleteBlock}
                      isOnly={blocks.length === 1}
                    />
                  ) : (
                    <CodeBlockEditor
                      key={block.id}
                      block={block}
                      onChange={handleUpdateBlock}
                      onDelete={handleDeleteBlock}
                    />
                  )
                ))}
              </div>

              {/* Block Controls */}
              <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleAddBlock('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit3 size={14} /> Add Text
                </button>
                <button
                  onClick={() => handleAddBlock('code')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <Code size={14} /> Add Code
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-none px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-sm text-red-500 font-medium">
                  {error}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={addAnswerMutation.isPending || isSuccess}
                    className="relative flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSuccess ? (
                      <><CheckCircle2 size={16} /> Posted!</>
                    ) : addAnswerMutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Posting...</>
                    ) : (
                      'Post Answer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
