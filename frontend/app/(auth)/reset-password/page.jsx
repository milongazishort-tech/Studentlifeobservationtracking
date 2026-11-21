'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Password reset token is missing or invalid.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token.trim(), newPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Password updated successfully! You can now log in.');
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Password Changed</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{success}</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Sign In with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Set new password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your recovery token and new strong password.
        </p>
      </div>

      {error && <Alert type="error" title="Reset Failed" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!tokenFromUrl && (
          <Input
            label="Reset Token"
            name="token"
            required
            placeholder="Paste your reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        )}

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          helperText="Minimum 8 characters"
          placeholder="••••••••"
          icon={Lock}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Update Password
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
