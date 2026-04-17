// components/profile/EditProfileModal.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, FileText, Briefcase, Camera, Check, Loader2, AlertCircle
} from 'lucide-react';

/* ─── Field config – only fields supported by backend ───────── */
const FIELDS = [
  { key: 'name',  label: 'Display Name', icon: User,      type: 'text',     placeholder: 'Your full name' },
  { key: 'title', label: 'Job Title',    icon: Briefcase, type: 'text',     placeholder: 'e.g. Senior Frontend Engineer' },
  { key: 'bio',   label: 'Bio',          icon: FileText,  type: 'textarea', placeholder: 'Tell the world a bit about yourself…' },
];

/* ─── Backdrop variants ─────────────────────────────────────── */
const backdropV = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25 } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
};
const modalV = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.22 } },
};

/* ─── Avatar Preview (unchanged – uses separate uploadAvatar) ── */
function AvatarUploader({ current, name, onChange }) {
  const [preview, setPreview] = useState(null);
  const [hover, setHover]     = useState(false);
  const inputRef              = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const src = preview || (current ? `http://localhost:8000${current}` : null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-24 h-24 cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => inputRef.current?.click()}
      >
        {/* Ring */}
        <div className="absolute inset-0 rounded-2xl p-[2.5px]"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1,#0ea5e9)' }}>
          <div className="w-full h-full rounded-[13px] overflow-hidden"
            style={{ background: '#040810' }}>
            {src ? (
              <img src={src} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-400"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <motion.div
          animate={{ opacity: hover ? 1 : 0 }}
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <Camera size={18} className="text-white" />
          <span className="text-white text-[10px] font-medium">Change</span>
        </motion.div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <p className="text-white/35 text-[11px]">Click to change avatar · Max 5MB</p>
    </div>
  );
}

/* ─── Single Field ──────────────────────────────────────────── */
function Field({ fieldKey, label, icon: Icon, type, placeholder, value, onChange, error }) {
  const baseInput = `
    w-full bg-transparent text-white/85 text-sm placeholder-white/25
    border border-white/10 rounded-xl px-4 outline-none
    transition-all duration-200
    focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
    hover:border-white/20
    ${error ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : ''}
  `;

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider">
        <Icon size={11} className="text-blue-500/70" />
        {label}
      </label>

      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className={`${baseInput} py-3 resize-none`}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className={`${baseInput} h-11 pl-4`}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        />
      )}

      {error && (
        <p className="flex items-center gap-1 text-red-400 text-[11px]">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main Modal ────────────────────────────────────────────── */
export default function EditProfileModal({ isOpen, onClose, userData, updateProfile, uploadAvatar, isSaving }) {
  const [form, setForm]         = useState({});
  const [errors, setErrors]     = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveState, setSaveState]   = useState('idle'); // idle | saving | success | error
  const [globalError, setGlobalError] = useState('');

  /* Seed form from userData */
  useEffect(() => {
    if (userData && isOpen) {
      setForm({
        name:  userData.name  ?? '',
        title: userData.title ?? '',
        bio:   userData.bio   ?? '',
      });
      setErrors({});
      setAvatarFile(null);
      setSaveState('idle');
      setGlobalError('');
    }
  }, [userData, isOpen]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  /* Validation – only name is required */
  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Name is required';
    return errs;
  };

  /* Submit */
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaveState('saving');
    setGlobalError('');

    try {
      // Upload avatar first if changed
      if (avatarFile) {
        const avatarRes = await uploadAvatar(avatarFile);
        if (!avatarRes.success) throw new Error(avatarRes.error);
      }

      // Update profile fields (only name, title, bio)
      const res = await updateProfile(form);
      if (!res.success) throw new Error(res.error);

      setSaveState('success');
      setTimeout(() => { setSaveState('idle'); onClose(); }, 900);
    } catch (err) {
      setSaveState('error');
      setGlobalError(err.message || 'Something went wrong. Please try again.');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
            .epm-scroll::-webkit-scrollbar { width: 4px; }
            .epm-scroll::-webkit-scrollbar-track { background: transparent; }
            .epm-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.25); border-radius: 99px; }
            .epm-scroll::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.45); }
          `}</style>

          {/* Backdrop */}
          <motion.div
            key="epm-backdrop"
            variants={backdropV}
            initial="hidden" animate="show" exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            {/* Modal */}
            <motion.div
              key="epm-modal"
              variants={modalV}
              initial="hidden" animate="show" exit="exit"
              className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(6,10,24,0.97)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)',
              }}
            >
              {/* Top accent line */}
              <div className="h-[2px] w-full flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #0ea5e9)' }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Edit Profile
                  </h2>
                  <p className="text-white/35 text-xs mt-0.5">Update your public profile information</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white/80 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="epm-scroll flex-1 overflow-y-auto px-6 py-6 space-y-5">

                {/* Avatar uploader */}
                <AvatarUploader
                  current={userData?.avatar}
                  name={form.name}
                  onChange={setAvatarFile}
                />

                {/* Divider */}
                <div className="h-px w-full"
                  style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.2), transparent)' }} />

                {/* Fields – only name, title, bio */}
                {FIELDS.map(f => (
                  <Field
                    key={f.key}
                    {...f}
                    fieldKey={f.key}
                    value={form[f.key] ?? ''}
                    onChange={handleChange}
                    error={errors[f.key]}
                  />
                ))}

                {/* Global error */}
                <AnimatePresence>
                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-red-400 text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {globalError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={onClose}
                  disabled={saveState === 'saving'}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white/80 transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Cancel
                </button>

                <motion.button
                  onClick={handleSave}
                  disabled={saveState === 'saving' || saveState === 'success'}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden disabled:opacity-70"
                  style={{
                    background: saveState === 'success'
                      ? 'linear-gradient(135deg,#16a34a,#15803d)'
                      : saveState === 'error'
                      ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                      : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                    transition: 'background 0.3s',
                    boxShadow: '0 0 20px rgba(59,130,246,0.25)',
                  }}
                >
                  {saveState === 'saving' && <Loader2 size={14} className="animate-spin" />}
                  {saveState === 'success' && <Check size={14} />}
                  {saveState === 'error'   && <AlertCircle size={14} />}
                  {saveState === 'idle'    && null}

                  {saveState === 'saving'  ? 'Saving…'  :
                   saveState === 'success' ? 'Saved!'   :
                   saveState === 'error'   ? 'Failed'   : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}