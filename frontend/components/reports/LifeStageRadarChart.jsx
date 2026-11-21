'use client';

import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const AREA_LABELS = {
  item1: 'Early Morning',
  item2: 'Attendance',
  item3: 'Participation',
  item4: 'Discipline',
  item5: 'Social',
  item6: 'Learning',
  item7: 'Fitness',
  item8: 'Skill Study',
  item9: 'Class Recap',
  item10: 'Screen Control',
  item11: 'Reflection',
  item12: 'Sleep Schedule',
};

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
        <p className="font-bold text-slate-100">{data.area}</p>
        <p className="text-indigo-400 font-extrabold text-sm">
          {data.percentage}% Balance
        </p>
      </div>
    );
  }
  return null;
};

export default function LifeStageRadarChart({ areaCompletionRates }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !areaCompletionRates) {
    return (
      <div className="h-80 flex items-center justify-center text-xs text-slate-400">
        Loading radar chart...
      </div>
    );
  }

  const radarData = Object.entries(areaCompletionRates).map(([key, ratio]) => {
    return {
      area: AREA_LABELS[key] || key,
      percentage: Math.round(ratio * 100),
    };
  });

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="area"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            stroke="#e2e8f0"
          />
          <Tooltip content={<CustomRadarTooltip />} />
          <Radar
            name="Lifestyle Balance"
            dataKey="percentage"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
