import React from 'react';
import { Award, Sparkles, ShieldCheck } from 'lucide-react';

export default function LifeStageCard({ stage, title, description, lifeScore }) {
  const getStageTheme = (s) => {
    if (s >= 9) {
      return {
        bg: 'from-emerald-600 via-teal-600 to-emerald-700',
        badge: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30',
        pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (s >= 7) {
      return {
        bg: 'from-indigo-600 via-indigo-700 to-violet-700',
        badge: 'bg-indigo-400/20 text-indigo-100 border-indigo-400/30',
        pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    }
    if (s >= 5) {
      return {
        bg: 'from-blue-600 via-sky-600 to-indigo-600',
        badge: 'bg-blue-400/20 text-blue-100 border-blue-400/30',
        pill: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    if (s >= 3) {
      return {
        bg: 'from-amber-600 via-amber-700 to-orange-700',
        badge: 'bg-amber-400/20 text-amber-100 border-amber-400/30',
        pill: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      bg: 'from-rose-600 via-rose-700 to-red-700',
      badge: 'bg-rose-400/20 text-rose-100 border-rose-400/30',
      pill: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  };

  const theme = getStageTheme(stage || 1);

  return (
    <div
      className={`rounded-3xl bg-gradient-to-r ${theme.bg} p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
              Official Classification
            </span>
            <h4 className="text-sm font-bold text-white/95">
              Life Stage {stage} of 10
            </h4>
          </div>
        </div>

        <span className={`self-start sm:self-auto px-3.5 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
          Score: {lifeScore}%
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {title || 'Life Stage Classification'}
        </h2>
        <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
          {description ||
            'Reflects your balance across academic, physical, personal discipline, skill study, and social connectivity.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-white/80">
        <ShieldCheck className="w-4 h-4 text-white" />
        <span>Non-judgmental feedback based on 30 days of consistent observation.</span>
      </div>
    </div>
  );
}
