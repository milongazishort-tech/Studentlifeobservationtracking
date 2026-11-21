'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTrendTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-0.5 shadow-lg">
        <p className="font-semibold text-slate-300">{data.week}</p>
        <p className="text-indigo-400 font-extrabold text-sm">
          {data.score}% Avg Score
        </p>
      </div>
    );
  }
  return null;
};

export default function ProgressTrendChart({ progressTrend }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !progressTrend || progressTrend.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        No trend data available.
      </div>
    );
  }

  const chartData = progressTrend.map((entry) => ({
    week: entry.week || `Week ${entry.weekNumber}`,
    score: entry.averageScore ?? entry.score ?? 0,
  }));

  return (
    <div className="w-full h-64 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
          <Tooltip content={<CustomTrendTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
