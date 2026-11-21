'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import {
  Flame,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  Award,
  ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();

  const [activeCycle, setActiveCycle] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(null);
  const [streak, setStreak] = useState(0);
  const [yesterdayMissed, setYesterdayMissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoActiveCycle, setHasNoActiveCycle] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch active cycle
      const cycleRes = await api.get('/cycles/active');
      const data = cycleRes.data.data;
      setActiveCycle(data);
      const currentDay = data.dayNumber || 1;
      setDayNumber(currentDay);
      setHasSubmittedToday(Boolean(data.hasSubmittedToday));
      setStreak(data.currentStreak || 0);
      setHasNoActiveCycle(false);

      // 2. If submitted today, fetch today's score
      if (data.hasSubmittedToday) {
        try {
          const scoreRes = await api.get('/scores/today');
          setTodayScore(scoreRes.data.data);
        } catch (scoreErr) {
          console.warn('[Dashboard] Could not fetch today score:', scoreErr);
        }
      }

      // 3. Check if yesterday was missed (if dayNumber > 1)
      if (currentDay > 1) {
        try {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          await api.get(`/checklist/${yesterdayStr}`);
          setYesterdayMissed(false);
        } catch (err) {
          if (err.response?.status === 404) {
            setYesterdayMissed(true);
          }
        }
      }
    } catch (err) {
      if (err.response?.data?.error?.code === 'NO_ACTIVE_CYCLE') {
        setHasNoActiveCycle(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-36 bg-slate-200 rounded-2xl" />
          <div className="h-36 bg-slate-200 rounded-2xl" />
          <div className="h-36 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (hasNoActiveCycle) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          No Active 30-Day Cycle
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Welcome, {user?.name || 'Student'}! To start tracking your 12 daily life dimensions, launch your first 30-day self-observation cycle.
        </p>
        <div className="mt-6">
          <Link href="/cycle/setup">
            <Button variant="primary" size="lg">
              <span>Start New 30-Day Cycle</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Yesterday Grace Alert Banner */}
      {yesterdayMissed && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">
                You haven&apos;t logged yesterday (Day {dayNumber - 1})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Complete your check-in before midnight to protect your active cycle streak!
              </p>
            </div>
          </div>
          <Link href="/checklist/yesterday" className="self-end sm:self-auto">
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              <span>Log Yesterday</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main Welcome Hero */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Cycle #{activeCycle?.cycleNumber || 1} &bull; Day {dayNumber} of 30</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {hasSubmittedToday
              ? "You've successfully completed today's observation!"
              : "Take 2 minutes to record today's 12 life areas."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {hasSubmittedToday ? (
            <div className="flex items-center gap-2">
              <Link href="/daily-score">
                <Button
                  variant="secondary"
                  size="md"
                  className="bg-white/95 text-indigo-700 hover:bg-white font-bold shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600" />
                  View Today&apos;s Score
                </Button>
              </Link>
              <Link href="/checklist">
                <Button
                  variant="ghost"
                  size="md"
                  className="text-white hover:bg-white/15 border border-white/20"
                >
                  Edit Entry
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/checklist">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-indigo-700 hover:bg-white/95 font-bold shadow-md"
              >
                <span>Start Check-in</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Cycle Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              30-Day Progress
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Day {dayNumber} / 30
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-black text-slate-900">
                {Math.round((dayNumber / 30) * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {30 - dayNumber} days left in cycle
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dayNumber / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Consecutive Streak
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{streak}</span>
              <span className="text-sm font-semibold text-slate-500">
                {streak === 1 ? 'day active' : 'consecutive days'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Never skip twice &bull; Habit momentum builds resilience.
            </p>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today&apos;s Status
            </span>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4">
            {hasSubmittedToday ? (
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-lg">Logged & Scored</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>Score: {todayScore?.totalScore ?? '--'}%</span>
                  <Link href="/daily-score" className="text-indigo-600 font-semibold hover:underline">
                    View breakdown &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-amber-600 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-lg">Pending Submission</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Submit before midnight to preserve your streak.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <Link
          href="/weekly/1"
          className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all shadow-sm hover:shadow group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Weekly Analytics & Focus Tips
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review week-by-week bar breakdowns and performance deltas.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/monthly"
          className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all shadow-sm hover:shadow group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                30-Day Life Stage & Radar Balance
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover which of the 10 Life Stages represents your lifestyle.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
