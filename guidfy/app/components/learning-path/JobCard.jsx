'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, Heart, Bookmark,
  Share2, Sparkles, CheckCircle, X, ExternalLink,
  Target, TrendingUp, Brain, Award, Zap, BarChart3,
} from 'lucide-react';
import { useJobFeedback } from '../../hooks/Usejobfeedback';
import { useToggleSavedJob } from '../../hooks/useJobsQueries';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: timeAgo
// ═══════════════════════════════════════════════════════════════════════════

const timeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const postedTime = new Date(timestamp).getTime();
  if (isNaN(postedTime)) return 'Invalid date';
  const diff = Date.now() - postedTime;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: MatchScoreBadge
// ═══════════════════════════════════════════════════════════════════════════

const MatchScoreBadge = ({ score }) => {
  const color =
    score >= 75 ? 'from-emerald-500 to-green-400' :
    score >= 50 ? 'from-blue-500 to-indigo-400' :
    'from-amber-500 to-orange-400';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r ${color}
                  text-white text-xs font-bold rounded-full shadow-sm`}
    >
      <Sparkles size={11} />
      {Math.round(score)}% match
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: SkillPill
// ═══════════════════════════════════════════════════════════════════════════

const SkillPill = ({ skill, type }) => {
  if (type === 'matched') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700
                       border border-emerald-200 text-[11px] rounded-full font-medium">
        <CheckCircle size={9} />
        {skill}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700
                     border border-amber-200 text-[11px] rounded-full font-medium">
      + {skill}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: InsightBar — شريط مؤشر واحد
// ═══════════════════════════════════════════════════════════════════════════

const InsightBar = ({ icon: Icon, label, value, color }) => {
  const colors = {
    green:  { bar: 'bg-emerald-500', text: 'text-emerald-600' },
    blue:   { bar: 'bg-blue-500',    text: 'text-blue-600'    },
    amber:  { bar: 'bg-amber-500',   text: 'text-amber-600'   },
    red:    { bar: 'bg-red-500',     text: 'text-red-600'     },
    purple: { bar: 'bg-purple-500',  text: 'text-purple-600'  },
  }[color] || { bar: 'bg-blue-500', text: 'text-blue-600' };

  const pct = Math.round(value * 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon size={12} className="text-gray-400 shrink-0" />
      <span className="text-gray-500 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`${colors.text} font-semibold w-8 text-right shrink-0`}>{pct}%</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: HoverPanel — الموديل اللي بيظهر على اليمين فوق
// ═══════════════════════════════════════════════════════════════════════════

const HoverPanel = ({ job, userSkills }) => {
  const md = job.matchDetails || {};
  const feats = md.features || {};

  const matchedSkills = md.matchedSkills || [];
  const missingSkills = md.missingSkills || [];
  const total = matchedSkills.length + missingSkills.length;
  const overlapPct = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 0;

  const bars = [
    feats.skillOverlap   != null && { icon: Target,    label: 'Skill overlap',   value: feats.skillOverlap,   color: feats.skillOverlap >= 0.5   ? 'green'  : 'amber' },
    feats.lpAlignment    != null && { icon: TrendingUp, label: 'Learning path',   value: feats.lpAlignment,    color: feats.lpAlignment >= 0.6    ? 'blue'   : 'amber' },
    feats.careerFit      != null && { icon: Award,      label: 'Career fit',      value: feats.careerFit,      color: feats.careerFit >= 0.5      ? 'green'  : 'amber' },
    feats.readiness      != null && { icon: Brain,      label: 'Readiness',       value: feats.readiness,      color: feats.readiness >= 0.6      ? 'purple' : 'red'   },
    feats.freshness      != null && { icon: Zap,        label: 'Freshness',       value: feats.freshness,      color: feats.freshness >= 0.7      ? 'green'  : 'amber' },
    feats.userSkillDensity != null && { icon: BarChart3, label: 'Skill density', value: feats.userSkillDensity, color: 'blue' },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 8, scale: 0.97 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 8,  scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-0 left-full ml-3 w-72 z-50
                 bg-white border border-gray-200 rounded-2xl shadow-2xl
                 overflow-hidden pointer-events-auto"
      style={{ minWidth: '17rem' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3">
        <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1">
          Match Analysis
        </p>
        <div className="flex items-center justify-between">
          <p className="text-white/80 text-xs truncate max-w-[160px]">{job.title}</p>
          <span className="text-white font-bold text-lg">{Math.round(job.score ?? 0)}%</span>
        </div>
        {/* Overall bar */}
        <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.round(job.score ?? 0)}%` }}
          />
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">

        {/* Skill summary */}
        {total > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Skill match — {overlapPct}%
            </p>
            {matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {matchedSkills.slice(0, 4).map((s) => (
                  <SkillPill key={s} skill={s} type="matched" />
                ))}
                {matchedSkills.length > 4 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{matchedSkills.length - 4}
                  </span>
                )}
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 3).map((s) => (
                  <SkillPill key={s} skill={s} type="missing" />
                ))}
                {missingSkills.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{missingSkills.length - 3} to learn
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {bars.length > 0 && total > 0 && (
          <div className="border-t border-gray-100" />
        )}

        {/* AI Insight bars */}
        {bars.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <Brain size={10} className="text-violet-500" />
              AI Insights
            </p>
            <div className="space-y-2">
              {bars.map((b) => (
                <InsightBar key={b.label} {...b} />
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {md.explanation?.length > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <div className="bg-violet-50 rounded-xl p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-violet-500 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles size={10} />
                Why this job?
              </p>
              <ul className="space-y-1">
                {md.explanation.slice(0, 3).map((exp, i) => (
                  <li key={i} className="text-[11px] text-violet-700 flex items-start gap-1.5">
                    <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Raw scores */}
        {(job.rawScore != null || job.rank != null) && (
          <>
            <div className="border-t border-gray-100" />
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {job.score     != null && <div className="bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between"><span className="text-gray-400">AI Score</span><span className="font-mono font-bold text-gray-700">{job.score}%</span></div>}
              {job.rawScore  != null && <div className="bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between"><span className="text-gray-400">Raw</span><span className="font-mono text-gray-700">{job.rawScore?.toFixed(3)}</span></div>}
              {job.rank      != null && <div className="bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between"><span className="text-gray-400">Rank</span><span className="font-mono text-gray-700">#{job.rank}</span></div>}
              {job.retrievalScore != null && <div className="bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between"><span className="text-gray-400">FAISS</span><span className="font-mono text-gray-700">{job.retrievalScore?.toFixed(3)}</span></div>}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: JobCard — v4.2
// ═══════════════════════════════════════════════════════════════════════════

const JobCard = ({
  job,
  onViewDetails,
  showMatchScore,
  userId,
  userSkills = [],
  isHovered = false,          
  onMouseEnter,               
  onMouseLeave,
  isSaved = false,
  onSave,               
}) => {
  const [isLiked,      setIsLiked]      = useState(false);
  const [isDismissed,  setIsDismissed]  = useState(false);

  const { cardRef, onClickJob, onApply, onDismiss, onShare } =
    useJobFeedback(job, userId, userSkills);

  /* ── handlers ── */
  const handleCardClick = () => { onClickJob(); onViewDetails?.(job); };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((p) => { if (!p) onClickJob(); return !p; });
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (onSave) onSave(job);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare();
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description?.slice(0, 100), url: job.applyLink || window.location.href });
    } else {
      navigator.clipboard?.writeText(job.applyLink || window.location.href);
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss();
    setIsDismissed(true);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    onApply();
    if (job.applyLink) window.open(job.applyLink, '_blank', 'noopener,noreferrer');
  };

  const matchDetails = job?.matchDetails || {};
  const features     = matchDetails.features || {};

  /* ── dismissed animation ── */
  if (isDismissed) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.9, height: 0, margin: 0, padding: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        />
      </AnimatePresence>
    );
  }

  return (
    <div
      className="relative h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── الكارد الأساسي ── */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className={`relative bg-white border rounded-2xl overflow-visible
                    transition-all duration-300 p-5 flex flex-col h-full cursor-pointer
                    ${isHovered
                      ? 'border-violet-300 shadow-xl shadow-violet-100/60'
                      : 'border-gray-200 hover:border-blue-200 hover:shadow-lg'
                    }`}
        onClick={handleCardClick}
      >
        {/* زر الرفض */}
        {showMatchScore && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleDismiss}
            className={`absolute top-3 left-3 z-20 p-1.5 rounded-full bg-gray-100
                        hover:bg-red-100 hover:text-red-500 text-gray-400
                        transition-all duration-200
                        ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            title="Not interested"
          >
            <X size={13} />
          </motion.button>
        )}

        {/* شارة Featured */}
        {job.isFeatured && (
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="absolute top-3 left-10 z-10"
          >
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600
                             text-white text-[10px] font-bold rounded-full shadow">
              Featured
            </span>
          </motion.div>
        )}

        {/* شارة Match Score */}
        {showMatchScore && job.score !== undefined && (
          <div className="absolute top-3 right-3 z-10">
            <MatchScoreBadge score={job.score} />
          </div>
        )}

        {/* ── معلومات الوظيفة ── */}
        <div className="mb-3 flex-grow">
          {/* عنوان الوظيفة */}
          <h2 className={`text-base font-bold mb-1.5 line-clamp-2 transition-colors leading-snug
                          ${showMatchScore ? 'pr-20' : ''}
                          ${isHovered ? 'text-violet-700' : 'text-gray-900'}`}>
            {job.title}
          </h2>

          {/* الشركة والموقع */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2 flex-wrap">
            <Briefcase size={13} className="shrink-0" />
            <span className="font-medium text-gray-700">{job.company}</span>
            <span className="text-gray-300">•</span>
            <MapPin size={13} className="shrink-0" />
            <span>{job.location}</span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {job.jobType && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded-md font-medium">
                {job.jobType.replace('_', ' ')}
              </span>
            )}
            {job.experienceLevel && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[11px] rounded-md font-medium">
                {job.experienceLevel}
              </span>
            )}
          </div>

          {/* الوصف */}
          <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* ── Skills (لما يكون Recommended) ── */}
        {showMatchScore && (matchDetails.matchedSkills?.length > 0 || matchDetails.missingSkills?.length > 0) && (
          <div className="mb-3 space-y-1.5">
            {matchDetails.matchedSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchDetails.matchedSkills.slice(0, 3).map((s) => (
                  <SkillPill key={s} skill={s} type="matched" />
                ))}
                {matchDetails.matchedSkills.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{matchDetails.matchedSkills.length - 3}
                  </span>
                )}
              </div>
            )}
            {matchDetails.missingSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchDetails.missingSkills.slice(0, 2).map((s) => (
                  <SkillPill key={s} skill={s} type="missing" />
                ))}
                {matchDetails.missingSkills.length > 2 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{matchDetails.missingSkills.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* LP Alignment bar (لو موجودة) */}
        {showMatchScore && features.lpAlignment != null && (
          <div className="mb-3">
            <InsightBar
              icon={TrendingUp}
              label="Learning path"
              value={features.lpAlignment}
              color={features.lpAlignment >= 0.6 ? 'blue' : 'amber'}
            />
          </div>
        )}

        {/* سبب التوصية */}
        {showMatchScore && matchDetails.explanation?.length > 0 && (
          <p className="text-[11px] text-gray-400 italic mb-3 line-clamp-2">
            {matchDetails.explanation[0]}
          </p>
        )}

        {/* ── وقت النشر ── */}
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-3">
          <Clock size={12} />
          <span>
            {timeAgo(job?.postedAt) === 'Unknown'
              ? timeAgo(job?.createdAt)
              : timeAgo(job?.postedAt)}
          </span>
        </div>

        {/* ── Action bar ── */}
        <div
          className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bookmark */}
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
              title={isSaved ? "Unsave Job" : "Save Job"}
            >
              <Bookmark size={16} className={isSaved ? 'fill-blue-500' : ''} />
            </motion.button>
          </div>

          {/* CTA */}
          {showMatchScore ? (
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCardClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600
                         to-indigo-600 text-white text-xs font-semibold rounded-lg
                         hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles size={13} />
              View Match
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-500
                         to-blue-600 text-white text-xs font-semibold rounded-lg
                         hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              Apply Now
              <ExternalLink size={12} />
            </motion.button>
          )}
        </div>

        {/* حدود hover */}
        <div
          className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300
                      ${isHovered ? 'border-violet-300' : 'border-transparent'}`}
        />
      </motion.div>

      {/* ── Hover Panel على اليمين فوق ── */}
{/*       
      <AnimatePresence>
        {isHovered && showMatchScore && job.matchDetails && (
          <HoverPanel job={job} userSkills={userSkills} />
        )}
      </AnimatePresence> */}

    </div>
  );
};

export default JobCard;