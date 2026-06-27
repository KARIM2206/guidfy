'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/apiProfile';
import JobCard from './JobCard';
import { useRecommendations } from '@/app/hooks/useRecommendations';
import Modal from '@/app/components/ui/Modal';
import {
  Loader2, Sparkles, CheckCircle, AlertTriangle,
  ExternalLink, Zap, Bookmark, BookmarkX, Eye, EyeOff,
  Target, TrendingUp, Brain, BarChart3, Award,
} from 'lucide-react';
import FilterBar from './FilterBar';
import RecommendationPanel from './RecommendationPanel';
// ✅ Fix: استخدام الأسماء الصح من services/admin/jobs.js
import { getJobsByLearningPath, fetchJobsFromN8N } from '@/services/admin/jobs';
import { useSavedJobs, useToggleSavedJob } from '@/app/hooks/useJobsQueries';
import MatchAnalysis from './Matchanalysis';
import Pagination from './Pagination';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const JOBS_PER_PAGE = 9;

const FEEDBACK_LABELS = {
  dismiss:    0,
  impression: 1,
  click:      2,
  save:       3,
  apply:      4,
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK: useFeedback
// ═══════════════════════════════════════════════════════════════════════════

function useFeedback(userSkills = []) {
  const sentImpressions = useRef(new Set());
  const pendingFeedback = useRef([]);

  const { mutate: sendFeedback } = useMutation({
    mutationFn: (data) => api.post('/feedback', data),
    onError: (err) => console.warn('[Feedback] failed:', err.message),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingFeedback.current.length > 0) {
        const batch = [...pendingFeedback.current];
        pendingFeedback.current = [];
        batch.forEach((data) => sendFeedback(data));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sendFeedback]);

  const track = useCallback((job, action, extra = {}) => {
    const jobId = job.jobId || job.id;
    if (!jobId) return;

    const impressionKey = `${jobId}-${action}`;
    if (action === 'impression' && sentImpressions.current.has(impressionKey)) return;
    if (action === 'impression') sentImpressions.current.add(impressionKey);

    const md = job.matchDetails || {};
    const feats = md.features || {};

    const payload = {
      userId: extra.userId || null,
      jobId,
      action,
      label: FEEDBACK_LABELS[action] ?? 0,
      score: job.score ?? null,
      userSkills,
      jobSkills: job.skills || [],
      retrievalScore: job.retrievalScore ?? job.rawScore ?? null,
      matchDetails: {
        skillOverlap: md.skillOverlap ?? feats.skillOverlap ?? 0,
        expMatch: md.expMatch ?? feats.expMatch ?? false,
        freshness: md.freshness ?? feats.freshness ?? 0,
        careerFit: md.careerFit ?? feats.careerFit ?? 0,
        learningGap: md.learningGap ?? feats.learningGap ?? 0,
        lpAlignment: md.lpAlignment ?? feats.lpAlignment ?? 0,
        userSkillDensity: md.userSkillDensity ?? feats.userSkillDensity ?? null,
        jobSkillDifficulty: md.jobSkillDifficulty ?? feats.jobSkillDifficulty ?? null,
        matchedSkills: md.matchedSkills ?? [],
        missingSkills: md.missingSkills ?? [],
        skillGapPct: md.skillGapPct ?? 0,
        features: {
          skillOverlap: feats.skillOverlap ?? md.skillOverlap ?? 0,
          freshness: feats.freshness ?? md.freshness ?? 0,
          lpAlignment: feats.lpAlignment ?? md.lpAlignment ?? 0,
          careerFit: feats.careerFit ?? md.careerFit ?? 0,
          readiness: feats.readiness ?? (md.learningGap != null ? Math.max(0, 1 - md.learningGap) : 0),
          userSkillDensity: feats.userSkillDensity ?? null,
          jobSkillDifficulty: feats.jobSkillDifficulty ?? null,
        },
        explanation: md.explanation ?? [],
      },
      timestamp: new Date().toISOString(),
      ...extra,
    };

    pendingFeedback.current.push(payload);
    if (['apply', 'save', 'dismiss'].includes(action)) {
      sendFeedback(payload);
    }
  }, [sendFeedback, userSkills]);

  return { track, sentImpressions };
}



// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK: useJobsSection — ✅ TanStack Query فقط، بدون Context
// ═══════════════════════════════════════════════════════════════════════════

function useJobsSection(learningPathId) {
  const queryClient = useQueryClient();

  const {
    recommendations,
    loading: recLoading,
    error: recError,
    meta,
    refetch: refetchRecommendations,
  } = useRecommendations();

  // ✅ Fix: استخدام getJobsByLearningPath بدل getAlljobsToStudentByLearningPathId
  const {
    data: allJobs = [],
    isLoading: allJobsLoading,
    isError: allJobsIsError,
    error: allJobsError,
    refetch: refetchAllJobs,
  } = useQuery({
    queryKey: ['all-jobs', learningPathId],
    queryFn: async () => {
      const res = await getJobsByLearningPath(learningPathId);
      const jobsArray = res?.data?.jobs ?? res?.data ?? res?.jobs ?? [];
      return Array.isArray(jobsArray) ? jobsArray : [];
    },
    enabled: !!learningPathId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: savedJobsData = [], isLoading: savedJobsLoading, refetch: refetchSavedJobs } = useSavedJobs();

  // Filter savedJobsData to only include those relevant to this learning path (or show all saved jobs if preferred. The user asked for "all jobs they saved" so showing all saved jobs is fine).

  const [filters, setFilters] = useState({
    search: '',
    minScore: '',
    jobType: '',
    maxMissingSkills: '',
    selectedSkills: [],
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (key === 'skillToggle') {
        const exists = prev.selectedSkills.includes(value);
        return {
          ...prev,
          selectedSkills: exists
            ? prev.selectedSkills.filter((s) => s !== value)
            : [...prev.selectedSkills, value],
        };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const availableSkills = useMemo(() => {
    const s = new Set();
    recommendations.forEach((j) => {
      j.matchedSkills?.forEach((skill) => s.add(skill));
      j.missingSkills?.forEach((skill) => s.add(skill));
    });
    return [...s].sort();
  }, [recommendations]);

  const filteredRecs = useMemo(() => {
    let arr = [...recommendations];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      arr = arr.filter(
        (j) => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }
    if (filters.minScore)        arr = arr.filter((j) => (j.score || 0) >= +filters.minScore);
    if (filters.jobType)         arr = arr.filter((j) => j.jobType === filters.jobType);
    if (filters.maxMissingSkills) arr = arr.filter((j) => (j.missingSkills?.length || 0) <= +filters.maxMissingSkills);
    if (filters.selectedSkills.length) {
      arr = arr.filter((j) => {
        const skills = [...(j.matchedSkills || []), ...(j.missingSkills || [])];
        return filters.selectedSkills.some((s) => skills.includes(s));
      });
    }
    return arr;
  }, [recommendations, filters]);

  return {
    allJobs,
    recommendations,
    filteredRecs,
    savedJobsData,
    meta,
    availableSkills,
    allJobsLoading,
    recLoading,
    savedJobsLoading,
    allJobsError: allJobsIsError ? allJobsError?.message || 'Failed to fetch jobs' : null,
    recError,
    refetchAllJobs,
    refetchRecommendations,
    refetchSavedJobs,
    updateFilter,
    filters,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: SkillComparisonBadge
// ═══════════════════════════════════════════════════════════════════════════

const SkillComparisonBadge = ({ userSkills, jobSkills, matchedSkills, missingSkills }) => {
  const matchedSet = new Set(matchedSkills || []);
  const missingSet = new Set(missingSkills || []);
  const jobSet     = new Set(jobSkills || []);
  const overlap    = matchedSet.size;
  const total      = jobSet.size || (matchedSet.size + missingSet.size);
  const pct        = total > 0 ? Math.round((overlap / total) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
          <Target size={14} /> Skill Analysis
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          pct >= 70 ? 'bg-green-100 text-green-700' :
          pct >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {pct}% Match
        </span>
      </div>

      {userSkills?.length > 0 && (
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Your Skills</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {userSkills.slice(0, 5).map((skill) => (
              <span key={skill} className={`px-1.5 py-0.5 text-[10px] rounded-md font-medium ${
                matchedSet.has(skill)
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {matchedSet.has(skill) && <CheckCircle size={8} className="inline mr-0.5" />}
                {skill}
              </span>
            ))}
            {userSkills.length > 5 && (
              <span className="px-1.5 py-0.5 text-[10px] text-gray-400">+{userSkills.length - 5}</span>
            )}
          </div>
        </div>
      )}

      {(jobSkills?.length > 0 || missingSkills?.length > 0) && (
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Job Requires</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {matchedSkills?.slice(0, 3).map((skill) => (
              <span key={skill} className="px-1.5 py-0.5 text-[10px] rounded-md font-medium bg-green-100 text-green-700 border border-green-200">
                <CheckCircle size={8} className="inline mr-0.5" />{skill}
              </span>
            ))}
            {missingSkills?.slice(0, 3).map((skill) => (
              <span key={skill} className="px-1.5 py-0.5 text-[10px] rounded-md font-medium bg-amber-100 text-amber-700 border border-amber-200">
                +{skill}
              </span>
            ))}
            {((matchedSkills?.length || 0) + (missingSkills?.length || 0)) > 6 && (
              <span className="px-1.5 py-0.5 text-[10px] text-gray-400">
                +{(matchedSkills?.length + missingSkills?.length) - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: ModelInsights
// ═══════════════════════════════════════════════════════════════════════════

const ModelInsights = ({ matchDetails }) => {
  const md    = matchDetails || {};
  const feats = md.features || {};

  const colorMap = {
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  bar: 'bg-green-500'  },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', bar: 'bg-yellow-500' },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    bar: 'bg-red-500'    },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   bar: 'bg-blue-500'   },
  };

  const insights = [
    md.skillOverlap != null && {
      icon: Target, label: 'Skill Overlap',
      value: `${Math.round(md.skillOverlap * 100)}%`,
      color: md.skillOverlap >= 0.5 ? 'green' : md.skillOverlap >= 0.2 ? 'yellow' : 'red',
      desc: `${md.matchedSkills?.length || 0} of ${(md.matchedSkills?.length || 0) + (md.missingSkills?.length || 0)} skills match`,
    },
    feats.lpAlignment != null && {
      icon: TrendingUp, label: 'Learning Path Fit',
      value: `${Math.round(feats.lpAlignment * 100)}%`,
      color: feats.lpAlignment >= 0.7 ? 'green' : feats.lpAlignment >= 0.4 ? 'yellow' : 'red',
      desc: 'How well this job aligns with your learning path',
    },
    feats.careerFit != null && {
      icon: Award, label: 'Career Fit',
      value: `${Math.round(feats.careerFit * 100)}%`,
      color: feats.careerFit >= 0.5 ? 'green' : 'yellow',
      desc: 'Title and experience level alignment',
    },
    md.learningGap != null && {
      icon: Brain, label: 'Readiness',
      value: `${Math.round((feats.readiness ?? Math.max(0, 1 - md.learningGap)) * 100)}%`,
      color: (feats.readiness ?? Math.max(0, 1 - md.learningGap)) >= 0.7 ? 'green' :
             (feats.readiness ?? Math.max(0, 1 - md.learningGap)) >= 0.4 ? 'yellow' : 'red',
      desc: `Learning gap: ${Math.round(md.learningGap * 100)}%`,
    },
    feats.freshness != null && {
      icon: Zap, label: 'Freshness',
      value: `${Math.round(feats.freshness * 100)}%`,
      color: feats.freshness >= 0.8 ? 'green' : 'yellow',
      desc: 'How recent is this job posting',
    },
    feats.userSkillDensity != null && {
      icon: BarChart3, label: 'Your Skill Density',
      value: `${Math.round(feats.userSkillDensity * 100)}%`,
      color: 'blue',
      desc: 'Breadth and depth of your skill set',
    },
    feats.jobSkillDifficulty != null && {
      icon: BarChart3, label: 'Job Difficulty',
      value: `${Math.round(feats.jobSkillDifficulty * 100)}%`,
      color: feats.jobSkillDifficulty >= 0.7 ? 'orange' : 'blue',
      desc: 'Complexity level of required skills',
    },
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mb-2">
        <Brain size={14} /> AI Model Insights
      </div>
      {insights.map((insight) => {
        const colors = colorMap[insight.color] || colorMap.blue;
        return (
          <div key={insight.label} className={`${colors.bg} border ${colors.border} rounded-lg p-2.5`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <insight.icon size={12} className={colors.text} />
                <span className={`text-xs font-medium ${colors.text}`}>{insight.label}</span>
              </div>
              <span className={`text-sm font-bold ${colors.text}`}>{insight.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: insight.value }} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{insight.desc}</p>
          </div>
        );
      })}

      {md.explanation?.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 mb-1">
            <Sparkles size={12} /> Why this job?
          </div>
          <ul className="space-y-1">
            {md.explanation.slice(0, 3).map((exp, i) => (
              <li key={i} className="text-[11px] text-purple-600 flex items-start gap-1">
                <span className="text-purple-400 mt-0.5">•</span>{exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: JobsSection
// ═══════════════════════════════════════════════════════════════════════════

const JobsSection = ({ learningPathId, currentUserId, userSkills = [] }) => {
  const [activeTab,      setActiveTab]      = useState('all');
  const [selectedJob,    setSelectedJob]    = useState(null);
  const [savedJobs,      setSavedJobs]      = useState(new Set());
  const [dismissedJobs,  setDismissedJobs]  = useState(new Set());

  const [allJobsPage,    setAllJobsPage]    = useState(1);
  const [recPage,        setRecPage]        = useState(1);
  const [recVisibleCount,setRecVisibleCount]= useState(JOBS_PER_PAGE);
  const [savedPage,      setSavedPage]      = useState(1);

  const toggleSaveMutation = useToggleSavedJob();

  const {
    allJobs, filteredRecs, savedJobsData, meta, availableSkills,
    allJobsLoading, recLoading, savedJobsLoading,
    allJobsError, recError,
    refetchAllJobs, refetchSavedJobs, updateFilter, filters,
  } = useJobsSection(learningPathId);

  // Initialize savedJobs Set from savedJobsData safely
  const savedJobIdsStr = savedJobsData ? savedJobsData.map(j => j.id || j.jobId).join(',') : '';
  
  useEffect(() => {
    if (savedJobsData) {
      setSavedJobs(new Set(savedJobsData.map(j => j.id || j.jobId)));
    }
  }, [savedJobIdsStr]);
  // ── Pagination ───────────────────────────────────────
  const allJobsTotalPages = Math.ceil(allJobs.length / JOBS_PER_PAGE);
  const recTotalPages     = Math.ceil(filteredRecs.length / JOBS_PER_PAGE);
  const savedTotalPages   = Math.ceil(savedJobsData.length / JOBS_PER_PAGE);
  const hasMoreRecs       = recVisibleCount < filteredRecs.length;

  const paginatedAllJobs = useMemo(() => {
    const start = (allJobsPage - 1) * JOBS_PER_PAGE;
    return allJobs.slice(start, start + JOBS_PER_PAGE);
  }, [allJobs, allJobsPage]);

  const paginatedRecs = useMemo(() => {
    const start = (recPage - 1) * JOBS_PER_PAGE;
    return filteredRecs.slice(start, start + recVisibleCount);
  }, [filteredRecs, recPage, recVisibleCount]);

  const paginatedSaved = useMemo(() => {
    const start = (savedPage - 1) * JOBS_PER_PAGE;
    return savedJobsData.slice(start, start + JOBS_PER_PAGE);
  }, [savedJobsData, savedPage]);

  // ── Feedback ─────────────────────────────────────────
  const { track } = useFeedback(userSkills);

  const handleImpression = useCallback((job) => track(job, 'impression', { userId: currentUserId }), [track, currentUserId]);
  const handleCardClick  = useCallback((job) => {
    track(job, 'impression', { userId: currentUserId });
    track(job, 'click',      { userId: currentUserId });
    setSelectedJob(job);
  }, [track, currentUserId]);
  const handleApply      = useCallback((job) => { track(job, 'apply', { userId: currentUserId }); if (job.applyLink) window.open(job.applyLink, '_blank', 'noopener,noreferrer'); }, [track, currentUserId]);

  const handleSave = useCallback((job) => {
    const jobId = job.jobId || job.id;
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) { 
        next.delete(jobId); 
      } else { 
        next.add(jobId); 
        track(job, 'save', { userId: currentUserId }); 
      }
      return next;
    });
    // Trigger actual API save/unsave
    toggleSaveMutation.mutate(jobId);
  }, [track, currentUserId, toggleSaveMutation]);

  const handleDismiss = useCallback((job) => {
    const jobId = job.jobId || job.id;
    setDismissedJobs((prev) => new Set(prev).add(jobId));
    track(job, 'dismiss', { userId: currentUserId });
  }, [track, currentUserId]);

  // ── Tab Handlers ──────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'all' && allJobs.length === 0) refetchAllJobs();
    if (tab === 'saved' && savedJobsData.length === 0) refetchSavedJobs();
    setAllJobsPage(1);
    setRecPage(1);
    setSavedPage(1);
    setRecVisibleCount(JOBS_PER_PAGE);
    setDismissedJobs(new Set());
  }, [allJobs.length, savedJobsData.length, refetchAllJobs, refetchSavedJobs]);

  const handleLoadMore = useCallback(() => setRecVisibleCount((prev) => prev + JOBS_PER_PAGE), []);

  // ── Derived ───────────────────────────────────────────
  const displayedJobs = activeTab === 'all' ? paginatedAllJobs : activeTab === 'saved' ? paginatedSaved : paginatedRecs;
  const isLoading     = activeTab === 'all' ? allJobsLoading : activeTab === 'saved' ? savedJobsLoading : recLoading;
  const errorMsg      = activeTab === 'all' ? allJobsError   : activeTab === 'saved' ? null : recError;
  const currentPage   = activeTab === 'all' ? allJobsPage    : activeTab === 'saved' ? savedPage : recPage;
  const totalPages    = activeTab === 'all' ? allJobsTotalPages : activeTab === 'saved' ? savedTotalPages : recTotalPages;

  const visibleJobs = useMemo(
    () => displayedJobs.filter((job) => !dismissedJobs.has(job.jobId || job.id)),
    [displayedJobs, dismissedJobs]
  );

  // ── Render ────────────────────────────────────────────
  return (
    <div className="my-12 flex flex-col gap-6 w-full">



      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { key: 'all',         label: 'All Jobs',         color: 'blue'   },
          { key: 'recommended', label: 'AI Recommended',   color: 'purple', icon: <Sparkles className="h-4 w-4" /> },
          { key: 'saved',       label: 'Saved Jobs',       color: 'blue',   icon: <Bookmark className="h-4 w-4" /> },
        ].map(({ key, label, color, icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === key
                ? `bg-white border-b-2 border-${color}-600 text-${color}-600`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Refresh button */}
      {(activeTab === 'all' || activeTab === 'saved') && (
        <div className="flex justify-end">
          <button
            onClick={() => activeTab === 'all' ? refetchAllJobs() : refetchSavedJobs()}
            disabled={activeTab === 'all' ? allJobsLoading : savedJobsLoading}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {(activeTab === 'all' ? allJobsLoading : savedJobsLoading) ? 'Loading...' : 'Refresh list'}
          </button>
        </div>
      )}

      {/* Recommendation Panel + Filters */}
      {activeTab === 'recommended' && (
        <>
          <RecommendationPanel meta={meta} totalJobs={filteredRecs.length} />
          <FilterBar filters={filters} onFilterChange={updateFilter} availableSkills={availableSkills} />
        </>
      )}

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        </div>
      )}
      {!isLoading && errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">❌ {errorMsg}</div>
      )}
      {!isLoading && !errorMsg && visibleJobs.length === 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-xl text-center">
          {activeTab === 'all' ? 'No jobs available.'
            : activeTab === 'saved' ? 'No saved jobs yet. Start exploring and save jobs you like!'
            : dismissedJobs.size > 0 ? 'All recommendations dismissed.'
            : 'No matching recommendations.'}
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && visibleJobs.length > 0 && (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {visibleJobs.map((job, idx) => {
            const jobId  = job.jobId || job.id;
            const isSaved = savedJobs.has(jobId);
            return (
              <div key={jobId || idx} className="relative">
                <JobCard
                  job={job}
                  userId={currentUserId}
                  userSkills={userSkills}
                  onViewDetails={() => handleCardClick(job)}
                  showMatchScore={activeTab === 'recommended'}
                  isSaved={isSaved}
                  onSave={() => handleSave(job)}
                  onDismiss={() => handleDismiss(job)}
                  onApply={() => handleApply(job)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !errorMsg && visibleJobs.length > 0 && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              if (activeTab === 'all') setAllJobsPage(page);
              else if (activeTab === 'saved') setSavedPage(page);
              else { setRecPage(page); setRecVisibleCount(JOBS_PER_PAGE); }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {activeTab === 'recommended' && hasMoreRecs && (
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 font-semibold rounded-xl border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Load More Recommendations
              <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                {filteredRecs.length - recVisibleCount} remaining
              </span>
            </button>
          )}

          <div className="text-xs text-gray-500">
            Showing {visibleJobs.length} of {activeTab === 'all' ? allJobs.length : activeTab === 'saved' ? savedJobsData.length : filteredRecs.length} jobs
            {dismissedJobs.size > 0 && ` • ${dismissedJobs.size} dismissed`}
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Match Analysis" maxWidth="2xl">
        {selectedJob && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
              <p className="text-gray-500 text-sm">{selectedJob.company} • {selectedJob.location}</p>
            </div>

            <SkillComparisonBadge
              userSkills={userSkills}
              jobSkills={selectedJob.skills}
              matchedSkills={selectedJob.matchDetails?.matchedSkills}
              missingSkills={selectedJob.matchDetails?.missingSkills}
            />

            <ModelInsights matchDetails={selectedJob.matchDetails} />

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between"><span>AI Score:</span><span className="font-mono font-bold">{selectedJob.score}%</span></div>
              <div className="flex justify-between"><span>Raw Score:</span><span className="font-mono">{selectedJob.rawScore?.toFixed(4) || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Rank:</span><span className="font-mono">#{selectedJob.rank}</span></div>
              {selectedJob.retrievalScore != null && (
                <div className="flex justify-between"><span>FAISS Similarity:</span><span className="font-mono">{selectedJob.retrievalScore.toFixed(4)}</span></div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleApply(selectedJob)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                <ExternalLink size={16} /> Apply Now
              </button>
              <button
                onClick={() => handleSave(selectedJob)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition border ${
                  savedJobs.has(selectedJob.jobId || selectedJob.id)
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Bookmark size={16} className={savedJobs.has(selectedJob.jobId || selectedJob.id) ? 'fill-blue-500' : ''} />
                {savedJobs.has(selectedJob.jobId || selectedJob.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobsSection;