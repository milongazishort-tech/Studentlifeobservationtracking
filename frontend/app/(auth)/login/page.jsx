'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Mail, Lock, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const sessionExpired = searchParams.get('session_expired') === 'true';
  const verifiedNotice = searchParams.get('verified') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error);
      setErrorCode(result.code);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to continue your daily habit observations
        </p>
      </div>

      {sessionExpired && (
        <Alert
          type="warning"
          title="Session Expired"
          message="Your login session has expired. Please sign in again."
        />
      )}

      {verifiedNotice && (
        <Alert
          type="success"
          title="Email Verified"
          message="Your email address has been verified. You can now sign in."
        />
      )}

      {error && (
        <Alert
          type="error"
          title="Sign In Error"
          message={
            errorCode === 'EMAIL_NOT_VERIFIED' ? (
              <span>
                Your email is not verified yet.{' '}
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="underline font-semibold hover:text-red-900"
                >
                  Verify now
                </Link>
              </span>
            ) : (
              error
            )
          }
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="University Email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="student@university.edu"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>Sign In</span>
          {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          New to the 30-day challenge?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
