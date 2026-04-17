'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LearningHeader    from '@/app/components/learning-path/LearningHeader';
import FilterBar         from '@/app/components/learning-path/FilterBar';
import TabsNavigation    from '@/app/components/learning-path/TabsNavigation.';
import LearningGrid      from '@/app/components/learning-path/LearningGrid';
import Pagination        from '@/app/components/learning-path/Pagination';
import SkeletonCard      from '@/app/components/learning-path/SkeletonCard';
import LearningPathQuestionnaire from '@/app/components/learning-path/Learningpathquestionnaire';
import { useLearningPaths }      from '../hooks/useLearningPath';
import { toast }                 from 'react-toastify';
import { useAuth }               from '../CONTEXT/AuthProvider';
import {
  Sparkles, X, Brain, Zap, Target,
  AlertCircle, ArrowRight, BookOpen,
} from 'lucide-react';
import LearningCard from '../components/learning-path/LearningCard';
import RecommendedPathSection from '../components/learning-path/RecommendedPathSection';

// ══════════════════════════════════════════════════════════════
//  Questionnaire Modal
// ══════════════════════════════════════════════════════════════
function QuestionnaireModal({ isOpen, onClose, onComplete }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                     bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.92, opacity: 0, y: 24  }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full
                         bg-slate-700 border border-white/10 flex items-center
                         justify-center text-slate-400 hover:text-white
                         hover:bg-slate-600 transition-all shadow-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <LearningPathQuestionnaire
              onComplete={(result) => { onComplete(result); onClose(); }}
              embedded
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════════════════════
//  Not Found Banner — يظهر لما matched_path = null
// ══════════════════════════════════════════════════════════════
function PathNotFoundBanner({ recommendedPath, onBrowseAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl mb-6 border border-amber-500/20"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60
                      via-[#1a1408] to-[#0f0c05]" />
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: `radial-gradient(ellipse at 10% 50%,
                               rgba(245,158,11,0.25) 0%, transparent 60%)`,
           }} />

      <div className="relative px-6 py-5 flex flex-col sm:flex-row
                      items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-500/15
                        border border-amber-500/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">
            "{recommendedPath}" path isn't available yet
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Our AI recommended this path for you, but it hasn't been added to the
            platform yet. Browse all available paths below — you might find a
            great match!
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onBrowseAll}
          className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center
                     gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     bg-amber-500/15 border border-amber-500/30 text-amber-300
                     hover:bg-amber-500/25 transition-all duration-200"
        >
          <BookOpen className="w-4 h-4" />
          Browse All Paths
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AI Path Banner
// ══════════════════════════════════════════════════════════════
function AIPathBanner({ onClick, result }) {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
      <div className="absolute inset-0 opacity-40"
           style={{
             backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 60%),
                               radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)`,
           }} />
      <motion.div
        animate={{ y: [-6, 6, -6], x: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3 right-16 w-20 h-20 rounded-full
                   bg-violet-500/20 blur-2xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [6, -6, 6], x: [4, -4, 4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 left-24 w-16 h-16 rounded-full
                   bg-blue-500/20 blur-2xl pointer-events-none"
      />

      <div className="relative px-6 py-5 flex flex-col sm:flex-row
                      items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl
                          bg-gradient-to-br from-violet-500 to-blue-500
                          flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-white font-semibold text-sm truncate">
                AI Learning Path Advisor
              </h3>
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px]
                               font-bold bg-violet-500/20 text-violet-300
                               border border-violet-500/30 uppercase tracking-wide">
                New
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Answer 4 quick questions — get a personalised roadmap in seconds.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          {result ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-emerald-500/15 border border-emerald-500/30"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-sm font-semibold">
                {result.recommended_path ?? result.recommendedPath}
              </span>
              <button
                onClick={onClick}
                className="ml-1 text-xs text-slate-400 hover:text-white
                           underline underline-offset-2 transition-colors"
              >
                Redo
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2
                         px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                         bg-gradient-to-r from-violet-600 to-blue-600
                         shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Find My Path
            </motion.button>
          )}
        </div>
      </div>

      <div className="relative px-6 pb-4 flex gap-2 flex-wrap">
        {[
          { icon: Zap,    label: '< 2 min'    },
          { icon: Target, label: 'Skill-based' },
          { icon: Brain,  label: 'AI-powered'  },
        ].map(({ icon: Icon, label }) => (
          <div key={label}
               className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-white/5 border border-white/10 text-slate-400 text-[11px]">
            <Icon className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Page
// ══════════════════════════════════════════════════════════════
export default function LearningPathsPage() {
  const {
    learningPaths, loading, error, pagination,
    fetchLearningPaths, fetchRecommendations,
    fetchLearningPathByTitle,
    refresh,
  } = useLearningPaths();

  const { user } = useAuth();

  const [activeTab,       setActiveTab]       = useState('all');
  const [recommendResult, setRecommendResult] = useState(null);
  const [showModal,       setShowModal]       = useState(false);
  const [isBrowseAll,       setIsBrowseAll]       = useState(false);
 const [isRecommendation, setIsRecommendation] = useState(false);

  // null  = لسه مش عارفين
  // true  = الـ path موجودة في الـ DB
  // false = الـ path مش موجودة
  const [pathExists, setPathExists] = useState(null);

  // ── Fetch learning paths ─────────────────────────────────
  useEffect(() => {
    const params = { page: pagination.page, limit: pagination.limit };
    if (activeTab === 'in-progress') params.progress = 'in-progress';
    if (activeTab === 'completed')   params.progress = 'completed';
    fetchLearningPaths(params);
  }, [activeTab, pagination.page]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Load previous recommendation ─────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRecommendations();
        if (response?.data) {
          // support array or single object
          const latest = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          if (latest) {
            setRecommendResult(latest);
            checkPathExists(latest.recommendedPath);
            setIsRecommendation(true);
          }
        }
      } catch {
        // no previous recommendation
      }
    };
    fetchData();
  }, [user, refresh]);

  // ── Check if recommended path exists in DB ───────────────
  const checkPathExists = useCallback(async (pathTitle) => {
    if (!pathTitle) return;
    try {
      const res = await fetchLearningPathByTitle(pathTitle);
      // لو رجع داتا → موجودة، لو null/error → مش موجودة
      if (res.success) {
        setPathExists(true);
      }
      
      console.log('res in checkPathExists', res);
      
    } catch {
      setPathExists(false);
    }
  }, [fetchLearningPathByTitle]);

  // ── Browse all — clear filter and go to all tab ──────────
  const handleBrowseAll = useCallback(() => {
    setActiveTab('all');
    fetchLearningPaths({ page: 1, limit: pagination.limit });
  setIsBrowseAll(true);
    // scroll to grid smoothly
    document.getElementById('learning-grid')?.scrollIntoView({ behavior: 'smooth' });
  }, [pagination.limit]);

  // ── Questionnaire complete ───────────────────────────────
  const handleQuestionnaireComplete = useCallback((result) => {
    setRecommendResult(result);
    // matched_path = null → path مش موجودة في الـ DB
    setPathExists(result.matched_path !== null);
    toast.success(
      `✨ Recommended: ${result?.recommended_path ?? 'N/A'}`,
      { position: 'bottom-right', autoClose: 4000 }
    );
  }, []);
 

  const handlePageChange = (page) =>
    fetchLearningPaths({ page, limit: pagination.limit });

  // الـ title للعرض — يدعم كلا الشكلين
  const displayedPath = recommendResult?.recommended_path
    ?? recommendResult?.recommendedPath;
handleBrowseAll
  return (
    <>
      <QuestionnaireModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleQuestionnaireComplete}
      />

      <LearningHeader  isRecommended={isRecommendation} setIsBrowseAll={setIsBrowseAll} />
      <FilterBar />
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className=" mt-4">
        {/* AI Banner */}
        <AIPathBanner
          onClick={() => setShowModal(true)}
          result={recommendResult}
        />

        {/* ── Not found banner ── */}
        <AnimatePresence>
          {recommendResult && pathExists === false && displayedPath && (
            <PathNotFoundBanner
              recommendedPath={displayedPath}
              onBrowseAll={handleBrowseAll}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div id="learning-grid">
        {loading  && <SkeletonCard />}
        {!loading && (
  (recommendResult && pathExists && !isBrowseAll)
    ? (
        <RecommendedPathSection
          onBrowseAll={handleBrowseAll}
          path={recommendResult.learningPath}
          highlight
        />
      )
    : (
        <LearningGrid paths={learningPaths} />
      )
)}
        </div>

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}