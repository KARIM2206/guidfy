'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Code2, Database, Cloud, Shield, Smartphone,
  Layers, Brain, ChevronRight, ChevronLeft, Check, Clock,
  Star, Zap, Target, User, BarChart3, ArrowRight,
  RefreshCw, Trophy,
} from 'lucide-react';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

// ✅ استبدلنا useLearningPaths القديمة بالـ hooks الجديدة
import { useRecommendPath, useMyRecommendation, normalizeRec } from '@/app/hooks/useLearningPath';

// ─────────────────────────────────────────────────────────────
// Normalize API response
// ─────────────────────────────────────────────────────────────
function normalizeResult(raw) {
  if (!raw) return null;
  return {
    recommendedPath: raw.recommended_path ?? raw.recommendedPath ?? '',
    topPaths:        raw.top_paths        ?? raw.topPaths        ?? [],
    matchedPath:     raw.matched_path     ?? raw.matchedPath     ?? null,
    learningPath:    raw.learningPath     ?? raw.learning_path   ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'experience', title: 'Experience Level', icon: Star   },
  { id: 'skills',     title: 'Your Skills',      icon: Code2  },
  { id: 'interest',   title: 'Area of Interest', icon: Target },
  { id: 'hours',      title: 'Daily Commitment', icon: Clock  },
];

const EXPERIENCE_OPTIONS = [
  { value: 'Beginner',     label: 'Beginner',     desc: 'Just starting out',        icon: '🌱' },
  { value: 'Intermediate', label: 'Intermediate', desc: '1–3 years experience',     icon: '🚀' },
  { value: 'Advanced',     label: 'Advanced',     desc: '3+ years, deep expertise', icon: '⚡' },
];

const SKILLS_LIST = [
  { value: 'python',     label: 'Python',     icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'html',       label: 'HTML/CSS',   icon: '🎨' },
  { value: 'react',      label: 'React',      icon: '⚛️'  },
  { value: 'node.js',    label: 'Node.js',    icon: '🟢' },
  { value: 'sql',        label: 'SQL',        icon: '🗄️'  },
  { value: 'java',       label: 'Java',       icon: '☕' },
  { value: 'c++',        label: 'C++',        icon: '⚙️'  },
  { value: 'docker',     label: 'Docker',     icon: '🐳' },
  { value: 'aws',        label: 'AWS',        icon: '☁️'  },
  { value: 'tensorflow', label: 'TensorFlow', icon: '🧠' },
  { value: 'kotlin',     label: 'Kotlin',     icon: '📱' },
  { value: 'swift',      label: 'Swift',      icon: '🍎' },
  { value: 'flutter',    label: 'Flutter',    icon: '💙' },
  { value: 'kubernetes', label: 'Kubernetes', icon: '🎯' },
];

const INTEREST_OPTIONS = [
  { value: 'Frontend',             label: 'Frontend',        icon: Layers,     color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-500/10',   border: 'border-pink-500/40',   glow: 'rgba(244,63,94,0.3)'   },
  { value: 'Backend',              label: 'Backend',         icon: Database,   color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/40', glow: 'rgba(139,92,246,0.3)'  },
  { value: 'Full-Stack',           label: 'Full-Stack',      icon: Code2,      color: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   glow: 'rgba(59,130,246,0.3)'  },
  { value: 'AI/ML',                label: 'AI / ML',         icon: Brain,      color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/40',  glow: 'rgba(245,158,11,0.3)'  },
  { value: 'Data Science',         label: 'Data Science',    icon: BarChart3,  color: 'from-teal-500 to-emerald-500',  bg: 'bg-teal-500/10',   border: 'border-teal-500/40',   glow: 'rgba(20,184,166,0.3)'  },
  { value: 'Cloud/DevOps',         label: 'Cloud / DevOps',  icon: Cloud,      color: 'from-sky-500 to-blue-500',      bg: 'bg-sky-500/10',    border: 'border-sky-500/40',    glow: 'rgba(14,165,233,0.3)'  },
  { value: 'Cybersecurity',        label: 'Cybersecurity',   icon: Shield,     color: 'from-red-500 to-rose-600',      bg: 'bg-red-500/10',    border: 'border-red-500/40',    glow: 'rgba(239,68,68,0.3)'   },
  { value: 'Mobile',               label: 'Mobile Dev',      icon: Smartphone, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10',  border: 'border-green-500/40',  glow: 'rgba(34,197,94,0.3)'   },
  { value: 'Software Engineering', label: 'Software Eng.',   icon: Zap,        color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', glow: 'rgba(99,102,241,0.3)'  },
];

const HOURS_OPTIONS = [
  { value: 1, label: '1 hr',   desc: 'Light'    },
  { value: 2, label: '2 hrs',  desc: 'Steady'   },
  { value: 3, label: '3 hrs',  desc: 'Solid'    },
  { value: 4, label: '4 hrs',  desc: 'Heavy'    },
  { value: 6, label: '6+ hrs', desc: 'Full-on'  },
];

function getMeta(name) {
  return INTEREST_OPTIONS.find(o => o.value === name)
    ?? { icon: Sparkles, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/10', border: 'border-slate-500/40', glow: 'rgba(148,163,184,0.3)' };
}

// ─────────────────────────────────────────────────────────────
// Slide animation
// ─────────────────────────────────────────────────────────────
const slide = {
  enter:  (d) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
  exit:   (d) => ({ x: d > 0 ? -56 : 56, opacity: 0, transition: { duration: 0.22 } }),
};

// ─────────────────────────────────────────────────────────────
// Confidence bar row
// ─────────────────────────────────────────────────────────────
function ConfidenceRow({ path, confidence, index, isTop }) {
  const meta = getMeta(path);
  const Icon = meta.icon;
  const pct  = Math.round(confidence * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.45 + index * 0.08 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors
        ${isTop ? 'bg-white/[0.05] border border-white/[0.08]' : ''}`}
    >
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-medium truncate ${isTop ? 'text-white' : 'text-slate-300'}`}>{path}</span>
          <span className="text-xs font-mono text-slate-400 ml-2 flex-shrink-0">{pct}%</span>
        </div>
        <div className="h-1 bg-slate-700/80 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.65, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${meta.color}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result Screen
// ─────────────────────────────────────────────────────────────
function ResultScreen({ result, onReset, onViewPath }) {
  const norm     = normalizeResult(result);
  const pathName = norm?.recommendedPath ?? '';
  const topPaths = (norm?.topPaths ?? []).sort((a, b) => b.confidence - a.confidence);
  const meta     = getMeta(pathName);
  const PathIcon = meta.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
      {/* Hero chip */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-60 scale-110"
            style={{ background: `radial-gradient(circle, ${meta.glow}, transparent 70%)` }} />
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.color}
                        flex items-center justify-center shadow-2xl`}
          >
            <PathIcon className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 260 }}
            className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500
                       rounded-full flex items-center justify-center shadow-lg border-2 border-[#111118]"
          >
            <Trophy className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-1.5">
            Your Recommended Path
          </p>
          <h2 className="text-2xl font-bold text-white leading-tight">{pathName}</h2>
        </motion.div>
      </div>

      {/* Confidence bars — مرتبة بالـ confidence */}
      {topPaths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">AI Confidence</span>
          </div>
          {topPaths.map((p, i) => (
            <ConfidenceRow
              key={p.path}
              path={p.path}
              confidence={p.confidence}
              index={i}
              isTop={i === 0}
            />
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-2 pt-1"
      >
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onViewPath}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-sm font-semibold text-white bg-gradient-to-r ${meta.color} shadow-lg`}
          style={{ boxShadow: `0 6px 24px ${meta.glow}` }}
        >
          View My Path <ArrowRight className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                     text-slate-400 hover:text-white bg-slate-800/60 border border-white/[0.06]
                     hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Redo
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function LearningPathQuestionnaire({ onComplete, embedded = false }) {
  const { user } = useAuth();

  // ✅ TanStack Query hooks بدل Context
  const { data: savedRec } = useMyRecommendation();
  const recommendMutation  = useRecommendPath();

  const [step,      setStep]      = useState(0);
  const [direction, setDirection] = useState(1);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');

  const [answers, setAnswers] = useState({
    experience:    '',
    skills:        [],
    interest:      '',
    hours_per_day: 0,
  });

  // ✅ Pre-fill من الـ cache بدل async call
  useEffect(() => {
    if (!savedRec) return;
    setAnswers({
      experience:    savedRec.experience    ?? '',
      skills:        savedRec.skills        ?? [],
      interest:      savedRec.interest      ?? '',
      hours_per_day: savedRec.hoursPerDay   ?? 0,
    });
  }, [savedRec]);

  // ── Validation ────────────────────────────────────────────
  const canProceed = useCallback(() => {
    if (step === 0) return !!answers.experience;
    if (step === 1) return answers.skills.length > 0;
    if (step === 2) return !!answers.interest;
    if (step === 3) return answers.hours_per_day > 0;
    return false;
  }, [step, answers]);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setError('');
    try {
      // ✅ recommendMutation.mutateAsync بترجع الـ data مباشرة
      // data = { success, recommended_path, top_paths, matched_path, saved_id }
      const data = await recommendMutation.mutateAsync({
        experience:    answers.experience,
        skills:        answers.skills,
        interest:      answers.interest,
        hours_per_day: answers.hours_per_day,
      });

      console.log('recommend response:', data);

      // ✅ الـ backend بيرجع recommended_path في root مش nested
      if (!data?.recommended_path && !data?.recommendedPath) {
        throw new Error('No recommendation received');
      }

      setResult(data);
    } catch (err) {
      console.error('Recommend error:', err);
      setError(err?.message ?? 'Something went wrong. Please try again.');
    }
  }, [answers, recommendMutation]);

  const goNext = useCallback(() => {
    if (!canProceed()) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  }, [canProceed, step, handleSubmit]);

  const goPrev = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  }, [step]);

  const handleReset = useCallback(() => {
    setResult(null);
    setStep(0);
    setDirection(1);
    setError('');
    setAnswers({ experience: '', skills: [], interest: '', hours_per_day: 0 });
  }, []);

  const handleViewPath = useCallback(() => {
    if (!result) return;
    onComplete?.(result);
  }, [result, onComplete]);

  const toggleSkill = useCallback((val) => {
    setAnswers(p => ({
      ...p,
      skills: p.skills.includes(val)
        ? p.skills.filter(s => s !== val)
        : [...p.skills, val],
    }));
  }, []);

  const isLoading = recommendMutation.isPending;

  // ── Card ──────────────────────────────────────────────────
  const card = (
    <div className="relative w-full max-w-lg">
      <div className="relative bg-[#0e0e16] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

        {/* Top bar */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-white">Path Finder</span>
            </div>
            {user?.name && !result && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3 h-3" /> {user.name}
              </div>
            )}
          </div>

          {!result && (
            <div className="space-y-2.5">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-400">{STEPS[step].title}</span>
                <span>{step + 1} / {STEPS.length}</span>
              </div>
              <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5 justify-center pt-0.5">
                {STEPS.map((s, i) => {
                  const Icon    = s.icon;
                  const done    = i < step;
                  const current = i === step;
                  return (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                        ${done    ? 'bg-violet-500' : ''}
                        ${current ? 'bg-violet-500/15 border border-violet-500/60' : ''}
                        ${!done && !current ? 'bg-slate-800/80' : ''}`}>
                        {done
                          ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          : <Icon className={`w-3 h-3 ${current ? 'text-violet-400' : 'text-slate-600'}`} strokeWidth={2} />}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-5 h-px transition-colors duration-300 ${done ? 'bg-violet-500' : 'bg-slate-700'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 h-[420px] overflow-y-auto scrollbar-animated">
          <AnimatePresence mode="wait" custom={direction}>
            {result ? (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultScreen result={result} onReset={handleReset} onViewPath={handleViewPath} />
              </motion.div>
            ) : (
              <motion.div key={step} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">

                {/* Step 0 — Experience */}
                {step === 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-base font-semibold text-white mb-4">What's your coding experience?</h3>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <motion.button key={opt.value} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setAnswers(p => ({ ...p, experience: opt.value }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                          ${answers.experience === opt.value
                            ? 'bg-violet-500/12 border-violet-500/50 shadow-[0_0_24px_rgba(139,92,246,0.12)]'
                            : 'bg-slate-800/30 border-white/[0.06] hover:border-white/15 hover:bg-slate-800/60'}`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                        </div>
                        {answers.experience === opt.value && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 1 — Skills */}
                {step === 1 && (
                  <div>
                    <h3 className="text-base font-semibold text-white mb-0.5">What technologies do you know?</h3>
                    <p className="text-xs text-slate-500 mb-4">Select all that apply</p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-[270px] overflow-y-auto
                                    scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700 pr-1">
                      {SKILLS_LIST.map((skill) => {
                        const sel = answers.skills.includes(skill.value);
                        return (
                          <motion.button key={skill.value} whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSkill(skill.value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all duration-200 text-left
                              ${sel
                                ? 'bg-violet-500/12 border-violet-500/45 text-white'
                                : 'bg-slate-800/30 border-white/[0.06] text-slate-400 hover:border-white/15 hover:text-slate-200'}`}
                          >
                            <span className="text-base">{skill.icon}</span>
                            <span className="font-medium text-xs flex-1">{skill.label}</span>
                            {sel && <Check className="w-3 h-3 text-violet-400 flex-shrink-0" strokeWidth={3} />}
                          </motion.button>
                        );
                      })}
                    </div>
                    {answers.skills.length > 0 && (
                      <p className="text-xs text-violet-400 mt-3 text-center">{answers.skills.length} selected</p>
                    )}
                  </div>
                )}

                {/* Step 2 — Interest */}
                {step === 2 && (
                  <div>
                    <h3 className="text-base font-semibold text-white mb-4">Where do you want to go?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {INTEREST_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const sel  = answers.interest === opt.value;
                        return (
                          <motion.button key={opt.value} whileTap={{ scale: 0.93 }}
                            onClick={() => setAnswers(p => ({ ...p, interest: opt.value }))}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 text-center
                              ${sel
                                ? `${opt.bg} ${opt.border}`
                                : 'bg-slate-800/30 border-white/[0.06] hover:border-white/15'}`}
                            style={sel ? { boxShadow: `0 0 20px ${opt.glow}` } : {}}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${opt.color}
                                            ${sel ? 'opacity-100' : 'opacity-55'} transition-opacity`}>
                              <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                            </div>
                            <span className={`text-[11px] font-medium leading-tight ${sel ? 'text-white' : 'text-slate-500'}`}>
                              {opt.label}
                            </span>
                            {sel && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3 — Hours */}
                {step === 3 && (
                  <div>
                    <h3 className="text-base font-semibold text-white mb-0.5">How many hours per day?</h3>
                    <p className="text-xs text-slate-500 mb-5">Consistency beats intensity</p>
                    <div className="flex gap-2 mb-5">
                      {HOURS_OPTIONS.map((opt) => {
                        const sel = answers.hours_per_day === opt.value;
                        return (
                          <motion.button key={opt.value} whileTap={{ scale: 0.93 }}
                            onClick={() => setAnswers(p => ({ ...p, hours_per_day: opt.value }))}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-200
                              ${sel
                                ? 'bg-violet-500/12 border-violet-500/50 shadow-[0_0_18px_rgba(139,92,246,0.15)]'
                                : 'bg-slate-800/30 border-white/[0.06] hover:border-white/15'}`}
                          >
                            <span className={`text-sm font-bold ${sel ? 'text-violet-300' : 'text-slate-300'}`}>{opt.label}</span>
                            <span className="text-[10px] text-slate-600">{opt.desc}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {answers.hours_per_day > 0 && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 border border-white/[0.06] rounded-xl p-4">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Your Answers</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Experience', value: answers.experience },
                            { label: 'Skills',     value: `${answers.skills.length} selected` },
                            { label: 'Interest',   value: answers.interest },
                            { label: 'Daily time', value: `${answers.hours_per_day} hrs/day` },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between text-xs">
                              <span className="text-slate-500">{item.label}</span>
                              <span className="text-white font-semibold">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center mt-3">{error}</motion.p>
          )}
        </div>

        {/* Footer nav */}
        {!result && (
          <div className="px-6 pb-5 flex items-center gap-3 border-t border-white/[0.04] pt-4">
            <motion.button whileTap={{ scale: 0.96 }} onClick={goPrev} disabled={step === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${step === 0
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </motion.button>

            <motion.button whileTap={{ scale: 0.96 }} onClick={goNext}
              disabled={!canProceed() || isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${canProceed() && !isLoading
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:opacity-90'
                  : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full" />
                  Analyzing…
                </>
              ) : step === STEPS.length - 1 ? (
                <><Sparkles className="w-4 h-4" /> Get My Path</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return card;

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/6 blur-[100px]" />
      </div>
      {card}
    </div>
  );
}