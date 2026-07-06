'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Code2, Database, Cloud, Shield, Smartphone,
  Layers, Brain, ChevronRight, ChevronLeft, Check, Clock,
  Star, Zap, Target, User, BarChart3, ArrowRight,
  RefreshCw, Trophy, Info
} from 'lucide-react';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

import { useRecommendPath, useMyRecommendation, normalizeRec } from '@/app/hooks/useLearningPath';
import { questionTree } from './questionTree';

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
    explanation:     raw.explanation      ?? [],
    triggeredRules:  raw.triggered_rules  ?? []
  };
}

const INTEREST_OPTIONS = [
  { value: 'Frontend',             label: 'Frontend',        icon: Layers,     color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-500/10',   border: 'border-pink-500/40',   glow: 'rgba(244,63,94,0.3)'   },
  { value: 'Backend',              label: 'Backend',         icon: Database,   color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/40', glow: 'rgba(139,92,246,0.3)'  },
  { value: 'Full Stack',           label: 'Full-Stack',      icon: Code2,      color: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   glow: 'rgba(59,130,246,0.3)'  },
  { value: 'AI & Data',            label: 'AI & Data',       icon: Brain,      color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/40',  glow: 'rgba(245,158,11,0.3)'  },
  { value: 'Data Science',         label: 'Data Science',    icon: BarChart3,  color: 'from-teal-500 to-emerald-500',  bg: 'bg-teal-500/10',   border: 'border-teal-500/40',   glow: 'rgba(20,184,166,0.3)'  },
  { value: 'Cloud',                label: 'Cloud / DevOps',  icon: Cloud,      color: 'from-sky-500 to-blue-500',      bg: 'bg-sky-500/10',    border: 'border-sky-500/40',    glow: 'rgba(14,165,233,0.3)'  },
  { value: 'Cyber Security',       label: 'Cyber Security',  icon: Shield,     color: 'from-red-500 to-rose-600',      bg: 'bg-red-500/10',    border: 'border-red-500/40',    glow: 'rgba(239,68,68,0.3)'   },
  { value: 'Mobile',               label: 'Mobile Dev',      icon: Smartphone, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10',  border: 'border-green-500/40',  glow: 'rgba(34,197,94,0.3)'   },
];

function getMeta(name) {
  // Normalize match
  const n = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return INTEREST_OPTIONS.find(o => o.label.replace(/[^a-zA-Z]/g, "").toLowerCase().includes(n) || n.includes(o.label.replace(/[^a-zA-Z]/g, "").toLowerCase()))
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
function ConfidenceRow({ path, confidence, isTop, index, confidenceLevel }) {
  const meta = getMeta(path);
  const Icon = meta.icon;
  const pct  = Math.round(confidence);
  
  let confColor = "text-slate-400";
  if(isTop) {
     if(confidenceLevel === "HIGH") confColor = "text-green-400";
     else if(confidenceLevel === "MEDIUM") confColor = "text-yellow-400";
     else confColor = "text-orange-400";
  }

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
          <span className={`text-xs font-mono ml-2 flex-shrink-0 ${confColor}`}>
            {isTop ? `${confidenceLevel} CONFIDENCE` : `${pct}%`}
          </span>
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
  const topPaths = (norm?.topPaths ?? []);
  const meta     = getMeta(pathName);
  const PathIcon = meta.icon;
  const confidenceLevel = topPaths.length > 0 ? topPaths[0].confidence : "MEDIUM";
  const explanations = norm?.explanation ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      {/* Hero chip */}
      <div className="flex flex-col items-center gap-2 py-1">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-60 scale-110"
            style={{ background: `radial-gradient(circle, ${meta.glow}, transparent 70%)` }} />
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
            className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color}
                        flex items-center justify-center shadow-2xl`}
          >
            <PathIcon className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 260 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500
                       rounded-full flex items-center justify-center shadow-lg border-2 border-[#111118]"
          >
            <Trophy className="w-3 h-3 text-white" strokeWidth={2} />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-1">
            Expert Recommendation
          </p>
          <h2 className="text-xl font-bold text-white leading-tight">{pathName}</h2>
        </motion.div>
      </div>
      
      {/* Explainability Section */}
      {explanations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50"
          >
             <div className="flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] text-violet-400 uppercase tracking-widest font-semibold">Why this path?</span>
             </div>
             <ul className="space-y-1.5">
                {explanations.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{exp}</span>
                    </li>
                ))}
             </ul>
          </motion.div>
      )}

      {/* Confidence bars */}
      {topPaths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Match Analysis</span>
          </div>
          {topPaths.map((p, i) => (
            <ConfidenceRow
              key={p.path || p.name}
              path={p.path || p.name}
              confidence={p.compatibility || p.confidence}
              confidenceLevel={p.confidence}
              index={i}
              isTop={i === 0}
            />
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2 mt-auto"
      >
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onViewPath}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-sm font-semibold text-white bg-gradient-to-r ${meta.color} shadow-lg`}
          style={{ boxShadow: `0 6px 24px ${meta.glow}` }}
        >
          View Roadmap <ArrowRight className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium
                     text-slate-400 hover:text-white bg-slate-800/60 border border-white/[0.06]
                     hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component (Adaptive Questionnaire)
// ─────────────────────────────────────────────────────────────
export default function LearningPathQuestionnaire({ onComplete, embedded = false }) {
  const { user } = useAuth();
  
  const recommendMutation  = useRecommendPath();

  const [currentNodeId, setCurrentNodeId] = useState('Q_ROOT');
  const [history, setHistory] = useState([]);
  const [answersMap, setAnswersMap] = useState({});
  const [direction, setDirection] = useState(1);
  
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(async (finalAnswers) => {
    setError('');
    try {
      // Send the answers_map to backend Expert System
      const data = await recommendMutation.mutateAsync({
        answers_map: finalAnswers
      });

      if (!data?.recommended_path && !data?.recommendedPath) {
        throw new Error('No recommendation received');
      }

      setResult(data);
    } catch (err) {
      console.error('Recommend error:', err);
      setError(err?.message ?? 'Something went wrong. Please try again.');
    }
  }, [recommendMutation]);

  const handleOptionClick = (option) => {
      const newAnswers = { ...answersMap, [currentNodeId]: option.text };
      setAnswersMap(newAnswers);
      
      if (option.next === "END") {
          handleSubmit(newAnswers);
      } else {
          setHistory(prev => [...prev, currentNodeId]);
          setDirection(1);
          setCurrentNodeId(option.next);
      }
  };

  const goPrev = useCallback(() => {
    if (history.length === 0) return;
    const prevNode = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setDirection(-1);
    setCurrentNodeId(prevNode);
  }, [history]);

  const handleReset = useCallback(() => {
    setResult(null);
    setCurrentNodeId('Q_ROOT');
    setHistory([]);
    setAnswersMap({});
    setDirection(1);
    setError('');
  }, []);

  const handleViewPath = useCallback(() => {
    if (!result) return;
    onComplete?.(result);
  }, [result, onComplete]);

  const isLoading = recommendMutation.isPending;
  const currentNode = questionTree[currentNodeId];

  // ── Card ──────────────────────────────────────────────────
  const card = (
    <div className="relative w-full max-w-lg">
      <div className="relative bg-[#0e0e16] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">

        {/* Top bar */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-md">
                <Brain className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-white">AI Path Expert</span>
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
                <span className="font-medium text-slate-400">Discovering your profile</span>
                <span>Question {history.length + 1}</span>
              </div>
              <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 w-full opacity-50"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%"],
                  }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex-1 overflow-y-auto scrollbar-animated">
          <AnimatePresence mode="wait" custom={direction}>
            {result ? (
              <motion.div key="result" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultScreen result={result} onReset={handleReset} onViewPath={handleViewPath} />
              </motion.div>
            ) : isLoading ? (
               <motion.div key="loading" className="h-full flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full mb-4" />
                  <p className="text-white font-medium">Analyzing Profile...</p>
                  <p className="text-xs text-slate-400 mt-2 text-center max-w-[250px]">
                     The Rule Engine is matching your answers to the Knowledge Base.
                  </p>
               </motion.div>
            ) : (
              <motion.div key={currentNodeId} className="h-full flex flex-col" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
                <h3 className="text-lg font-semibold text-white mb-6 leading-snug">
                   {currentNode?.text}
                </h3>
                <div className="space-y-3 mt-auto">
                    {currentNode?.options.map((opt, idx) => (
                        <motion.button key={idx} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                            onClick={() => handleOptionClick(opt)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left bg-slate-800/30 border-white/[0.06] hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                            <span className="font-medium text-white text-sm flex-1">{opt.text}</span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                        </motion.button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center mt-3">{error}</motion.p>
          )}
        </div>

        {/* Footer nav */}
        {!result && !isLoading && (
          <div className="px-6 pb-5 pt-3 flex-shrink-0">
            <motion.button whileTap={{ scale: 0.96 }} onClick={goPrev} disabled={history.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${history.length === 0
                  ? 'text-slate-700 cursor-not-allowed opacity-0'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 opacity-100'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
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