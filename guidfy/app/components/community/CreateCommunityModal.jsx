'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Hash, Type, FileText, Palette } from 'lucide-react';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';

// ─── Emoji picker options ─────────────────────────
const EMOJI_OPTIONS = [
  '💻', '🛢️', '📱', '☁️', '🔐', '🤖', '🌐', '⛓️',
  '📊', '🎮', '🎨', '🚀', '⚙️', '🧪', '📡', '🔬',
  '🧠', '💡', '🔥', '⚡', '🌍', '🎯', '🛠️', '📦',
];

// ─── Color options ────────────────────────────────
const COLOR_OPTIONS = [
  { label: 'Blue',    value: 'blue',    class: 'bg-blue-500'   },
  { label: 'Violet',  value: 'violet',  class: 'bg-violet-500' },
  { label: 'Emerald', value: 'emerald', class: 'bg-emerald-500'},
  { label: 'Rose',    value: 'rose',    class: 'bg-rose-500'   },
  { label: 'Amber',   value: 'amber',   class: 'bg-amber-500'  },
  { label: 'Cyan',    value: 'cyan',    class: 'bg-cyan-500'   },
  { label: 'Orange',  value: 'orange',  class: 'bg-orange-500' },
  { label: 'Pink',    value: 'pink',    class: 'bg-pink-500'   },
];

const COLOR_GRADIENT = {
  blue:    'from-blue-500 to-blue-600',
  violet:  'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  rose:    'from-rose-500 to-rose-600',
  amber:   'from-amber-500 to-amber-600',
  cyan:    'from-cyan-500 to-cyan-600',
  orange:  'from-orange-500 to-orange-600',
  pink:    'from-pink-500 to-pink-600',
};

// ─── Field wrapper ────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <Icon size={12} />
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN MODAL
// ═══════════════════════════════════════════════════
export default function CreateCommunityModal({ isOpen, onClose }) {
  const { addCommunity } = useCommunity();

  const [form, setForm]       = useState({ name: '', description: '', icon: '💻', color: 'blue' });
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg]   = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const nameRef = useRef(null);

  // auto-focus name on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 100);
      setForm({ name: '', description: '', icon: '💻', color: 'blue' });
      setErrors({});
      setStatus('idle');
    }
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── slug preview ─────────────────────────────────
  const slugPreview = form.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // ── validation ───────────────────────────────────
  function validate() {
    const e = {};
    if (!form.name.trim())               e.name = 'Name is required';
    else if (form.name.trim().length < 3) e.name = 'At least 3 characters';
    else if (form.name.trim().length > 50) e.name = 'Max 50 characters';
    return e;
  }

  // ── submit ───────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading');
    try {
      await addCommunity({
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        icon:        form.icon,
        color:       form.color,
      });
      setStatus('success');
      setTimeout(() => { onClose(); setStatus('idle'); }, 1400);
    } catch (err) {
      setErrMsg(err.message || 'Failed to create community');
      setStatus('error');
    }
  }

  const gradient = COLOR_GRADIENT[form.color] || COLOR_GRADIENT.blue;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── Modal panel ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 20  }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Colored top strip ────────────── */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

              {/* ── Preview header ───────────────── */}
              <div className={`bg-gradient-to-br ${gradient} bg-opacity-10 px-6 pt-5 pb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
                      {form.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-base leading-tight">
                        {form.name || 'Community Name'}
                      </p>
                      {slugPreview && (
                        <p className="text-white/60 text-xs font-mono mt-0.5">
                          /{slugPreview}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Form ─────────────────────────── */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                {/* Name */}
                <Field label="Community Name" icon={Type} error={errors.name}>
                  <input
                    ref={nameRef}
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      if (errors.name) setErrors((er) => ({ ...er, name: '' }));
                    }}
                    placeholder="e.g. Frontend Development"
                    maxLength={50}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all
                      ${errors.name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                  />
                  <div className="flex justify-end">
                    <span className="text-[11px] text-gray-400">{form.name.length}/50</span>
                  </div>
                </Field>

                {/* Description */}
                <Field label="Description" icon={FileText} error={errors.description}>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What's this community about? (optional)"
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-[11px] text-gray-400">{form.description.length}/300</span>
                  </div>
                </Field>

                {/* Icon picker */}
                <Field label="Icon" icon={Hash} error={null}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmoji((v) => !v)}
                      className="w-11 h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 flex items-center justify-center text-2xl transition-all bg-gray-50 dark:bg-gray-800"
                    >
                      {form.icon}
                    </button>
                    <span className="text-xs text-gray-400">Click to change icon</span>
                  </div>

                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="grid grid-cols-8 gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1"
                      >
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, icon: emoji })); setShowEmoji(false); }}
                            className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${form.icon === emoji ? 'bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-400' : ''}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>

                {/* Color picker */}
                <Field label="Color Theme" icon={Palette} error={null}>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                        title={c.label}
                        className={`w-7 h-7 rounded-full ${c.class} transition-all ${
                          form.color === c.value
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400 scale-110'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </Field>

                {/* API error */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm"
                  >
                    <AlertCircle size={15} />
                    {errMsg}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={status === 'loading'}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${gradient} hover:opacity-90 disabled:opacity-70 shadow-sm`}
                  >
                    {status === 'loading' && <Loader2 size={15} className="animate-spin" />}
                    {status === 'success' && <CheckCircle2 size={15} />}
                    {status === 'loading' ? 'Creating...'
                      : status === 'success' ? 'Created!'
                      : 'Create Community'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}