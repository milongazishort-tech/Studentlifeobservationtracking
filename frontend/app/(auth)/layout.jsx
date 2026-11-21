import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            StudentLife
          </span>
        </Link>
        <p className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
          30-Day Holistic Self-Observation
        </p>
      </div>

      {/* Form Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
          {children}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Private, anonymous & non-judgmental observation.
        </p>
      </div>
    </div>
  );
}
