'use client';

import React, { Suspense } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';

export default function AppLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading app...</div>}>
      <AuthGuard>
        <div className="min-h-screen bg-slate-50/70 flex flex-col">
          <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading view...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </AuthGuard>
    </Suspense>
  );
}
