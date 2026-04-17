'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, CheckCircle2, AlertCircle,
  MessageSquare, FileText, ChevronRight,
  Eye, Edit3, Code, Plus, Trash2, GripVertical,
} from 'lucide-react';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import CodeBlock from '@/app/components/ui/CodeBlock';

// ─── Config ───────────────────────────────────────
const LANGUAGES = [
  'javascript','typescript','jsx','tsx',
  'python','java','csharp','cpp','c',
  'go','rust','php','ruby','swift',
  'css','html','sql','bash','json',
];

const TABS = [
  { key: 'question', label: 'Question', icon: MessageSquare, gradient: 'from-blue-500 to-cyan-500',     focusBorder: 'focus:border-blue-500',   ring: 'focus:ring-blue-500/20'   },
  { key: 'post',     label: 'Post',     icon: FileText,      gradient: 'from-violet-500 to-purple-600', focusBorder: 'focus:border-violet-500', ring: 'focus:ring-violet-500/20' },
];

function uid() { return Math.random().toString(36).slice(2, 8); }

// ─── Tag badge ────────────────────────────────────
function TagBadge({ tag, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
      #{tag}
      {onRemove && <button onClick={() => onRemove(tag)} className="hover:text-rose-500 transition-colors ml-0.5">×</button>}
    </span>
  );
}

function Counter({ value, max }) {
  const pct   = value / max;
  const color = pct >= 1 ? 'text-rose-500' : pct >= 0.8 ? 'text-amber-500' : 'text-gray-400';
  return <span className={`text-[11px] tabular-nums ${color}`}>{value}/{max}</span>;
}

// ─── Text block ───────────────────────────────────
function TextBlock({ block, onChange, onDelete, onAddCode, isOnly, focusBorder, ring }) {
  return (
    <div className="group relative">
      <textarea
        value={block.content}
        onChange={(e) => onChange(block.id, { content: e.target.value })}
        placeholder="Write your content here..."
        rows={4}
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${ring} ${focusBorder} transition-all resize-none leading-relaxed`}
      />
      {/* Hover actions */}
      <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onAddCode(block.id)}
          title="Add code block below"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-mono hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          <Code size={11} /> &lt;/&gt;
        </button>
        {!isOnly && (
          <button onClick={() => onDelete(block.id)} className="p-1 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:bg-rose-100 transition-colors">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Code block editor ────────────────────────────
function CodeBlockEditor({ block, onChange, onDelete }) {
  const [editing, setEditing] = useState(true); // يبدأ في Edit mode دايماً

  const handleSave = () => {
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Code size={13} className="text-gray-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Code Block</span>

        <select
          value={block.language}
          onChange={(e) => onChange(block.id, { language: e.target.value })}
          className="ml-2 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
        >
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setEditing((v) => !v)}
            disabled={!block.code?.trim()} // مينفعش preview لو مفيش كود
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 transition-colors disabled:opacity-40"
          >
            {editing ? <><Eye size={11} /> Preview</> : <><Edit3 size={11} /> Edit</>}
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {editing ? (
        <>
          <textarea
            value={block.code || ''}
            onChange={(e) => onChange(block.id, { code: e.target.value })}  // ← يحفظ في `code` مش `content`
            placeholder={`// Write your ${block.language} code here...`}
            rows={8}
            spellCheck={false}
            autoFocus
            className="w-full px-4 py-3 bg-gray-950 text-green-400 text-sm font-mono focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex justify-end px-4 py-2 bg-gray-950 border-t border-gray-800">
            <button
              onClick={handleSave}
              disabled={!block.code?.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </>
      ) : (
        /* Preview mode — CodeBlock الحقيقي */
        <CodeBlock code={block.code || ''} language={block.language} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════
export default function CreateModal({
  isOpen, onClose, communityId, communityName = 'Community', defaultType = 'question', onSuccess,
}) {
  const { addQuestion, addPost } = useCommunity();

  const [activeType, setActiveType] = useState(defaultType);
  const [title,      setTitle]      = useState('');
  // ← يبدأ بـ code block بس، TextBlock يتضاف يدوياً
  const [blocks,     setBlocks]     = useState([{ id: uid(), type: 'code', code: '', language: 'javascript' }]);
  const [tagInput,   setTagInput]   = useState('');
  const [tags,       setTags]       = useState([]);
  const [preview,    setPreview]    = useState(false);
  const [status,     setStatus]     = useState('idle');
  const [errors,     setErrors]     = useState({});
  const [errMsg,     setErrMsg]     = useState('');

  const titleRef  = useRef(null);
  const activeTab = TABS.find((t) => t.key === activeType);

  const reset = () => {
    setTitle('');
    setBlocks([{ id: uid(), type: 'code', code: '', language: 'javascript' }]);
    setTags([]); setTagInput(''); setStatus('idle');
    setErrors({}); setErrMsg(''); setPreview(false);
  };

  useEffect(() => { if (isOpen) { reset(); setTimeout(() => titleRef.current?.focus(), 80); } }, [isOpen]);
  useEffect(() => { reset(); }, [activeType]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // ── Block ops ─────────────────────────────────
  const updateBlock = (id, patch) =>
    setBlocks((p) => p.map((b) => b.id === id ? { ...b, ...patch } : b));

  const deleteBlock = (id) =>
    setBlocks((p) => p.filter((b) => b.id !== id));

  // إضافة code block بعد text block معين
  const addCodeAfter = (afterId) =>
    setBlocks((p) => {
      const idx  = p.findIndex((b) => b.id === afterId);
      const next = [...p];
      next.splice(idx + 1, 0, { id: uid(), type: 'code', code: '', language: 'javascript' });
      return next;
    });

  // إضافة text block في الآخر
  const addTextBlock = () =>
    setBlocks((p) => [...p, { id: uid(), type: 'text', content: '' }]);

  // ── Tags ──────────────────────────────────────
  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean || tags.includes(clean) || tags.length >= 5) { setTagInput(''); return; }
    setTags((p) => [...p, clean]); setTagInput('');
  };
  const removeTag = (tag) => setTags((p) => p.filter((t) => t !== tag));
  const onTagKey  = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1]);
  };

  // ── Build body ────────────────────────────────
  // code block → ```lang\nكود\n```
  // text block → النص العادي
  const buildBody = () =>
    blocks
      .map((b) => {
        if (b.type === 'code' && b.code?.trim()) {
          return `\`\`\`${b.language}\n${b.code.trim()}\n\`\`\``;
        }
        if (b.type === 'text' && b.content?.trim()) {
          return b.content.trim();
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

  // ── Validate ──────────────────────────────────
  const validate = () => {
    const e = {};
    if (!title.trim())           e.title = 'Title is required';
    else if (title.length < 5)   e.title = 'At least 5 characters';
    else if (title.length > 150) e.title = 'Max 150 characters';
    const body = buildBody();
    if (!body || body.length < 5) e.body = 'Content is required';
    return e;
  };

  // ── Submit ────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const payload = { title: title.trim(), body: buildBody(), tags };
      if (activeType === 'question') await addQuestion(communityId, payload);
      else                           await addPost(communityId, payload);
      setStatus('success');
      setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
    } catch (err) {
      setErrMsg(err.message || 'Something went wrong.'); setStatus('error');
    }
  };

  // ── Preview renderer ──────────────────────────
  const renderPreview = () => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-200 dark:border-gray-700">
        Preview
      </div>
      <div className="p-5 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title || <span className="text-gray-400 italic font-normal">No title yet...</span>}
        </h2>
        {blocks.map((b) =>
          b.type === 'text' && b.content?.trim()
            ? <p key={b.id} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{b.content}</p>
            : b.type === 'code' && b.code?.trim()
            ? <CodeBlock key={b.id} code={b.code} language={b.language} />
            : null
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            {tags.map((t) => <TagBadge key={t} tag={t} />)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-1 bg-gradient-to-r ${activeTab.gradient} rounded-t-2xl flex-shrink-0`} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-4 pb-3 flex-shrink-0">
                <p className="text-xs text-gray-400">
                  Posting to <span className="font-semibold text-gray-700 dark:text-gray-300">{communityName}</span>
                </p>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 px-6 pb-4 flex-shrink-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon; const isActive = activeType === tab.key;
                  return (
                    <button key={tab.key} onClick={() => setActiveType(tab.key)}
                      disabled={status === 'loading' || status === 'success'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isActive ? `bg-gradient-to-r ${tab.gradient} text-white border-transparent shadow-md` : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <Icon size={15} />{tab.label}
                    </button>
                  );
                })}
                <button onClick={() => setPreview((v) => !v)}
                  className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${preview ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  {preview ? <><Edit3 size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4">
                {preview ? renderPreview() : (
                  <>
                    {/* Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Title <span className="text-rose-400">*</span>
                        </label>
                        <Counter value={title.length} max={150} />
                      </div>
                      <input
                        ref={titleRef}
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setErrors((er) => ({ ...er, title: '' })); }}
                        placeholder={activeType === 'question' ? 'What do you want to ask?' : 'Give your post a clear title'}
                        maxLength={150}
                        className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : `border-gray-200 dark:border-gray-700 ${activeTab.focusBorder} ${activeTab.ring}`}`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.title}
                        </p>
                      )}
                    </div>

                    {/* Blocks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Content <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[11px] text-gray-400">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
                      </div>

                      <div className="space-y-3">
                        {blocks.map((block) => (
                          <div key={block.id} className="relative">
                            {block.type === 'text' ? (
                              <TextBlock
                                block={block}
                                onChange={updateBlock}
                                onDelete={deleteBlock}
                                onAddCode={addCodeAfter}
                                isOnly={blocks.length === 1}
                                focusBorder={activeTab.focusBorder}
                                ring={activeTab.ring}
                              />
                            ) : (
                              <CodeBlockEditor
                                block={block}
                                onChange={updateBlock}
                                onDelete={deleteBlock}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add text block button */}
                      <button
                        onClick={addTextBlock}
                        className="mt-3 w-full py-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-500 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} /> Add text block
                      </button>

                      {errors.body && (
                        <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.body}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Tags <span className="text-gray-400 normal-case font-normal">(max 5)</span>
                        </label>
                        <span className="text-[11px] text-gray-400">{tags.length}/5</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[46px] focus-within:border-gray-400 transition-colors">
                        {tags.map((t) => <TagBadge key={t} tag={t} onRemove={removeTag} />)}
                        {tags.length < 5 && (
                          <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={onTagKey}
                            onBlur={addTag}
                            placeholder={tags.length === 0 ? 'react, typescript, hooks...' : 'Add tag...'}
                            className="flex-1 min-w-[100px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-mono"
                          />
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono text-[10px]">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono text-[10px]">,</kbd> to add
                      </p>
                    </div>
                  </>
                )}

                <AnimatePresence>
                  {status === 'error' && errMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />{errMsg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                <button onClick={onClose} disabled={status === 'loading'}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={status === 'loading' || status === 'success'}
                  className={`flex-1 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${activeTab.gradient} hover:opacity-90 disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-sm`}>
                  {status === 'loading' && <Loader2 size={15} className="animate-spin" />}
                  {status === 'success' && <CheckCircle2 size={15} />}
                  <span>{status === 'loading' ? 'Posting...' : status === 'success' ? 'Posted!' : activeType === 'question' ? 'Post Question' : 'Publish Post'}</span>
                  {status === 'idle' && <ChevronRight size={15} />}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}