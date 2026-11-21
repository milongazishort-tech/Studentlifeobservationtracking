'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your account email.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setSuccess(
        result.message ||
          'If that email exists in our system, a password reset link has been dispatched.'
      );
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your registered email address and we will send you a reset link.
        </p>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Link Dispatched" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="student@university.edu"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Reset Link
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
