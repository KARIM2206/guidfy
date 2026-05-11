// components/MatchAnalysis.jsx
import { CheckCircle, AlertTriangle, Zap, ExternalLink, BookOpen, X, TrendingUp } from 'lucide-react';

const FEATURE_LABELS = {
  skillOverlap: 'Skill Overlap',
  freshness:    'Freshness',
  lpAlignment:  'LP Alignment',
  careerFit:    'Career Fit',
  readiness:    'Readiness',
};

const FEATURE_COLORS = {
  skillOverlap: { bar: 'bg-purple-500',  text: 'text-purple-700',  bg: 'bg-purple-50'  },
  freshness:    { bar: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
  lpAlignment:  { bar: 'bg-indigo-500',  text: 'text-indigo-700',  bg: 'bg-indigo-50'  },
  careerFit:    { bar: 'bg-pink-500',    text: 'text-pink-700',    bg: 'bg-pink-50'    },
  readiness:    { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
};

// score 0-100 → color
function scoreColor(score) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 45) return 'text-amber-500';
  return 'text-red-500';
}

function scoreLabel(score) {
  if (score >= 70) return 'Strong Match';
  if (score >= 45) return 'Moderate Match';
  return 'Weak Match';
}

export default function MatchAnalysis({ job, userSkills = [], onClose }) {
  if (!job) return null;

  // ── FIX: score جاي من الباك normalized 0-100 ─────────────────────────
  const scorePercent = Math.round(job.score ?? 0);
  const gapPercent   = job.skillGapPct ?? 0;

  // skills اليوزر الكاملة (من meta.userSkills أو prop)
  const allUserSkills = userSkills.map(s => s.toLowerCase().trim());

  // job skills
  const jobSkills     = job.jobSkills     ?? [];
  const matchedSkills = job.matchedSkills ?? [];
  const missingSkills = job.missingSkills ?? [];

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
        <div className="flex-1 pr-3">
          <h3 className="text-base font-bold text-gray-900 leading-snug">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.company} • {job.location}</p>
        </div>
        <div className="text-center shrink-0">
          <div className={`text-3xl font-extrabold ${scoreColor(scorePercent)}`}>
            {scorePercent}%
          </div>
          <div className="text-xs text-gray-400 font-medium">{scoreLabel(scorePercent)}</div>
        </div>
      </div>

      {/* ── User Skills Overview ─────────────────────────────────────── */}
      {allUserSkills.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen size={13} />
            Your Skills ({allUserSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {allUserSkills.map(skill => {
              const isMatched = matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium border ${
                    isMatched
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {skill}
                  {isMatched && <span className="ml-1">✓</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Job Skills + Match ───────────────────────────────────────── */}
      {jobSkills.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={13} />
            Job Requires ({jobSkills.length} skills)
          </h4>

          {/* Matched */}
          {matchedSkills.length > 0 && (
            <div>
              <p className="text-xs text-green-600 font-semibold mb-1.5 flex items-center gap-1">
                <CheckCircle size={12} /> You know ({matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg font-medium border border-green-200 flex items-center gap-1"
                  >
                    <CheckCircle size={11} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs text-amber-600 font-semibold mb-1.5 flex items-center gap-1">
                <AlertTriangle size={12} />
                To Learn ({missingSkills.length})
                <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px]">
                  Gap {gapPercent}%
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium border border-amber-200 flex items-center gap-1"
                  >
                    <AlertTriangle size={11} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Features Breakdown ──────────────────────────────────────── */}
      {job.features && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(job.features).map(([key, value]) => {
            const pct    = Math.round((value ?? 0) * 100);
            const colors = FEATURE_COLORS[key] ?? FEATURE_COLORS.readiness;
            const label  = FEATURE_LABELS[key]  ?? key.replace(/([A-Z])/g, ' $1').trim();
            return (
              <div key={key} className={`${colors.bg} p-3 rounded-xl`}>
                <div className={`text-xs font-semibold ${colors.text} mb-1.5`}>{label}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* ── FIX: عرض % صح ─────────────────────────────── */}
                  <span className={`text-xs font-bold ${colors.text} w-8 text-right`}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Why this job ────────────────────────────────────────────── */}
      {job.explanation?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap size={13} />
            Why this job?
          </h4>
          <ul className="space-y-1.5">
            {job.explanation.map((line, idx) => (
              <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm"
        >
          <ExternalLink size={16} />
          Apply Now
        </a>
        <button
          onClick={onClose}
          className="px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm flex items-center gap-1.5"
        >
          <X size={15} />
          Close
        </button>
      </div>

    </div>
  );
}