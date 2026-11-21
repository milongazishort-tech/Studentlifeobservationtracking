'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { User, Mail, Lock, School, BookOpen, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      university: formData.university.trim() || undefined,
      department: formData.department.trim() || undefined,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(
        result.message ||
          'Registration successful! Please verify your email before logging in.'
      );
    } else {
      setError(result.error);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Account Created!</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {successMessage}
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
            className="text-xs text-indigo-600 hover:underline"
          >
            Have a verification token? Verify here
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Create student account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Begin your 30-day journey of self-discipline & balance
        </p>
      </div>

      {error && <Alert type="error" title="Registration Failed" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="name"
          required
          placeholder="e.g. Alex Morgan"
          icon={User}
          value={formData.name}
          onChange={handleChange}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="student@university.edu"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="University"
            name="university"
            placeholder="e.g. Oxford"
            icon={School}
            value={formData.university}
            onChange={handleChange}
          />
          <Input
            label="Department"
            name="department"
            placeholder="e.g. Computer Science"
            icon={BookOpen}
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Password"
          type="password"
          name="password"
          required
          autoComplete="new-password"
          helperText="Minimum 8 characters"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          isLoading={isLoading}
        >
          Create Account & Start Cycle
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
