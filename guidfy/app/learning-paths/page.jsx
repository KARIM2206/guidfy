'use client';

import { useEffect, useState, useCallback,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LearningHeader    from '@/app/components/learning-path/LearningHeader';
// import FilterBar         from '@/app/components/learning-path/FilterBar';
// TabsNavigation تم إزالته بالكامل
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
  Navigation,
} from 'lucide-react';
import RecommendedPathSection from '../components/learning-path/RecommendedPathSection';
import FilterBarLearningPath from '@/app/components/learning-path/FilterBar';

// ═══════════════════════════════════════════════════════
//  Questionnaire Modal (كما هي)
// ═══════════════════════════════════════════════════════
function QuestionnaireModal({ isOpen, onClose, onComplete }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }} onClick={handleBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key="panel" initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose} className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full
              bg-slate-700 border border-white/10 flex items-center justify-center
              text-slate-400 hover:text-white hover:bg-slate-600 transition-all shadow-xl"
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

// ═══════════════════════════════════════════════════════
//  Path Not Found Banner (بدون تغيير)
// ═══════════════════════════════════════════════════════
function PathNotFoundBanner({ recommendedPath, onBrowseAll }) { 
  // ... نفس الكود (لم يتغير) 
  return (
    <div className="relative overflow-hidden rounded-2xl mb-4 border border-amber-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-[#1a1408] to-[#0f0c05]" />
      <div className="relative px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="text-white font-semibold">Path Not Found</h3>
            <p className="text-slate-400 text-sm">"{recommendedPath}" is not available at the moment.</p>
          </div>
        </div>
        <button onClick={onBrowseAll} className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors">
          Browse All Paths
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  AI Path Banner (معدلة بالحالات الثلاث)
// ═══════════════════════════════════════════════════════
function AIPathBanner({
  onFindPath,
  onShowSaved,
  hasSaved,
  showSaved,
  savedPathName,
  pathExists,
}) {
  // 1. إذا التوصية معروضة والمسار موجود
  if (showSaved && hasSaved && pathExists && savedPathName) {
    return (
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        <div className="absolute inset-0 opacity-40"
             style={{ backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)` }} />
        <motion.div animate={{ y: [-6, 6, -6], x: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                     className="absolute top-3 right-16 w-20 h-20 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <motion.div animate={{ y: [6, -6, 6], x: [4, -4, 4] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                     className="absolute bottom-2 left-24 w-16 h-16 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Target className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-semibold text-sm truncate">Your AI Path Ready</h3>
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">Active</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed truncate">{savedPathName}</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('recommended-path-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
            >
              <Navigation className="w-4 h-4" /> Go to My Path
            </motion.button>
            <button onClick={onFindPath} className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Redo</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. إذا التوصية معروضة لكن المسار غير موجود
  if (showSaved && hasSaved && !pathExists && savedPathName) {
    return (
      <div className="relative overflow-hidden rounded-2xl mb-4 border border-amber-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-[#1a1408] to-[#0f0c05]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(ellipse at 10% 50%, rgba(245,158,11,0.25) 0%, transparent 60%)` }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">Path Unavailable</h3>
            <p className="text-slate-400 text-xs">"{savedPathName}" ليس متاحاً. تصفح المسارات الأخرى.</p>
          </div>
          <button onClick={onFindPath} className="text-xs text-slate-400 underline hover:text-white">Redo</button>
        </div>
      </div>
    );
  }

  // 3. توجد توصية محفوظة لكنها مخفية
  if (hasSaved && !showSaved && savedPathName) {
    return (
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        <div className="absolute inset-0 opacity-40"
             style={{ backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)` }} />
        <motion.div animate={{ y: [-6, 6, -6], x: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                     className="absolute top-3 right-16 w-20 h-20 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
        <motion.div animate={{ y: [6, -6, 6], x: [4, -4, 4] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                     className="absolute bottom-2 left-24 w-16 h-16 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-semibold text-sm">AI Recommendation Ready</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">Saved</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                You have a personalised path suggestion. Click to view it.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onShowSaved}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" /> View My Path
            </motion.button>
          </div>
        </div>
        <div className="relative px-6 pb-4 flex gap-2 flex-wrap">
          {[
            { icon: Zap, label: '< 2 min' },
            { icon: Target, label: 'Skill-based' },
            { icon: Brain, label: 'AI-powered' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px]">
              <Icon className="w-3 h-3" /> {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. لا توصية (الحالة الافتراضية)
  return (
    <div className="relative overflow-hidden rounded-2xl mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
      <div className="absolute inset-0 opacity-40"
           style={{ backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)` }} />
      <motion.div animate={{ y: [-6, 6, -6], x: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute top-3 right-16 w-20 h-20 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
      <motion.div animate={{ y: [6, -6, 6], x: [4, -4, 4] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute bottom-2 left-24 w-16 h-16 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
      <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-white font-semibold text-sm truncate">AI Learning Path Advisor</h3>
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">New</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Answer 4 quick questions — get a personalised roadmap in seconds.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onFindPath}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Find My Path
          </motion.button>
        </div>
      </div>
      <div className="relative px-6 pb-4 flex gap-2 flex-wrap">
        {[
          { icon: Zap, label: '< 2 min' },
          { icon: Target, label: 'Skill-based' },
          { icon: Brain, label: 'AI-powered' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px]">
            <Icon className="w-3 h-3" /> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LearningPathsPage() {
  const {
    learningPaths, loading, error, pagination,
    fetchLearningPaths, fetchRecommendations,
    fetchLearningPathByTitle,
    refresh,
  } = useLearningPaths();

  const { user } = useAuth();

  const [recommendResult, setRecommendResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isBrowseAll, setIsBrowseAll] = useState(false);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [pathExists, setPathExists] = useState(null);
  const [filters, setFilters] = useState({ search: null, duration: null });
  const [sortBy, setSortBy] = useState('popular');

  // ── Fetch learning paths ──────────────────────────
  const loadPaths = useCallback((page = 1) => {
    const params = {
      page,
      limit: pagination.limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.duration && { duration: filters.duration }),
    };
    fetchLearningPaths(params);
  }, [pagination.limit, fetchLearningPaths, filters]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    loadPaths(1);
  }, [filters, loadPaths]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // ── Load saved recommendation ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRecommendations();
        if (response?.data) {
          const latest = Array.isArray(response.data) ? response.data[0] : response.data;
          if (latest) {
            setRecommendResult(latest);
            await checkPathExists(latest.recommendedPath);
            setShowRecommendation(false);
            setIsRecommendation(false);
          }
        }
      } catch { /* لا توجد توصية سابقة */ }
    };
    fetchData();
  }, [user, refresh]);

  const checkPathExists = useCallback(async (pathTitle) => {
    if (!pathTitle) return;
    try {
      const res = await fetchLearningPathByTitle(pathTitle);
      setPathExists(res.success === true);
    } catch {
      setPathExists(false);
    }
  }, [fetchLearningPathByTitle]);

  const handleShowSavedRecommendation = useCallback(() => {
    setShowRecommendation(true);
    setIsRecommendation(true);
    setIsBrowseAll(false);
    setTimeout(() => {
      document.getElementById('recommended-path-section')?.scrollIntoView({
        behavior: 'smooth', block: 'start'
      });
    }, 100);
  }, []);

  const handleBrowseAll = useCallback(() => {
    fetchLearningPaths({ page: 1, limit: pagination.limit });
    setIsBrowseAll(true);
    setShowRecommendation(false);
    setIsRecommendation(false);
    document.getElementById('learning-grid')?.scrollIntoView({ behavior: 'smooth' });
  }, [pagination.limit, fetchLearningPaths]);

  const handleQuestionnaireComplete = useCallback(async (result) => {
    setRecommendResult(result);
    const exists = result.matched_path !== null;
    setPathExists(exists);
    setShowRecommendation(true);
    setIsRecommendation(true);
    setIsBrowseAll(false);
    toast.success(`✨ Recommended: ${result?.recommended_path ?? 'N/A'}`, {
      position: 'bottom-right', autoClose: 4000
    });
    if (exists) {
      setTimeout(() => {
        document.getElementById('recommended-path-section')?.scrollIntoView({
          behavior: 'smooth', block: 'start'
        });
      }, 300);
    }
  }, []);

  const handlePageChange = (page) => loadPaths(page);

  const savedPathName = recommendResult?.recommended_path ?? recommendResult?.recommendedPath;

  // ── Sorting logic (محلي) ──────────────────────────
  const sortedPaths = useMemo(() => {
    if (!learningPaths) return [];
    const paths = [...learningPaths];
    switch (sortBy) {
      case 'newest':
        return paths.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'title':
        return paths.sort((a, b) => a.title.localeCompare(b.title));
      case 'popular':
        // يمكن استخدام عدد الـ enrollments أو معيار آخر، هنا نستخدم عدد المسجلين
        return paths.sort((a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0));
      default:
        return paths;
    }
  }, [learningPaths, sortBy]);

  return (
    <>
      <QuestionnaireModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleQuestionnaireComplete}
      />

      <LearningHeader
        isRecommended={isRecommendation}
        setIsBrowseAll={setIsBrowseAll}
        onSortChange={setSortBy}
      />
      <FilterBarLearningPath onFilterChange={handleFilterChange} />
      
      <div className="mt-4">
        <AIPathBanner
          onFindPath={() => setShowModal(true)}
          onShowSaved={handleShowSavedRecommendation}
          hasSaved={!!recommendResult}
          showSaved={showRecommendation}
          savedPathName={savedPathName}
          pathExists={pathExists}
        />

        <AnimatePresence>
          {showRecommendation && recommendResult && pathExists === false && savedPathName && (
            <PathNotFoundBanner recommendedPath={savedPathName} onBrowseAll={handleBrowseAll} />
          )}
        </AnimatePresence>
      </div>

      <div id="learning-grid">
        {loading && <SkeletonCard />}
        {!loading && (
          (recommendResult && pathExists && !isBrowseAll && showRecommendation)
            ? (
                <div id="recommended-path-section">
                  <RecommendedPathSection
                    onBrowseAll={handleBrowseAll}
                    path={recommendResult.learningPath}
                    highlight
                  />
                </div>
              )
            : (
                <LearningGrid paths={sortedPaths} />
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