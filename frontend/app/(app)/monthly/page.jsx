'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import LifeStageCard from '@/components/reports/LifeStageCard';
import LifeStageRadarChart from '@/components/reports/LifeStageRadarChart';
import ProgressTrendChart from '@/components/reports/ProgressTrendChart';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  Target,
  Info,
} from 'lucide-react';

export default function MonthlyReportPage() {
  const router = useRouter();

  const [reportData, setReportData] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInProgress, setIsInProgress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonthlyReport();
  }, []);

  const fetchMonthlyReport = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIsInProgress(false);

      // 1. Locate cycle (active or latest from history)
      let targetCycleId = null;
      let dayNumber = 1;

      try {
        const activeRes = await api.get('/cycles/active');
        targetCycleId = activeRes.data.data.cycleId;
        dayNumber = activeRes.data.data.dayNumber || 1;
        setCycleData(activeRes.data.data);
      } catch (activeErr) {
        // Fallback to latest in cycle history
        const historyRes = await api.get('/cycles');
        const cycles = historyRes.data.data;
        if (cycles && cycles.length > 0) {
          targetCycleId = cycles[0].cycleId;
          setCycleData(cycles[0]);
        }
      }

      if (!targetCycleId) {
        router.replace('/cycle/setup');
        return;
      }

      // 2. Fetch monthly report
      const res = await api.get(`/monthly/${targetCycleId}`);
      setReportData(res.data.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 'CYCLE_NOT_COMPLETED') {
        setIsInProgress(true);
      } else if (err.response?.data?.error?.code === 'NO_ACTIVE_CYCLE') {
        router.replace('/cycle/setup');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load 30-day monthly report.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Compiling 30-day holistic report...</h3>
        <p className="text-xs text-slate-400">Classifying Life Stage and aggregating radar balance</p>
      </div>
    );
  }

  // Cycle still in progress
  if (isInProgress) {
    const currentDay = cycleData?.dayNumber || 1;
    const daysLeft = Math.max(0, 30 - currentDay);

    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
            In Progress &bull; Day {currentDay} of 30
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
            30-Day Life Stage Unlocks at Day 30
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Your final 12-axis radar balance chart and Life Stage classification unlock once you complete the full 30-day cycle ({daysLeft} days remaining).
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-violet-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentDay / 30) * 100)}%` }}
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/checklist">
            <Button variant="primary" size="md">
              <span>Log Today&apos;s Checklist</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/weekly/1">
            <Button variant="outline" size="md">
              View Weekly Analytics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-red-600 mb-4">{error || 'No report found.'}</p>
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Limited Data Warning Banner */}
      {!reportData.hasEnoughData && (
        <Alert
          type="warning"
          title="Limited Observation Data"
          message="Your habit consistency was under 50% during this 30-day period. This Life Stage classification represents an initial estimate. Greater logging consistency will yield more accurate self-reflection."
        />
      )}

      {/* Main Life Stage Card */}
      <LifeStageCard
        stage={reportData.lifeStage}
        title={reportData.lifeStageName}
        description={reportData.lifeStageDescription}
        lifeScore={reportData.lifeScore}
      />

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall Life Score
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{reportData.lifeScore}%</span>
            <span className="text-xs text-slate-500">out of 100%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Habit Consistency
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{reportData.habitConsistency}%</span>
            <span className="text-xs text-slate-500">days logged</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Cycle
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">
              #{reportData.cycleNumber || 1}
            </span>
            <span className="text-xs text-slate-500">30-day concluded</span>
          </div>
        </div>
      </div>

      {/* Radar Chart Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              12-Dimension Lifestyle Radar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizes holistic balance across academic, physical, social, skill, and personal domains.
            </p>
          </div>
        </div>
        <LifeStageRadarChart areaCompletionRates={reportData.areaCompletionRates} />
      </div>

      {/* Strengths & Weaknesses Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 3 Strengths */}
        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-200/80 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
            <span>Top 3 Life Strengths</span>
          </div>
          <div className="space-y-2.5">
            {reportData.strengths?.map((s, idx) => (
              <div
                key={s.areaKey || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{s.name}</span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {Math.round(s.rate * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 3 Weaknesses */}
        <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base">
            <Target className="w-5 h-5 text-rose-600" />
            <span>Areas for Focused Growth</span>
          </div>
          <div className="space-y-2.5">
            {reportData.weaknesses?.map((w, idx) => (
              <div
                key={w.areaKey || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{w.name}</span>
                </div>
                <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  {Math.round(w.rate * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Week Progress Trend Line Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              5-Period Progression Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Score trajectory across Weeks 1&ndash;4 and the Final Stretch (Days 29&ndash;30).
            </p>
          </div>
        </div>
        <ProgressTrendChart progressTrend={reportData.progressTrend} />
      </div>

      {/* Rule-Based Life Insight & Action Suggestions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            Algorithmic Life Insight
          </h3>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {reportData.lifeInsight}
          </p>
        </div>

        {reportData.improvementSuggestions?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Actionable Improvement Suggestions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportData.improvementSuggestions.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-950 font-medium leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call to Action: Start Next Cycle */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold">Ready for the Next 30 Days?</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Observation is an ongoing cycle. Apply what you learned and start Cycle #{Number(reportData.cycleNumber || 1) + 1}.
          </p>
        </div>
        <Link href="/cycle/setup">
          <Button
            variant="primary"
            size="lg"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Next 30-Day Cycle
          </Button>
        </Link>
      </div>
    </div>
  );
}
