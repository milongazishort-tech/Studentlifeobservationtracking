'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

export default function CycleSetupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    startDate: todayStr,
    targetWakeUpTime: user?.targetWakeUpTime || '07:00',
    targetSleepTime: user?.targetSleepTime || '23:00',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/cycles', {
        startDate: formData.startDate,
        targetWakeUpTime: formData.targetWakeUpTime,
        targetSleepTime: formData.targetSleepTime,
      });

      router.push('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to initialize cycle. You may already have an active cycle.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Start New 30-Day Cycle
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Establish your target wake/sleep schedule. These targets will be frozen for the next 30 days.
        </p>
      </div>

      {error && <Alert type="error" title="Setup Error" message={error} className="mb-6" />}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <Input
          label="Cycle Start Date"
          type="date"
          name="startDate"
          required
          icon={Calendar}
          helperText="Cannot be set to a future date."
          value={formData.startDate}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Wake-up Time"
            type="time"
            name="targetWakeUpTime"
            required
            icon={Clock}
            value={formData.targetWakeUpTime}
            onChange={handleChange}
          />
          <Input
            label="Target Sleep Time"
            type="time"
            name="targetSleepTime"
            required
            icon={Clock}
            value={formData.targetSleepTime}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            <span>Launch Cycle</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
