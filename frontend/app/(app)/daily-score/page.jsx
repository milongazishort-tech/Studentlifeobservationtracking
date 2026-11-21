'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import {
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Edit3,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';

export default function DailyScorePage() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      setIsLoading(true);
      const [scoreRes, cycleRes] = await Promise.all([
        api.get('/scores/today'),
        api.get('/cycles/active'),
      ]);

      setScoreData(scoreRes.data.data);
      setCycleData(cycleRes.data.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 'NO_ENTRY_TODAY') {
        router.replace('/checklist');
      } else if (err.response?.data?.error?.code === 'NO_ACTIVE_CYCLE') {
        router.replace('/cycle/setup');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to fetch today&apos;s score.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-slate-500 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Calculating your daily score...</h3>
        <p className="text-xs text-slate-400">Processing all 12 holistic life dimensions</p>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-red-600 mb-4">{error || 'No score data found.'}</p>
        <Link href="/checklist">
          <Button variant="primary" size="md">
            Go to Daily Checklist
          </Button>
        </Link>
      </div>
    );
  }

  const { totalScore, achievedPoints, maxAvailablePoints, scores, dayNumber } = scoreData;
  const isOffDay = maxAvailablePoints === 82;
  const currentStreak = cycleData?.currentStreak || 0;

  // Score tier color
  const getScoreColor = (pct) => {
    if (pct >= 85) return { ring: 'text-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Exceptional Balance' };
    if (pct >= 70) return { ring: 'text-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Disciplined & Strong' };
    if (pct >= 50) return { ring: 'text-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Moderate Routine' };
    return { ring: 'text-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', label: 'Needs Improvement' };
  };

  const tier = getScoreColor(totalScore);

  const itemMeta = [
    { key: 'item1', label: 'Early Morning Wake-up', max: 8, category: 'Personal' },
    { key: 'item2', label: 'University Attendance', max: isOffDay ? 0 : 10, category: 'Academic', offDaySkip: isOffDay },
    { key: 'item3', label: 'Class Participation Rate', max: isOffDay ? 0 : 8, category: 'Academic', offDaySkip: isOffDay },
    { key: 'item4', label: 'Personal Discipline & Order', max: 8, category: 'Personal' },
    { key: 'item5', label: 'Social Interactions', max: 6, category: 'Social' },
    { key: 'item6', label: 'Daily Learning Note', max: 10, category: 'Academic' },
    { key: 'item7', label: 'Physical Activity & Fitness', max: 10, category: 'Physical' },
    { key: 'item8', label: 'Skill Development & Study', max: 10, category: 'Skill' },
    { key: 'item9', label: 'Coursework & Lecture Recap', max: 10, category: 'Academic' },
    { key: 'item10', label: 'Social Media Self-Control', max: 6, category: 'Personal' },
    { key: 'item11', label: 'Self-Reflection Journal', max: 8, category: 'Personal' },
    { key: 'item12', label: 'Sleeping on Target Time', max: 6, category: 'Physical' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Score Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 mb-6">
          <Calendar className="w-3.5 h-3.5" />
          <span>Day {dayNumber} Result</span>
          {isOffDay && (
            <span className="ml-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
              Off-Day (82 Max Pts)
            </span>
          )}
        </div>

        {/* Circular Percentage Gauge */}
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className={tier.ring}
              strokeWidth="10"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * Math.min(100, totalScore)) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              {totalScore}%
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Daily Score
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tier.bg} ${tier.text}`}>
            {tier.label}
          </span>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            You achieved <span className="font-extrabold text-slate-900">{achievedPoints}</span> out of{' '}
            <span className="font-extrabold text-slate-900">{maxAvailablePoints}</span> available points.
          </p>
        </div>

        {/* Streak Celebration Pill */}
        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-extrabold text-amber-950">
              {currentStreak} Day Observation Streak
            </p>
            <p className="text-[11px] text-amber-700">
              Consistency builds life-long momentum. Keep going!
            </p>
          </div>
        </div>
      </div>

      {/* Itemized 12-Item Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-indigo-600" />
          Itemized Point Breakdown (12 Areas)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {itemMeta.map((item, idx) => {
            const earned = scores ? scores[item.key] ?? 0 : 0;
            const isFull = item.max > 0 && earned >= item.max;
            const isZero = earned === 0;

            if (item.offDaySkip) {
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs"
                >
                  <span className="truncate">{idx + 1}. {item.label}</span>
                  <span className="font-semibold italic">Off-Day (Excluded)</span>
                </div>
              );
            }

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  {isFull ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isZero ? (
                    <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      ~
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {idx + 1}. {item.label}
                  </span>
                </div>

                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                    isFull
                      ? 'bg-emerald-50 text-emerald-700'
                      : isZero
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {earned} / {item.max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link href="/checklist" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full">
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit Today&apos;s Entry
          </Button>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/weekly/1" className="flex-1 sm:flex-initial">
            <Button variant="secondary" size="md" className="w-full">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Weekly Analytics
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="md" className="w-full">
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
