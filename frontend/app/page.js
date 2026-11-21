'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  BarChart3,
  Moon,
  BookOpen,
  Activity,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              StudentLife
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
              30-Day Self-Observation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700 mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Private, Anonymous & Non-Judgmental Reflection</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Master your university life across{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            12 holistic dimensions
          </span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Generic habit trackers track single checkboxes. StudentLife evaluates your academics,
          personal discipline, physical health, sleep routine, and social connectivity simultaneously over structured 30-day cycles.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Begin Your 30-Day Cycle</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-base transition-all"
          >
            Existing Student Login
          </Link>
        </div>

        {/* 3 Pillars */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Daily 12-Item Check-in
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Log wake-up times, university attendance, class participation, exercise, study recap, and sleep punctuality in under 2 minutes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Weekly Insights & Deltas
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Visualize your habit trajectories with bar breakdowns, identify your weakest areas, and receive actionable focus tips for the next 7 days.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. 10 Life Stages Classification
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              At Day 30, unlock your 12-axis radar balance chart and discover your official Life Stage (from Critical Unbalance up to Exceptional Self-Development).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Student Life Progress & Self-Improvement Tracker &bull; Designed for University Students
      </footer>
    </div>
  );
}
