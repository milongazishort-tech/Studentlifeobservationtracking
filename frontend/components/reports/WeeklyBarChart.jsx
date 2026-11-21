'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
        <p className="font-bold text-slate-100">{data.fullName}</p>
        <p className="text-indigo-400 font-extrabold text-sm">
          {data.percentage}% Completion
        </p>
        <p className="text-slate-400 text-[10px]">Ratio: {data.ratio.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyBarChart({ areaBreakdown }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !areaBreakdown) {
    return <div className="h-72 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>;
  }

  const chartData = Object.entries(areaBreakdown).map(([key, ratio]) => {
    const pct = Math.round(ratio * 100);
    return {
      key,
      name: AREA_LABELS[key] || key,
      fullName: AREA_LABELS[key] || key,
      ratio,
      percentage: pct,
    };
  });

  const getBarColor = (pct) => {
    if (pct >= 80) return '#10b981'; // emerald
    if (pct >= 60) return '#6366f1'; // indigo
    if (pct >= 40) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  return (
    <div className="w-full h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={50}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
