'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import {
  User,
  School,
  BookOpen,
  Clock,
  Bell,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    department: '',
    targetWakeUpTime: '07:00',
    targetSleepTime: '23:00',
    reminderEnabled: true,
    reminderTime: '21:00',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        university: user.university || '',
        department: user.department || '',
        targetWakeUpTime: user.targetWakeUpTime || '07:00',
        targetSleepTime: user.targetSleepTime || '23:00',
        reminderEnabled: user.reminderEnabled ?? true,
        reminderTime: user.reminderTime || '21:00',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await updateProfile({
      name: formData.name.trim(),
      university: formData.university.trim(),
      department: formData.department.trim(),
      targetWakeUpTime: formData.targetWakeUpTime,
      targetSleepTime: formData.targetSleepTime,
      reminderEnabled: formData.reminderEnabled,
      reminderTime: formData.reminderTime,
    });

    setIsLoading(false);
    if (result.success) {
      setSuccess('Profile updated successfully.');
    } else {
      setError(result.error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account and all associated cycles, checklists, and scores? This action CANNOT be undone.'
    );
    if (!confirmed) return;

    try {
      await api.delete('/users/me');
      logout();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Profile & Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, target routine times, and reminders
        </p>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Basic Information
          </h3>

          <Input
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University"
              name="university"
              icon={School}
              value={formData.university}
              onChange={handleChange}
            />
            <Input
              label="Department"
              name="department"
              icon={BookOpen}
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Target Routine (Frozen into Cycles)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Wake-up Time"
              type="time"
              name="targetWakeUpTime"
              value={formData.targetWakeUpTime}
              onChange={handleChange}
            />
            <Input
              label="Target Sleep Time"
              type="time"
              name="targetSleepTime"
              value={formData.targetSleepTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Daily Reminders
          </h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reminderEnabled"
              name="reminderEnabled"
              checked={formData.reminderEnabled}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="reminderEnabled" className="text-sm font-medium text-slate-700">
              Enable Daily Push / App Reminders
            </label>
          </div>

          {formData.reminderEnabled && (
            <div className="max-w-xs">
              <Input
                label="Daily Reminder Time"
                type="time"
                name="reminderTime"
                value={formData.reminderTime}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="pt-2">
            <PushNotificationManager />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/60 rounded-2xl border border-red-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-red-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Delete Account & Cascaded Data
          </h4>
          <p className="text-xs text-red-700 mt-1">
            Permanently erases all 30-day cycles, daily checklists, weekly summaries, and monthly reports.
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleDeleteAccount}
        >
          Delete My Account
        </Button>
      </div>
    </div>
  );
}
