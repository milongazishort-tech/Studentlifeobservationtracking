import React from 'react';

export default function ChecklistItemCard({
  itemNumber,
  title,
  category,
  points,
  maxPoints,
  description,
  children,
  isOffDayDisabled = false,
}) {
  const categoryColors = {
    Academic: 'bg-blue-50 text-blue-700 border-blue-200',
    Personal: 'bg-purple-50 text-purple-700 border-purple-200',
    Physical: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Social: 'bg-amber-50 text-amber-700 border-amber-200',
    Skill: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const badgeColor = categoryColors[category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      className={`rounded-2xl border transition-all p-5 sm:p-6 ${
        isOffDayDisabled
          ? 'bg-slate-50/80 border-slate-200 opacity-60 pointer-events-none'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {itemNumber}
          </span>
          <h4 className="text-base font-bold text-slate-900 leading-tight">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {category && (
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
              {category}
            </span>
          )}
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
            {points ?? 0} / {maxPoints} pts
          </span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {isOffDayDisabled ? (
        <div className="py-2 text-xs font-semibold text-slate-500 italic">
          Excluded from today's scoring (University Off-Day).
        </div>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );
}
