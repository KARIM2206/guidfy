// components/RecommendationPanel.jsx
"use client";
import React from 'react';
import { Sparkles, TrendingUp, Target, Award } from 'lucide-react';

const RecommendationPanel = ({ meta, totalJobs }) => {
  if (!meta) return null;

  const stats = [
    { icon: Target, label: 'Your Progress', value: `${meta.progressPct || 0}%`, color: 'text-blue-600' },
    { icon: Award, label: 'Skills Acquired', value: meta.skillsCount || 0, color: 'text-emerald-600' },
    { icon: Sparkles, label: 'Recommended Jobs', value: totalJobs || 0, color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Learning Path', value: meta.lpTitle || '—', color: 'text-orange-600' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Recommendation Profile</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${stat.color.split('-')[1]}-50`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationPanel;