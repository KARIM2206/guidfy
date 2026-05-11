"use client";

import React, { useState, useEffect, useMemo } from 'react';
import JobCard from './JobCard';
import { useRecommendations } from '@/app/hooks/useRecommendations';
import Modal from '@/app/components/ui/Modal';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, X, ExternalLink, TrendingUp, BookOpen, Award, Zap } from 'lucide-react';
import FilterBar from './FilterBar';
import RecommendationPanel from './RecommendationPanel';
import { getAlljobsToStudentByLearningPathId, getJobsFromN8N } from '@/services/admin/jobs';
import MatchAnalysis from './Matchanalysis';

const JobsSection = ({ learningPathId }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  // All Jobs state
  const [allJobs, setAllJobs] = useState([]);
  const [allJobsLoading, setAllJobsLoading] = useState(false);
  const [allJobsError, setAllJobsError] = useState(null);

  // N8N state
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nError, setN8nError] = useState(null);
  const [n8nResult, setN8nResult] = useState(null);

  // Recommendations
  const { recommendations, loading: recLoading, error: recError, meta } = useRecommendations();

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    minScore: '',
    jobType: '',
    maxMissingSkills: '',
    selectedSkills: [],
  });

  // Fetch All Jobs
  const fetchAllJobs = async () => {
    setAllJobsLoading(true);
    setAllJobsError(null);
    try {
      const res = await getAlljobsToStudentByLearningPathId({
        learningPathId,
        page: 1,
        limit: 50
      });
      const jobsArray = res?.jobs || res?.data || [];
      setAllJobs(Array.isArray(jobsArray) ? jobsArray : []);
    } catch (err) {
      setAllJobsError(err?.message || 'Failed to fetch jobs');
      setAllJobs([]);
    } finally {
      setAllJobsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all' && allJobs.length === 0) {
      fetchAllJobs();
    }
  }, [activeTab]);

  // N8N Refresh
  const handleFetchFromN8N = async () => {
    setN8nLoading(true);
    setN8nError(null);
    setN8nResult(null);
    try {
      const result = await getJobsFromN8N({
        learningPathId,
        jobTitle: 'Frontend Developer',
      });
      setN8nResult(result);
      await fetchAllJobs();
    } catch (err) {
      setN8nError(err?.message || 'Failed to fetch jobs');
    } finally {
      setN8nLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    if (key === 'skillToggle') {
      setFilters(prev => ({
        ...prev,
        selectedSkills: prev.selectedSkills.includes(value)
          ? prev.selectedSkills.filter(s => s !== value)
          : [...prev.selectedSkills, value]
      }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  // Filter Recommendations
  const availableSkills = useMemo(() => {
    const s = new Set();
    recommendations.forEach(j => {
      j.matchedSkills?.forEach(skill => s.add(skill));
      j.missingSkills?.forEach(skill => s.add(skill));
    });
    return [...s].sort();
  }, [recommendations]);

  const filteredRecs = useMemo(() => {
    let arr = [...recommendations];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      arr = arr.filter(j => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q));
    }
    if (filters.minScore) arr = arr.filter(j => (j.score || 0) >= +filters.minScore);
    if (filters.jobType) arr = arr.filter(j => j.jobType === filters.jobType);
    if (filters.maxMissingSkills) arr = arr.filter(j => (j.missingSkills?.length || 0) <= +filters.maxMissingSkills);
    if (filters.selectedSkills.length) {
      arr = arr.filter(j => {
        const skills = [...(j.matchedSkills || []), ...(j.missingSkills || [])];
        return filters.selectedSkills.some(s => skills.includes(s));
      });
    }
    return arr;
  }, [recommendations, filters]);

  // Jobs to display
  const displayedJobs = activeTab === 'all' ? allJobs : filteredRecs;
  const isLoading = activeTab === 'all' ? allJobsLoading : recLoading;
  const errorMsg = activeTab === 'all' ? allJobsError : recError;

  // Render Match Details Modal Content
  const renderMatchDetails = (job) => {
    if (!job) return null;

    const scorePercent = Math.round((job.score || 0) );
    const gapPercent = job.skillGapPct || 0;
console.log(scorePercent,'score percent');

    return (
      <div className="space-y-6">
        {/* Header with Score */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{scorePercent}%</div>
            <div className="text-xs text-gray-500 font-medium">Match Score</div>
          </div>
        </div>

        {/* Features Breakdown */}
        {job.features && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(job.features).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.round((value || 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{Math.round((value || 0) )}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Matched Skills */}
        {job.matchedSkills?.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Matched Skills ({job.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.matchedSkills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg font-medium border border-green-200 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {job.missingSkills?.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Missing Skills ({job.missingSkills.length}) 
              <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Gap: {gapPercent}%
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.missingSkills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg font-medium border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {job.explanation?.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Zap size={16} />
              Why this job?
            </h4>
            <ul className="space-y-2">
              {job.explanation.map((line, idx) => (
                <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ExternalLink size={18} />
            Apply Now
          </a>
          <button
            onClick={() => setSelectedJob(null)}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="my-12 flex flex-col gap-6 w-full">
      {/* N8N Fetch Bar */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="text-sm text-blue-700">
          {n8nResult ? (
            <span>✅ Saved <strong>{n8nResult.totalSaved}</strong> new jobs {n8nResult.totalSkipped > 0 && `(${n8nResult.totalSkipped} skipped)`}</span>
          ) : (
            <span>Fetch latest jobs from the web</span>
          )}
          {n8nError && <span className="text-red-600 ml-2">❌ {n8nError}</span>}
        </div>
        <button
          onClick={handleFetchFromN8N}
          disabled={n8nLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {n8nLoading ? <><Loader2 className="animate-spin h-4 w-4" /> Fetching...</> : '🔄 Refresh Jobs'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition ${activeTab === 'all' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'recommended' ? 'bg-white border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Sparkles className="h-4 w-4" />
          Recommended for You
        </button>
      </div>

      {/* All Jobs: refresh button */}
      {activeTab === 'all' && (
        <div className="flex justify-end">
          <button
            onClick={fetchAllJobs}
            disabled={allJobsLoading}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {allJobsLoading ? 'Loading...' : 'Refresh list'}
          </button>
        </div>
      )}

      {/* Recommendation Panel */}
      {activeTab === 'recommended' && <RecommendationPanel meta={meta} totalJobs={filteredRecs.length} />}

      {/* Filter Bar */}
      {activeTab === 'recommended' && (
        <FilterBar filters={filters} onFilterChange={updateFilter} availableSkills={availableSkills} />
      )}

      {/* Loading, Error, Empty states */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        </div>
      )}
      {!isLoading && errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">❌ {errorMsg}</div>
      )}
      {!isLoading && !errorMsg && displayedJobs.length === 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-xl text-center">
          {activeTab === 'all' ? 'No jobs available.' : 'No matching recommendations.'}
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && displayedJobs.length > 0 && (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {displayedJobs.map((job, idx) => (
            <JobCard
              key={job.jobId || job.id || idx}
              job={job}
              onViewDetails={(jobData) => setSelectedJob(jobData)}
              showMatchScore={activeTab === 'recommended'}
            />
          ))}
        </div>
      )}

      {/* Match Details Modal */}
      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        title={selectedJob ? `Match Analysis` : ''}
        maxWidth="2xl"
      >
        {selectedJob && <MatchAnalysis job={selectedJob} userSkills={meta.userSkills || user?.skills || []} onClose={() => setSelectedJob(null)} />}
      </Modal>
    </div>
  );
};

export default JobsSection;