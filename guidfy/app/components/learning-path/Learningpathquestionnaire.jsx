'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Code2, Database, Cloud, Shield, Smartphone,
  Layers, Brain, ChevronRight, ChevronLeft, Check, Clock,
  Star, Zap, Target, User
} from 'lucide-react';
import { useAuth } from '@/app/CONTEXT/AuthProvider'; // adjust path to your AuthContext
import { useLearningPaths } from '@/app/hooks/useLearningPath';

// ── API call ──────────────────────────────────────────────────
async function submitQuestionnaire(features) {
    console.log('features in submitQuestionnaire', features);
  const res = await recommendLearningPathToStudent(features);
  return res;
}

// ── Data ──────────────────────────────────────────────────────
const STEPS = [
  { id: 'experience', title: 'Experience Level',     icon: Star  },
  { id: 'skills',     title: 'Your Skills',          icon: Code2 },
  { id: 'interest',   title: 'Area of Interest',     icon: Target },
  { id: 'hours',      title: 'Daily Commitment',     icon: Clock },
];

const EXPERIENCE_OPTIONS = [
  { value: 'Beginner',     label: 'Beginner',     desc: 'Just starting out',          icon: '🌱' },
  { value: 'Intermediate', label: 'Intermediate', desc: '1–3 years of experience',    icon: '🚀' },
  { value: 'Advanced',     label: 'Advanced',     desc: '3+ years, deep expertise',   icon: '⚡' },
];

const SKILLS_LIST = [
  { value: 'python',        label: 'Python',        icon: '🐍' },
  { value: 'javascript',    label: 'JavaScript',    icon: '🟨' },
  { value: 'typescript',    label: 'TypeScript',    icon: '🔷' },
  { value: 'html',          label: 'HTML/CSS',      icon: '🎨' },
  { value: 'react',         label: 'React',         icon: '⚛️'  },
  { value: 'node.js',       label: 'Node.js',       icon: '🟢' },
  { value: 'sql',           label: 'SQL',           icon: '🗄️'  },
  { value: 'java',          label: 'Java',          icon: '☕' },
  { value: 'c++',           label: 'C++',           icon: '⚙️'  },
  { value: 'docker',        label: 'Docker',        icon: '🐳' },
  { value: 'aws',           label: 'AWS',           icon: '☁️'  },
  { value: 'tensorflow',    label: 'TensorFlow',    icon: '🧠' },
  { value: 'kotlin',        label: 'Kotlin',        icon: '📱' },
  { value: 'swift',         label: 'Swift',         icon: '🍎' },
  { value: 'flutter',       label: 'Flutter',       icon: '💙' },
  { value: 'kubernetes',    label: 'Kubernetes',    icon: '🎯' },
];

const INTEREST_OPTIONS = [
  { value: 'Frontend',             label: 'Frontend',              icon: Layers,   color: 'from-pink-500 to-rose-500',    bg: 'bg-pink-500/10',   border: 'border-pink-500/30'   },
  { value: 'Backend',              label: 'Backend',               icon: Database, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  { value: 'Full-Stack',           label: 'Full-Stack',            icon: Code2,    color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  { value: 'AI/ML',                label: 'AI / ML',               icon: Brain,    color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  { value: 'Data Science',         label: 'Data Science',          icon: Sparkles, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-500/10',   border: 'border-teal-500/30'   },
  { value: 'Cloud/DevOps',         label: 'Cloud / DevOps',        icon: Cloud,    color: 'from-sky-500 to-blue-500',     bg: 'bg-sky-500/10',    border: 'border-sky-500/30'    },
  { value: 'Cybersecurity',        label: 'Cybersecurity',         icon: Shield,   color: 'from-red-500 to-rose-500',     bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { value: 'Mobile',               label: 'Mobile Dev',            icon: Smartphone, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { value: 'Software Engineering', label: 'Software Engineering',  icon: Zap,      color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
];

const HOURS_OPTIONS = [
  { value: 1, label: '1 hr',  desc: 'Light pace'    },
  { value: 2, label: '2 hrs', desc: 'Steady'        },
  { value: 3, label: '3 hrs', desc: 'Committed'     },
  { value: 4, label: '4 hrs', desc: 'Intensive'     },
  { value: 6, label: '6+ hrs', desc: 'Full focus'   },
];

// ── Animations ────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

// ── Result Card ───────────────────────────────────────────────
function ResultCard({ result, onReset }) {
  const mainPath  = result.recommended_path;
  const topPaths  = result.top_paths ?? [];
  const pathInfo  = INTEREST_OPTIONS.find(o => o.value === mainPath) || INTEREST_OPTIONS[0];
  const PathIcon  = pathInfo.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center gap-6 py-4"
    >
      {/* Main recommendation */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${pathInfo.color}
                      flex items-center justify-center shadow-2xl`}
        >
          <PathIcon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500
                     rounded-full flex items-center justify-center shadow-lg"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">
          Your recommended path
        </p>
        <h2 className="text-3xl font-bold text-white">{mainPath}</h2>
      </motion.div>

      {/* Top paths */}
      {topPaths.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-2"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Confidence scores
          </p>
          {topPaths.map((p, i) => {
            const info = INTEREST_OPTIONS.find(o => o.value === p.path);
            return (
              <div key={p.path} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">{p.path}</span>
                    <span className="text-sm font-mono text-slate-400">
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.confidence * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${info?.color ?? 'from-slate-500 to-slate-400'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onReset}
        className="mt-2 text-sm text-slate-400 hover:text-white transition-colors underline
                   underline-offset-4"
      >
        Start over
      </motion.button>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
// embedded=true  → renders just the card (no full-screen wrapper)
// embedded=false → renders with full-screen dark bg (standalone page)
export default function LearningPathQuestionnaire({ onComplete, embedded = false }) {
  const { user } = useAuth();
  const { recommendLearningPathToStudent,fetchRecommendations } = useLearningPaths();
  const [step,       setStep]       = useState(0);
  const [direction,  setDirection]  = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState('');

  const [answers, setAnswers] = useState({
    experience:    '',
    skills:        [],
    interest:      '',
    hours_per_day: 0,
  });

  useEffect(() => {
  const loadRecommendation = async () => {
    try {
      const res = await fetchRecommendations();

      if (res) {
        setAnswers({
          experience:    res?.data.experience,
          skills:        res?.data.skills,
          interest:      res?.data.interest,
          hours_per_day: res?.data.hoursPerDay
        });
      }
    } catch (err) {
      console.log("No previous recommendation");
    }
  };

  loadRecommendation();
}, []);
  // ── Validation ───────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return !!answers.experience;
    if (step === 1) return answers.skills.length > 0;
    if (step === 2) return !!answers.interest;
    if (step === 3) return answers.hours_per_day > 0;
    return false;
  };

  // ── Navigation ───────────────────────────────────────────
  const goNext = () => {
    if (!canProceed()) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const features = {
        experience:    answers.experience,
        skills:        answers.skills,
        interest:      answers.interest,
        hours_per_day: answers.hours_per_day,
      };
      const data = await recommendLearningPathToStudent(features);
      console.log('data', data);
     
      setResult(data);
      onComplete?.(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep(0);
    setAnswers({ experience:'', skills:[], interest:'', hours_per_day:0 });
  };

  const toggleSkill = (skill) => {
    setAnswers(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // ── Render ───────────────────────────────────────────────
  const card = (
    <div className="relative w-full max-w-lg">
      {/* Card */}
      <div className="relative bg-[#111118] border border-white/[0.07] rounded-2xl
                      shadow-2xl overflow-hidden">

          {/* Top bar */}
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500
                                flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-white">Path Finder</span>
              </div>
              {user?.name && !result && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User className="w-3 h-3" />
                  {user.name}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {!result && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{STEPS[step].title}</span>
                  <span>{step + 1} / {STEPS.length}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  />
                </div>
                {/* Step dots */}
                <div className="flex gap-1.5 justify-center pt-1">
                  {STEPS.map((s, i) => {
                    const StepIcon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                        transition-all duration-300
                                        ${i < step  ? 'bg-violet-500'      : ''}
                                        ${i === step ? 'bg-violet-500/20 border border-violet-500' : ''}
                                        ${i > step  ? 'bg-slate-800'       : ''}`}>
                          {i < step
                            ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            : <StepIcon className={`w-3 h-3 ${i === step ? 'text-violet-400' : 'text-slate-600'}`} strokeWidth={2} />
                          }
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-6 h-px transition-colors duration-300
                                          ${i < step ? 'bg-violet-500' : 'bg-slate-700'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="px-6 py-6 min-h-[340px]">
            <AnimatePresence mode="wait" custom={direction}>
              {result ? (
                <motion.div key="result">
                  <ResultCard result={result} onReset={handleReset} />
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* ── Step 0: Experience ── */}
                  {step === 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        What's your coding experience?
                      </h3>
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <motion.button
                          key={opt.value}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAnswers(p => ({ ...p, experience: opt.value }))}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border
                                      transition-all duration-200 text-left
                                      ${answers.experience === opt.value
                                        ? 'bg-violet-500/15 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                        : 'bg-slate-800/40 border-white/[0.06] hover:border-white/20 hover:bg-slate-800/70'
                                      }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{opt.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                          </div>
                          {answers.experience === opt.value && (
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-violet-500
                                         flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* ── Step 1: Skills ── */}
                  {step === 1 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        What technologies do you know?
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto
                                      scrollbar-thin scrollbar-track-transparent
                                      scrollbar-thumb-slate-700 pr-1">
                        {SKILLS_LIST.map((skill) => {
                          const selected = answers.skills.includes(skill.value);
                          return (
                            <motion.button
                              key={skill.value}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => toggleSkill(skill.value)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg
                                          border text-sm transition-all duration-200 text-left
                                          ${selected
                                            ? 'bg-violet-500/15 border-violet-500/50 text-white'
                                            : 'bg-slate-800/40 border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-slate-200'
                                          }`}
                            >
                              <span className="text-base">{skill.icon}</span>
                              <span className="font-medium text-xs flex-1">{skill.label}</span>
                              {selected && (
                                <Check className="w-3 h-3 text-violet-400 flex-shrink-0" strokeWidth={3} />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                      {answers.skills.length > 0 && (
                        <p className="text-xs text-violet-400 mt-3 text-center">
                          {answers.skills.length} selected
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Interest ── */}
                  {step === 2 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Where do you want to go?
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {INTEREST_OPTIONS.map((opt) => {
                          const Icon     = opt.icon;
                          const selected = answers.interest === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setAnswers(p => ({ ...p, interest: opt.value }))}
                              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl
                                          border transition-all duration-200 text-center
                                          ${selected
                                            ? `${opt.bg} ${opt.border} shadow-lg`
                                            : 'bg-slate-800/40 border-white/[0.06] hover:border-white/20'
                                          }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                                              bg-gradient-to-br ${opt.color} opacity-${selected ? '100' : '60'}`}>
                                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                              </div>
                              <span className={`text-xs font-medium leading-tight
                                               ${selected ? 'text-white' : 'text-slate-400'}`}>
                                {opt.label}
                              </span>
                              {selected && (
                                <motion.div
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
                                             bg-white/20 flex items-center justify-center"
                                >
                                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Hours ── */}
                  {step === 3 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        How many hours per day?
                      </h3>
                      <p className="text-xs text-slate-400 mb-5">
                        Be honest — consistency beats intensity
                      </p>
                      <div className="flex gap-2 mb-6">
                        {HOURS_OPTIONS.map((opt) => {
                          const selected = answers.hours_per_day === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setAnswers(p => ({ ...p, hours_per_day: opt.value }))}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                                          border transition-all duration-200
                                          ${selected
                                            ? 'bg-violet-500/15 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                            : 'bg-slate-800/40 border-white/[0.06] hover:border-white/20'
                                          }`}
                            >
                              <span className={`text-sm font-bold ${selected ? 'text-violet-300' : 'text-slate-300'}`}>
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-slate-500">{opt.desc}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Summary */}
                      {answers.hours_per_day > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-800/60 border border-white/[0.06] rounded-xl p-4 space-y-2"
                        >
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Summary</p>
                          {[
                            { label: 'Experience', value: answers.experience },
                            { label: 'Skills',     value: `${answers.skills.length} selected` },
                            { label: 'Interest',   value: answers.interest },
                            { label: 'Daily time', value: `${answers.hours_per_day} hrs/day` },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="text-white font-medium">{item.value}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 text-center mt-3"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Footer nav */}
          {!result && (
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goPrev}
                disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm
                            font-medium transition-all duration-200
                            ${step === 0
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!canProceed() || loading}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-semibold transition-all duration-200
                            ${canProceed() && !loading
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Analyzing…
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get My Path
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>

  );

  // embedded → just the card, no page bg/glow
  if (embedded) return card;

  // standalone page → full-screen wrapper + background glow
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                        rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px]
                        rounded-full bg-blue-600/8 blur-[100px]" />
      </div>
      {card}
    </div>
  );
}