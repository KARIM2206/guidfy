'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─── Max lines before scroll kicks in ────────────
const MAX_VISIBLE_LINES = 20;

// ─── Language → dot color ─────────────────────────
const LANG_COLOR = {
  javascript: '#f7df1e', typescript: '#3178c6', jsx: '#61dafb', tsx: '#3178c6',
  python: '#3776ab', java: '#b07219', rust: '#dea584', go: '#00add8',
  css: '#563d7c', html: '#e34c26', sql: '#336791', bash: '#4eaa25',
  json: '#8bc34a', default: '#6b7280',
};

function getLangColor(lang) {
  return LANG_COLOR[lang?.toLowerCase()] ?? LANG_COLOR.default;
}

const CodeBlock = ({ code = '', language = 'javascript' }) => {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lines       = code.split('\n');
  const totalLines  = lines.length;
  const bytes       = new Blob([code]).size;
  const isLong      = totalLines > MAX_VISIBLE_LINES;
  const dotColor    = getLangColor(language);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-800/80 dark:border-gray-700 shadow-lg my-3 bg-[#0d1117]"
    >
      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-gray-800/80">
        <div className="flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>

          {/* Language badge */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-700">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-xs font-mono font-medium text-gray-300 tracking-wide">
              {language}
            </span>
          </div>
        </div>

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700 border border-gray-700'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-1.5">
                <Check size={11} /> Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-1.5">
                <Copy size={11} /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Code area ───────────────────────────── */}
      <div
        className={`relative transition-all duration-300 ${
          isLong && !expanded ? 'max-h-[400px] overflow-y-auto' : ''
        }`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #0d1117' }}
      >
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '13px',
            lineHeight: '1.6',
            background: 'transparent',
            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          }}
          showLineNumbers
          lineNumberStyle={{
            color: '#3d4451',
            minWidth: '2.8em',
            paddingRight: '1.2em',
            userSelect: 'none',
            fontSize: '11px',
          }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-gray-800/80">
        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
          <span>{totalLines} {totalLines === 1 ? 'line' : 'lines'}</span>
          <span className="text-gray-700">·</span>
          <span>{bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}</span>
        </div>

        {/* Expand / collapse — بس لو الكود طويل */}
        {isLong && (
          <motion.button
            onClick={() => setExpanded((v) => !v)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? (
              <><ChevronUp size={12} /> Collapse</>
            ) : (
              <><ChevronDown size={12} /> Show all {totalLines} lines</>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default CodeBlock;