'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import WeeklyBarChart from '@/components/reports/WeeklyBarChart';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Award,
} from 'lucide-react';

function WeeklyReportContent() {
  const router = useRouter();
  const params = useParams();
  const weekNumber = parseInt(params?.week || '1', 10);

  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');
  const [error, setError] = useState('');

  const weeks = [
    { num: 1, label: 'Week 1', days: 'Days 1–7' },
    { num: 2, label: 'Week 2', days: 'Days 8–14' },
    { num: 3, label: 'Week 3', days: 'Days 15–21' },
    { num: 4, label: 'Week 4', days: 'Days 22–28' },
    { num: 5, label: 'Final Stretch', days: 'Days 29–30' },
  ];

  useEffect(() => {
    fetchWeeklyData();
  }, [weekNumber]);

  const fetchWeeklyData = async () => {
    try {
      setIsLoading(true);
      setIsLocked(false);
      setError('');
      const res = await api.get(`/weekly/${weekNumber}`);
      setSummaryData(res.data.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 'WEEK_NOT_UNLOCKED') {
        setIsLocked(true);
        setLockedMessage(
          err.response?.data?.error?.message ||
            `Week ${weekNumber} analytics are locked. Complete this week's checklist to view the report.`
        );
      } else if (err.response?.data?.error?.code === 'NO_ACTIVE_CYCLE') {
        router.replace('/cycle/setup');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to fetch weekly summary.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Self-Observation Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Week {weekNumber} Performance
          </h2>
        </div>

        <Link href="/monthly">
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            <Award className="w-4 h-4 mr-1.5 text-violet-600" />
            <span>30-Day Life Stage</span>
          </Button>
        </Link>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {weeks.map((w) => {
          const isActive = w.num === weekNumber;
          return (
            <Link
              key={w.num}
              href={`/weekly/${w.num}`}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{w.label}</span>
              <span className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                ({w.days})
              </span>
            </Link>
          );
        })}
      </div>

      {error && <Alert type="error" title="Error" message={error} />}

      {/* Locked State Card */}
      {isLocked && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Week {weekNumber} Report Locked
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {lockedMessage}
          </p>
          <div className="pt-2">
            <Link href="/checklist">
              <Button variant="primary" size="md">
                <span>Go to Daily Checklist</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Unlocked Summary Content */}
      {!isLocked && summaryData && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weekly Average */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Average Score
              </span>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {summaryData.weeklyAverageScore}%
                </span>
                <p className="text-xs text-slate-400 mt-1">Across all logged days</p>
              </div>
            </div>

            {/* Days Tracked */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Consistency
              </span>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {summaryData.daysTracked} / {summaryData.daysInWeek}
                </span>
                <p className="text-xs text-slate-400 mt-1">Days tracked this week</p>
              </div>
            </div>

            {/* Delta vs Previous Week */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Progress Delta
              </span>
              <div className="mt-3">
                {summaryData.deltaFromPreviousWeek === null ? (
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                    Baseline Week
                  </span>
                ) : summaryData.deltaFromPreviousWeek >= 0 ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-2xl">
                    <TrendingUp className="w-6 h-6" />
                    <span>+{summaryData.deltaFromPreviousWeek}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-600 font-black text-2xl">
                    <TrendingDown className="w-6 h-6" />
                    <span>{summaryData.deltaFromPreviousWeek}%</span>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">vs. previous week average</p>
              </div>
            </div>

            {/* Best & Lowest Day */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Range Peaks
              </span>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Best:</span>
                  <span className="font-extrabold text-emerald-600">
                    {summaryData.bestDay?.score ?? '--'}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Lowest:</span>
                  <span className="font-extrabold text-rose-500">
                    {summaryData.lowestDay?.score ?? '--'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Focus Tip Callout */}
          {summaryData.focusTip && (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
                  Targeted Focus Tip for Next Week
                </h4>
                <p className="text-sm text-indigo-900 mt-1 leading-relaxed">
                  {summaryData.focusTip}
                </p>
              </div>
            </div>
          )}

          {/* Bar Chart Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                12 Life Dimensions Completion Rates
              </h3>
              <span className="text-xs text-slate-400">
                0% (Neglected) &bull; 100% (Full Achievement)
              </span>
            </div>
            <WeeklyBarChart areaBreakdown={summaryData.areaBreakdown} />
          </div>

          {/* Bottom Pagination */}
          <div className="flex items-center justify-between pt-2">
            {weekNumber > 1 ? (
              <Link href={`/weekly/${weekNumber - 1}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Week {weekNumber - 1}
                </Button>
              </Link>
            ) : <div />}

            {weekNumber < 5 && (
              <Link href={`/weekly/${weekNumber + 1}`}>
                <Button variant="outline" size="sm">
                  <span>Week {weekNumber + 1}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeeklyReportPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-400">Loading weekly report...</div>}>
      <WeeklyReportContent />
    </Suspense>
  );
}
