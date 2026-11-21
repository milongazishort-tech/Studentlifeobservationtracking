'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
          <h4 className="text-base font-semibold text-slate-800">
            Checking session...
          </h4>
          <p className="text-xs text-slate-500">
            Student Life Progress & Self-Improvement Tracker
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
