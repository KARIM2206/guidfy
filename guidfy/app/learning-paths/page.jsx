'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, Target, Zap, X, AlertCircle,
  ArrowLeft, BookOpen, ChevronRight, TrendingUp,
  BarChart3, RefreshCw, Layers, Database, Code2,
  Cloud, Shield, Smartphone, Loader2, CheckCircle2,
  Clock, Star, GraduationCap, PlayCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

import LearningGrid from '@/app/components/learning-path/LearningGrid';
import LearningPathQuestionnaire from '@/app/components/learning-path/Learningpathquestionnaire';
import Modal from '@/app/components/ui/Modal';
import {
  useLearningPaths,
  useMyRecommendation,
  useRecommendPath,
  normalizeRec,
} from '@/app/hooks/useLearningPath';
import { useAuthStore } from '@/lib/stores/authStore';

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const PATH_META = {
  Frontend:              { icon: Layers,      color: 'from-pink-500 to-rose-500',      glow: 'rgba(244,63,94,0.35)'   },
  Backend:               { icon: Database,    color: 'from-violet-500 to-purple-600',  glow: 'rgba(139,92,246,0.35)'  },
  'Full-Stack':          { icon: Code2,       color: 'from-blue-500 to-cyan-500',      glow: 'rgba(59,130,246,0.35)'  },
  'AI/ML':               { icon: Brain,       color: 'from-amber-500 to-orange-500',   glow: 'rgba(245,158,11,0.35)'  },
  'Data Science':        { icon: BarChart3,   color: 'from-teal-500 to-emerald-500',   glow: 'rgba(20,184,166,0.35)'  },
  'Cloud/DevOps':        { icon: Cloud,       color: 'from-sky-500 to-blue-500',       glow: 'rgba(14,165,233,0.35)'  },
  Cybersecurity:         { icon: Shield,      color: 'from-red-500 to-rose-600',       glow: 'rgba(239,68,68,0.35)'   },
  Mobile:                { icon: Smartphone,  color: 'from-green-500 to-emerald-500',  glow: 'rgba(34,197,94,0.35)'   },
  'Software Engineering':{ icon: Zap,         color: 'from-indigo-500 to-violet-500',  glow: 'rgba(99,102,241,0.35)'  },
};

function getMeta(name) {
  const key = Object.keys(PATH_META).find(
    k => k.toLowerCase() === (name ?? '').toLowerCase()
  );
  return key
    ? PATH_META[key]
    : { icon: Sparkles, color: 'from-slate-500 to-slate-600', glow: 'rgba(148,163,184,0.3)' };
}

function findPathInCatalog(title, paths) {
  if (!title || !paths?.length) return null;
  const t = title.toLowerCase().trim();
  return paths.find(p =>
    p.title?.toLowerCase().trim() === t ||
    p.title?.toLowerCase().includes(t) ||
    t.includes(p.title?.toLowerCase().trim())
  ) ?? null;
}

function isEnrolled(path, user) {
  if (user?.role === 'SUPER_ADMIN') return true; // ✅ السوبر أدمن يعتبر مسجل تلقائياً
  if (!path?.enrollments?.length || !user?.id) return false;
  const numUserId = Number(user.id);
  return path.enrollments.some(e => Number(e.userId) === numUserId || Number(e.studentId) === numUserId);
}

// ═══════════════════════════════════════════════════════
// Questionnaire Modal
// ═══════════════════════════════════════════════════════
function QuestionnaireModal({ isOpen, onClose, onComplete }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      className="bg-[#0e0e16] border border-white/[0.08] rounded-2xl p-0 max-w-lg max-h-[90vh]"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full
          bg-slate-800 border border-white/10 flex items-center justify-center
          text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-xl"
      >
        <X className="w-4 h-4" />
      </button>
      <LearningPathQuestionnaire
        onComplete={(result) => { onComplete(result); onClose(); }}
        embedded
      />
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// AI Banner
// ═══════════════════════════════════════════════════════
function AIBanner({ onFindPath, onShowSaved, onBrowseAll, hasSaved, showSaved, savedPathName, pathExists, recLoading }) {
  const meta     = getMeta(savedPathName);
  const PathIcon = meta.icon;

  if (recLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 border border-violet-500/20
                   bg-gradient-to-br from-slate-900 via-[#0f0c29] to-slate-900">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />
        <div className="relative px-5 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Checking your AI recommendation…</p>
            <p className="text-xs text-slate-500 mt-0.5">Just a moment</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showSaved && hasSaved && pathExists && savedPathName) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 border border-emerald-500/25
                   bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 shadow-lg">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.18) 0%, transparent 65%)' }} />
        <div className="relative px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <PathIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">AI Recommended Path</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">Active</span>
              </div>
              <p className="text-xs text-slate-400 truncate font-medium">{savedPathName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('rec-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-900/50">
              <Target className="w-4 h-4" /> View Path
            </motion.button>
            <button onClick={onBrowseAll}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white
                         bg-slate-800/60 border border-white/[0.06] hover:border-white/20 transition-colors">
              Browse All
            </button>
            <button onClick={onFindPath}
              className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
              Redo
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ✅ حتى لو الـ path مش موجود في الـ catalog، نعرض banner بدون pathExists check
  if (showSaved && hasSaved && savedPathName) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 border border-emerald-500/25
                   bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 shadow-lg">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.18) 0%, transparent 65%)' }} />
        <div className="relative px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <PathIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">AI Recommended Path</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">Active</span>
              </div>
              <p className="text-xs text-slate-400 truncate font-medium">{savedPathName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('rec-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-900/50">
              <Target className="w-4 h-4" /> View Path
            </motion.button>
            <button onClick={onBrowseAll}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white
                         bg-slate-800/60 border border-white/[0.06] hover:border-white/20 transition-colors">
              Browse All
            </button>
            <button onClick={onFindPath}
              className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
              Redo
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (hasSaved && !showSaved && savedPathName) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 15% 50%, ${meta.glow} 0%, transparent 55%)` }} />
        <div className="relative px-5 py-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <PathIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">AI Recommendation Ready</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">Saved</span>
              </div>
              <p className="text-xs text-slate-400 truncate">Path: <span className="text-white font-medium">{savedPathName}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onShowSaved}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-900/50">
              <Sparkles className="w-4 h-4" /> View My Path
            </motion.button>
            <button onClick={onBrowseAll}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white
                         bg-slate-800/60 border border-white/[0.06] hover:border-white/20 transition-colors">
              Browse All
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 60%)' }} />
      <div className="relative px-5 py-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">AI Learning Path Advisor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">Free</span>
            </div>
            <p className="text-xs text-slate-400">Answer 4 quick questions — get a personalised roadmap in seconds.</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={onFindPath}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-900/50 flex-shrink-0">
          <Sparkles className="w-4 h-4" /> Find My Path
        </motion.button>
      </div>
      <div className="relative px-5 pb-4 flex gap-2 flex-wrap">
        {[{ icon: Zap, label: '< 2 min' }, { icon: Target, label: 'Skill-based' }, { icon: Brain, label: 'AI-powered' }].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px]">
            <Icon className="w-3 h-3" /> {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Confidence Bars
// ═══════════════════════════════════════════════════════
function ConfidenceBars({ topPaths, recommendedPath }) {
  if (!topPaths?.length) return null;
  const sorted = [...topPaths].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-3">
      {sorted.map((p, i) => {
        const meta  = getMeta(p.path);
        const Icon  = meta.icon;
        const pct   = Math.round(p.confidence * 100);
        const isTop = p.path.toLowerCase() === recommendedPath?.toLowerCase();

        return (
          <div key={p.path} className="flex items-center gap-3">
            <div className="w-5 text-center flex-shrink-0">
              {i === 0
                ? <Star className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                : <span className="text-[10px] font-bold text-gray-400">#{i + 1}</span>}
            </div>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium truncate ${isTop ? 'text-gray-900' : 'text-gray-600'}`}>
                  {p.path}
                  {isTop && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Best Fit
                    </span>
                  )}
                </span>
                <span className={`text-xs font-mono font-bold ml-2 flex-shrink-0 ${isTop ? 'text-gray-900' : 'text-gray-400'}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${meta.color} ${isTop ? 'opacity-100' : 'opacity-50'}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Enrollment Status Badge
// ═══════════════════════════════════════════════════════
function EnrollmentBadge({ enrolled, inProgress }) {
  if (!enrolled) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        ${inProgress
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
    >
      {inProgress
        ? <><PlayCircle className="w-3 h-3" /> In Progress</>
        : <><GraduationCap className="w-3 h-3" /> Enrolled</>}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Empty Card — لما الـ recommended path مش موجود في الـ catalog
// ═══════════════════════════════════════════════════════
function EmptyRecommendedCard({ pathName, onBrowseAll, onRedo, meta }) {
  const PathIcon = meta.icon;
  return (
    <div
      className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed h-full min-h-[220px]"
      style={{ borderColor: meta.glow, background: `radial-gradient(ellipse at 50% 0%, ${meta.glow.replace('0.35', '0.06')} 0%, transparent 70%)` }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg opacity-40 mb-4`}>
        <PathIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
      </div>
      <p className="text-base font-bold text-gray-800 mb-1 text-center">
        <span className="font-semibold text-gray-900">"{pathName}"</span>
      </p>
      <p className="text-sm text-gray-400 text-center mb-5 max-w-xs">
        This path isn't in our catalogue yet. Browse similar paths below.
      </p>
      <div className="flex gap-2">
        <button onClick={onBrowseAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors">
          <BookOpen className="w-3.5 h-3.5" /> Browse All Paths
        </button>
        <button onClick={onRedo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Fallback Path Card — يعرض أول path من topPaths موجود في الـ catalog
// ═══════════════════════════════════════════════════════
function FallbackPathCard({ fallbackPath, fallbackPathName, user, meta }) {
  const PathIcon = meta.icon;
  const userId = user?.id ? Number(user.id) : null;
  const enrolled   = isEnrolled(fallbackPath, user);
  const inProgress = enrolled && (fallbackPath?.currentUserProgress ?? fallbackPath?.enrollments?.find(
    e => e.userId === userId || e.studentId === userId
  )?.progress ?? 0) > 0;

  let LearningCard = null;
  try { LearningCard = require('@/app/components/learning-path/LearningCard').default; } catch {}

  if (LearningCard) {
    return (
      <div className="rounded-2xl overflow-hidden relative" style={{ boxShadow: `0 0 30px ${meta.glow}` }}>
        <LearningCard path={fallbackPath} />
        {enrolled && (
          <div className="absolute top-3 left-3 z-10">
            <EnrollmentBadge enrolled={enrolled} inProgress={inProgress} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 p-6"
      style={{ borderColor: meta.glow, boxShadow: `0 8px 40px ${meta.glow}` }}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-xl`}>
          <PathIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <div>
          {enrolled && <EnrollmentBadge enrolled={enrolled} inProgress={inProgress} />}
          <h3 className="text-xl font-bold text-gray-900 capitalize mt-1">
            {fallbackPath.title ?? fallbackPathName}
          </h3>
        </div>
      </div>
      {fallbackPath.description && (
        <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3">{fallbackPath.description}</p>
      )}
      <button className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${meta.color} shadow-md`}>
        {enrolled ? (inProgress ? 'Continue Learning' : 'Start Learning') : 'Enroll Now'}
        <ChevronRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Recommended Section
// ═══════════════════════════════════════════════════════
function RecommendedSection({ rec, allPaths, onBrowseAll, onRedo, userId }) {
  const { recommendedPath, topPaths } = rec;
  const { user } = useAuthStore();
  const effectiveUserId = userId || user?.id;

  // ── resolve main recommended path ───────────────────
  // ✅ الـ backend بيبعت learningPath لكنه مش موثوق (عنده bug في الـ matching)
  // الحل: نعمل exact title match بين recommendedPath والـ catalog
  const fullPath = useMemo(() => {
    if (!recommendedPath || !allPaths?.length) return null;
    return allPaths.find(
      p => p.title?.toLowerCase().trim() === recommendedPath.toLowerCase().trim()
    ) ?? null;
  }, [recommendedPath, allPaths]);

  // ── ✅ fallback: أول path من topPaths موجود في الـ catalog ─
  const sortedTopPaths = useMemo(
    () => [...(topPaths ?? [])].sort((a, b) => b.confidence - a.confidence),
    [topPaths]
  );

  const fallbackEntry = useMemo(() => {
    if (fullPath) return null;
    // ✅ exact title match فقط — مش partial، ومش بنستخدم الـ learningPathId من الـ backend (غير موثوق)
    for (const tp of sortedTopPaths) {
      // بنتخطى الـ recommended path نفسه — هو مش موجود ده سبب وجودنا هنا
      if (tp.path?.toLowerCase().trim() === recommendedPath?.toLowerCase().trim()) continue;
      const found = allPaths.find(
        p => p.title?.toLowerCase().trim() === tp.path?.toLowerCase().trim()
      );
      if (found) return { path: tp.path, catalogPath: found };
    }
    return null;
  }, [fullPath, sortedTopPaths, allPaths, recommendedPath]);

  const fallbackFullPath = useMemo(() => {
    if (!fallbackEntry?.catalogPath?.id) return fallbackEntry?.catalogPath ?? null;
    return allPaths.find(p => p.id === fallbackEntry.catalogPath.id) ?? fallbackEntry.catalogPath;
  }, [fallbackEntry, allPaths]);

  // ── enrollment for main path ─────────────────────────
  const enrolled   = isEnrolled(fullPath, user);
  const inProgress = enrolled && (fullPath?.enrollments?.find(
    e => (e.userId === effectiveUserId || e.studentId === effectiveUserId)
  )?.progress ?? 0) > 0;

  const meta     = getMeta(recommendedPath);
  const PathIcon = meta.icon;
  const fallbackMeta = getMeta(fallbackEntry?.path ?? '');

  let LearningCard = null;
  try { LearningCard = require('@/app/components/learning-path/LearningCard').default; } catch {}

  // ── تحديد الكارت اللي هيتعرض في الـ main col ────────
  //  1. الـ recommended path لو موجود
  //  2. Empty card + fallback card تحته لو مش موجود
  const mainCardContent = useMemo(() => {
    if (fullPath) {
      // ✅ الـ recommended path موجود — عرضه عادي
      if (LearningCard) {
        return (
          <div className="rounded-2xl overflow-hidden relative" style={{ boxShadow: `0 0 30px ${meta.glow}` }}>
            <LearningCard path={fullPath} />
            {enrolled && (
              <div className="absolute top-3 left-3 z-10">
                <EnrollmentBadge enrolled={enrolled} inProgress={inProgress} />
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="relative overflow-hidden rounded-2xl border-2 p-6"
          style={{ borderColor: meta.glow, boxShadow: `0 8px 40px ${meta.glow}` }}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-xl`}>
              <PathIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              {enrolled && <EnrollmentBadge enrolled={enrolled} inProgress={inProgress} />}
              <h3 className="text-xl font-bold text-gray-900 capitalize mt-1">
                {fullPath.title ?? recommendedPath}
              </h3>
            </div>
          </div>
          {fullPath.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3">{fullPath.description}</p>
          )}
          <button className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${meta.color} shadow-md`}>
            {enrolled ? (inProgress ? 'Continue Learning' : 'Start Learning') : 'Enroll Now'}
            <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      );
    }

    // ✅ الـ recommended path مش موجود — empty card + fallback لو موجود
    return (
      <div className="space-y-4">
        {/* Empty card للـ recommended path */}
        <EmptyRecommendedCard
          pathName={recommendedPath}
          onBrowseAll={onBrowseAll}
          onRedo={onRedo}
          meta={meta}
        />

        {/* ✅ Fallback card — أول path من topPaths موجود في الـ catalog */}
        {fallbackFullPath && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Next Best Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200">
                #{sortedTopPaths.findIndex(t => t.path.toLowerCase() === fallbackEntry?.path?.toLowerCase()) + 1} in AI ranking
              </span>
            </div>
            <FallbackPathCard
              fallbackPath={fallbackFullPath}
              fallbackPathName={fallbackEntry?.path ?? ''}
              user={user}
              meta={fallbackMeta}
            />
          </motion.div>
        )}
      </div>
    );
  }, [
    fullPath, LearningCard, meta, PathIcon, enrolled, inProgress,
    recommendedPath, fallbackFullPath, fallbackEntry, fallbackMeta,
    sortedTopPaths, onBrowseAll, onRedo, user,
  ]);

  return (
    <motion.div
      id="rec-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-md`}>
            <PathIcon className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">Your Recommended Path</h2>
            <p className="text-xs text-gray-400 mt-0.5">Personalised by AI</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
            AI Pick
          </span>

          {enrolled && <EnrollmentBadge enrolled={enrolled} inProgress={inProgress} />}

          {rec.interest && rec.recommendedPath &&
           rec.interest.toLowerCase() !== rec.recommendedPath.toLowerCase() && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium">
              <AlertCircle className="w-3 h-3" />
              Based on your skills, not interest
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onRedo}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-3.5 h-3.5" /> Redo
          </button>
          <button onClick={onBrowseAll}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Browse All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main card col */}
        <div className="lg:col-span-2">
          {mainCardContent}
        </div>

        {/* Sidebar — confidence bars + profile */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Confidence</span>
            </div>

            {/* ✅ عرض الـ confidence bars بالترتيب دايماً — حتى لو الـ recommended مش موجود */}
            <ConfidenceBars topPaths={topPaths} recommendedPath={recommendedPath} />

            {topPaths?.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                Higher score = better fit based on your profile.
              </p>
            )}

            {/* Profile summary */}
            {(rec.experience || rec.interest || rec.hoursPerDay) && (
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Profile</p>
                {rec.experience && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span>{rec.experience}</span>
                  </div>
                )}
                {rec.interest && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Target className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      {rec.interest}
                      {rec.interest.toLowerCase() !== (rec.recommendedPath ?? '').toLowerCase() && (
                        <span className="text-amber-500 text-[10px]">(≠ recommendation)</span>
                      )}
                    </span>
                  </div>
                )}
                {rec.hoursPerDay > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span>{rec.hoursPerDay}h / day</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="h-40 bg-gray-100 rounded-xl mb-4" />
          <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
          <div className="h-3 bg-gray-50 rounded mb-1 w-full" />
          <div className="h-3 bg-gray-50 rounded mb-4 w-2/3" />
          <div className="h-8 bg-gray-100 rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════
export default function LearningPathsPage() {
  const [showModal, setShowModal]     = useState(false);
  const [showRec, setShowRec]         = useState(true);
  const [isBrowseAll, setIsBrowseAll] = useState(false);
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('popular');
  const [page, setPage]               = useState(1);

  const {
    data: pathsData,
    isLoading: pathsLoading,
    isError,
    error,
  } = useLearningPaths({ page, limit: 10, ...(search && { search }) });

  const learningPaths = pathsData?.data ?? [];
  const pagination    = pathsData?.pagination ?? { page: 1, totalPages: 1 };

  const { data: savedRec, isLoading: recLoading } = useMyRecommendation();

  const handleQuestionnaireComplete = useCallback((rawResult) => {
    const normalized = normalizeRec(rawResult);
    setShowRec(true);
    setIsBrowseAll(false);
    toast.success(`✨ Recommended: ${normalized.recommendedPath}`, {
      position: 'bottom-right',
      autoClose: 4000,
    });
    setTimeout(() => {
      document.getElementById('rec-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }, []);

  const handleBrowseAll = useCallback(() => {
    setIsBrowseAll(true);
    setShowRec(false);
    setTimeout(() => document.getElementById('learning-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleShowSaved = useCallback(() => {
    setShowRec(true);
    setIsBrowseAll(false);
    setTimeout(() => document.getElementById('rec-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const sortedPaths = useMemo(() => {
    if (!learningPaths.length) return [];
    const arr = [...learningPaths];
    if (sort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'title')  return arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr.sort((a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0));
  }, [learningPaths, sort]);

  // ✅ pathExists: بنعرض الـ section دايماً لو في savedRec
  // الـ section نفسها بتتعامل مع اللي موجود واللي مش موجود
  const pathExists = useMemo(() => !!savedRec, [savedRec]);

  const showRecommendedSection = showRec && !!savedRec && !isBrowseAll;

  return (
    <>
      <QuestionnaireModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleQuestionnaireComplete}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Learning Paths</h1>
            <p className="text-gray-500 text-sm">Explore curated paths — or let AI pick one for you.</p>
          </motion.div>

          <AIBanner
            onFindPath={() => setShowModal(true)}
            onShowSaved={handleShowSaved}
            onBrowseAll={handleBrowseAll}
            hasSaved={!!savedRec}
            showSaved={showRec}
            savedPathName={savedRec?.recommendedPath ?? ''}
            pathExists={pathExists}
            recLoading={recLoading}
          />

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search learning paths..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition">
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="title">A → Z</option>
            </select>
          </div>

          <AnimatePresence>
            {showRecommendedSection && (
              <RecommendedSection
                rec={savedRec}
                allPaths={learningPaths}
                onBrowseAll={handleBrowseAll}
                onRedo={() => setShowModal(true)}
              />
            )}
          </AnimatePresence>

          <div id="learning-grid">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {showRecommendedSection ? 'All Paths' : `All Learning Paths · ${sortedPaths.length}`}
              </h2>
            </div>

            {pathsLoading && <SkeletonGrid />}
            {!pathsLoading && isError && (
              <div className="flex items-center justify-center py-16 text-red-500 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error?.message ?? 'Something went wrong'}</span>
              </div>
            )}
            {!pathsLoading && !isError && <LearningGrid paths={sortedPaths} />}
          </div>

          {!pathsLoading && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition">
                Previous
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(pagination.totalPages, page + 2))
                  .map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                        p === page ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {p}
                    </button>
                  ))}
              </div>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition">
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}