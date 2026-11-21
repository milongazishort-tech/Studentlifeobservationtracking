'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { CheckCircle2, ArrowRight } from 'lucide-react';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailNotice = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenFromUrl && !success && !error && !isLoading) {
      handleVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerification = async (verifyToken) => {
    setIsLoading(true);
    setError('');
    const result = await verifyEmail(verifyToken);
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Email verified successfully! You can now sign in.');
    } else {
      setError(result.error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please provide your verification token.');
      return;
    }
    handleVerification(token.trim());
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Email Verified!</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{success}</p>
        <div className="pt-2">
          <Link
            href="/login?verified=true"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Verify your email
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {emailNotice
            ? `We sent a verification link to ${emailNotice}. Enter your token below if not auto-verified.`
            : 'Enter the verification token sent to your email.'}
        </p>
      </div>

      {error && <Alert type="error" title="Verification Failed" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Verification Token"
          name="token"
          required
          placeholder="Paste token from email"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Confirm Verification
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Skip and try signing in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading verification...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
