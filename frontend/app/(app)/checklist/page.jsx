'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { calculateLiveScores } from '@/lib/scoringCalculator';
import ChecklistItemCard from '@/components/checklist/ChecklistItemCard';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  Sparkles,
  ArrowRight,
  Save,
  CheckCircle,
  HelpCircle,
  Clock,
  Flame,
  Minus,
  Plus,
} from 'lucide-react';

export default function ChecklistPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dayNumber, setDayNumber] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    item1_earlyMorning: false,
    item2_universityAttendance: 'yes',
    item3_classParticipation_attended: 3,
    item3_classParticipation_total: 3,
    item4_personalDiscipline: false,
    item5_socialInteractions_count: 2,
    item6_dailyLearning_text: '',
    item7_physicalActivity_active: false,
    item7_physicalActivity_minutes: 20,
    item8_skillDevelopment_minutes: 30,
    item9_classWorkRecap: false,
    item10_socialMediaControl: 'controlled',
    item11_selfReflection_text: '',
    item12_sleepingOnTime: false,
  });

  // Calculate live preview score on every state update
  const liveScore = useMemo(() => calculateLiveScores(formData), [formData]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // 1. Get active cycle info
      const cycleRes = await api.get('/cycles/active');
      const { dayNumber: currentDay, hasSubmittedToday } = cycleRes.data.data;
      setDayNumber(currentDay);

      // 2. If already submitted, pre-fill from today's saved activity
      if (hasSubmittedToday) {
        setIsEditMode(true);
        try {
          const entryRes = await api.get('/checklist/today');
          const entry = entryRes.data.data;
          setFormData({
            item1_earlyMorning: Boolean(entry.item1_earlyMorning),
            item2_universityAttendance: entry.item2_universityAttendance || 'yes',
            item3_classParticipation_attended: entry.item3_classParticipation_attended ?? 3,
            item3_classParticipation_total: entry.item3_classParticipation_total ?? 3,
            item4_personalDiscipline: Boolean(entry.item4_personalDiscipline),
            item5_socialInteractions_count: entry.item5_socialInteractions_count ?? 2,
            item6_dailyLearning_text: entry.item6_dailyLearning_text || '',
            item7_physicalActivity_active: Boolean(entry.item7_physicalActivity_active),
            item7_physicalActivity_minutes: entry.item7_physicalActivity_minutes ?? 20,
            item8_skillDevelopment_minutes: entry.item8_skillDevelopment_minutes ?? 30,
            item9_classWorkRecap: Boolean(entry.item9_classWorkRecap),
            item10_socialMediaControl: entry.item10_socialMediaControl || 'controlled',
            item11_selfReflection_text: entry.item11_selfReflection_text || '',
            item12_sleepingOnTime: Boolean(entry.item12_sleepingOnTime),
          });
        } catch (fetchErr) {
          console.warn('[Checklist] Could not load existing today entry:', fetchErr);
        }
      }
    } catch (err) {
      if (err.response?.data?.error?.code === 'NO_ACTIVE_CYCLE') {
        router.replace('/cycle/setup');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load checklist status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await api.put('/checklist/today', formData);
      } else {
        await api.post('/checklist', formData);
      }

      router.push('/daily-score');
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to record checklist. Please verify all fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">Loading daily checklist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-28 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Day {dayNumber} of 30
            </span>
            {isEditMode && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Update Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily 12-Item Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record today&apos;s habits honestly &mdash; reflection drives growth.
          </p>
        </div>

        <div className="text-right flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/checklist/yesterday"
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 underline"
          >
            Need to log yesterday?
          </Link>
        </div>
      </div>

      {error && <Alert type="error" title="Submission Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item 1: Early Morning */}
        <ChecklistItemCard
          itemNumber={1}
          title="Early Morning Wake-up"
          category="Personal"
          points={liveScore.scores.item1}
          maxPoints={8}
          description="Did you wake up on or before your target wake-up time today?"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('item1_earlyMorning', true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                formData.item1_earlyMorning
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Yes, on time (+8 pts)
            </button>
            <button
              type="button"
              onClick={() => updateField('item1_earlyMorning', false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                !formData.item1_earlyMorning
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✗ Woke up late (0 pts)
            </button>
          </div>
        </ChecklistItemCard>

        {/* Item 2: University Attendance */}
        <ChecklistItemCard
          itemNumber={2}
          title="University Attendance"
          category="Academic"
          points={liveScore.scores.item2}
          maxPoints={liveScore.isOffDay ? 0 : 10}
          description="Did you attend university today, or was it a scheduled weekend/holiday?"
        >
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'yes', label: 'Attended', pts: '+10 pts' },
              { id: 'no', label: 'Absent', pts: '0 pts' },
              { id: 'off_day', label: 'Off-Day', pts: 'Excluded' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField('item2_universityAttendance', opt.id)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                  formData.item2_universityAttendance === opt.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">{opt.pts}</div>
              </button>
            ))}
          </div>
        </ChecklistItemCard>

        {/* Item 3: Class Participation */}
        <ChecklistItemCard
          itemNumber={3}
          title="Class Participation Rate"
          category="Academic"
          points={liveScore.scores.item3}
          maxPoints={liveScore.isOffDay ? 0 : 8}
          description="Number of classes attended out of total classes scheduled today."
          isOffDayDisabled={liveScore.isOffDay}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1 w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Classes Attended:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={formData.item3_classParticipation_attended <= 0}
                  onClick={() =>
                    updateField(
                      'item3_classParticipation_attended',
                      Math.max(0, formData.item3_classParticipation_attended - 1)
                    )
                  }
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-slate-900">
                  {formData.item3_classParticipation_attended}
                </span>
                <button
                  type="button"
                  disabled={
                    formData.item3_classParticipation_attended >=
                    formData.item3_classParticipation_total
                  }
                  onClick={() =>
                    updateField(
                      'item3_classParticipation_attended',
                      Math.min(
                        formData.item3_classParticipation_total,
                        formData.item3_classParticipation_attended + 1
                      )
                    )
                  }
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="hidden sm:block text-slate-300 font-bold">/</div>

            <div className="flex-1 w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Scheduled:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={formData.item3_classParticipation_total <= 1}
                  onClick={() => {
                    const newTotal = Math.max(1, formData.item3_classParticipation_total - 1);
                    updateField('item3_classParticipation_total', newTotal);
                    if (formData.item3_classParticipation_attended > newTotal) {
                      updateField('item3_classParticipation_attended', newTotal);
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-slate-900">
                  {formData.item3_classParticipation_total}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'item3_classParticipation_total',
                      formData.item3_classParticipation_total + 1
                    )
                  }
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </ChecklistItemCard>

        {/* Item 4: Personal Discipline */}
        <ChecklistItemCard
          itemNumber={4}
          title="Personal Discipline & Room Order"
          category="Personal"
          points={liveScore.scores.item4}
          maxPoints={8}
          description="Did you maintain discipline today (e.g., made your bed, room cleanliness, personal hygiene)?"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('item4_personalDiscipline', true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                formData.item4_personalDiscipline
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Maintained (+8 pts)
            </button>
            <button
              type="button"
              onClick={() => updateField('item4_personalDiscipline', false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                !formData.item4_personalDiscipline
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✗ Neglected (0 pts)
            </button>
          </div>
        </ChecklistItemCard>

        {/* Item 5: Social Interactions */}
        <ChecklistItemCard
          itemNumber={5}
          title="Meaningful Social Interactions"
          category="Social"
          points={liveScore.scores.item5}
          maxPoints={6}
          description="How many positive, meaningful conversations did you have with peers or family today?"
        >
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              Interaction Count (&ge;3 for full 6 pts):
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={formData.item5_socialInteractions_count <= 0}
                onClick={() =>
                  updateField(
                    'item5_socialInteractions_count',
                    Math.max(0, formData.item5_socialInteractions_count - 1)
                  )
                }
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-lg font-black text-slate-900">
                {formData.item5_socialInteractions_count}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'item5_socialInteractions_count',
                    formData.item5_socialInteractions_count + 1
                  )
                }
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ChecklistItemCard>

        {/* Item 6: Daily Learning Note */}
        <ChecklistItemCard
          itemNumber={6}
          title="Daily Learning Note"
          category="Academic"
          points={liveScore.scores.item6}
          maxPoints={10}
          description="Summarize at least one key concept or lesson learned today."
        >
          <textarea
            rows={3}
            maxLength={500}
            placeholder="e.g. Learned about Dijkstra's algorithm in graph theory, specifically how edge relaxation works..."
            value={formData.item6_dailyLearning_text}
            onChange={(e) => updateField('item6_dailyLearning_text', e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Non-empty text awards full 10 points</span>
            <span>{formData.item6_dailyLearning_text.length} / 500 chars</span>
          </div>
        </ChecklistItemCard>

        {/* Item 7: Physical Activity */}
        <ChecklistItemCard
          itemNumber={7}
          title="Physical Fitness & Exercise"
          category="Physical"
          points={liveScore.scores.item7}
          maxPoints={10}
          description="Walk, gym, sports, or home workout (&ge;15 mins = 10 pts, &lt;15 mins = 5 pts)."
        >
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('item7_physicalActivity_active', true)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                  formData.item7_physicalActivity_active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✓ Exercised Today
              </button>
              <button
                type="button"
                onClick={() => updateField('item7_physicalActivity_active', false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                  !formData.item7_physicalActivity_active
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✗ Inactive (0 pts)
              </button>
            </div>

            {formData.item7_physicalActivity_active && (
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Minutes active:</span>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.item7_physicalActivity_minutes}
                  onChange={(e) =>
                    updateField('item7_physicalActivity_minutes', Number(e.target.value))
                  }
                  className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-center"
                />
                <span className="text-xs text-slate-400">
                  {formData.item7_physicalActivity_minutes >= 15
                    ? '(Awarded 10 pts)'
                    : '(Awarded 5 pts)'}
                </span>
              </div>
            )}
          </div>
        </ChecklistItemCard>

        {/* Item 8: Skill Development */}
        <ChecklistItemCard
          itemNumber={8}
          title="Skill Development & Self-Study"
          category="Skill"
          points={liveScore.scores.item8}
          maxPoints={10}
          description="Dedicated time learning coding, design, language, or personal projects."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Time spent:</span>
              <input
                type="number"
                min="0"
                max="600"
                step="5"
                value={formData.item8_skillDevelopment_minutes}
                onChange={(e) =>
                  updateField('item8_skillDevelopment_minutes', Number(e.target.value))
                }
                className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-500 font-medium">minutes</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <span
                className={`py-1 rounded-md border ${
                  formData.item8_skillDevelopment_minutes >= 60
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                &ge;60m: 10 pts
              </span>
              <span
                className={`py-1 rounded-md border ${
                  formData.item8_skillDevelopment_minutes >= 30 &&
                  formData.item8_skillDevelopment_minutes < 60
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                30-59m: 6 pts
              </span>
              <span
                className={`py-1 rounded-md border ${
                  formData.item8_skillDevelopment_minutes >= 15 &&
                  formData.item8_skillDevelopment_minutes < 30
                    ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                15-29m: 3 pts
              </span>
              <span
                className={`py-1 rounded-md border ${
                  formData.item8_skillDevelopment_minutes < 15
                    ? 'bg-slate-100 text-slate-700 border-slate-300 font-bold'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                &lt;15m: 0 pts
              </span>
            </div>
          </div>
        </ChecklistItemCard>

        {/* Item 9: Class Work Recap */}
        <ChecklistItemCard
          itemNumber={9}
          title="Lecture Recap & Coursework Review"
          category="Academic"
          points={liveScore.scores.item9}
          maxPoints={10}
          description="Did you review today&apos;s lecture notes, assignments, or textbook materials?"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('item9_classWorkRecap', true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                formData.item9_classWorkRecap
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Reviewed (+10 pts)
            </button>
            <button
              type="button"
              onClick={() => updateField('item9_classWorkRecap', false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                !formData.item9_classWorkRecap
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✗ Skipped (0 pts)
            </button>
          </div>
        </ChecklistItemCard>

        {/* Item 10: Social Media Control */}
        <ChecklistItemCard
          itemNumber={10}
          title="Social Media Self-Control"
          category="Personal"
          points={liveScore.scores.item10}
          maxPoints={6}
          description="How well did you regulate mindless scrolling on Instagram, TikTok, YouTube, etc.?"
        >
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'controlled', label: 'Controlled', pts: '+6 pts' },
              { id: 'useful', label: 'Moderate', pts: '+3 pts' },
              { id: 'excessive', label: 'Excessive', pts: '0 pts' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField('item10_socialMediaControl', opt.id)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                  formData.item10_socialMediaControl === opt.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">{opt.pts}</div>
              </button>
            ))}
          </div>
        </ChecklistItemCard>

        {/* Item 11: Self-Reflection Journal */}
        <ChecklistItemCard
          itemNumber={11}
          title="Daily Self-Reflection Journal"
          category="Personal"
          points={liveScore.scores.item11}
          maxPoints={8}
          description="Write down what went well today, what caused friction, and what you will improve tomorrow."
        >
          <textarea
            rows={3}
            maxLength={500}
            placeholder="e.g. Felt focused during morning study session, but got distracted after lunch. Tomorrow I will put my phone in another room..."
            value={formData.item11_selfReflection_text}
            onChange={(e) => updateField('item11_selfReflection_text', e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Non-empty entry awards full 8 points</span>
            <span>{formData.item11_selfReflection_text.length} / 500 chars</span>
          </div>
        </ChecklistItemCard>

        {/* Item 12: Sleeping on Time */}
        <ChecklistItemCard
          itemNumber={12}
          title="Sleeping on Target Schedule"
          category="Physical"
          points={liveScore.scores.item12}
          maxPoints={6}
          description="Did you wind down and get in bed before your target sleep time?"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('item12_sleepingOnTime', true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                formData.item12_sleepingOnTime
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Slept on time (+6 pts)
            </button>
            <button
              type="button"
              onClick={() => updateField('item12_sleepingOnTime', false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                !formData.item12_sleepingOnTime
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✗ Stayed up late (0 pts)
            </button>
          </div>
        </ChecklistItemCard>
      </form>

      {/* Sticky Bottom Score Bar & Submit Button */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-indigo-700 leading-none">
                {liveScore.totalScore}%
              </span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase">Score</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                {liveScore.achievedPoints} / {liveScore.maxAvailablePoints} Points
              </div>
              <div className="text-xs text-slate-500">
                {liveScore.isOffDay ? 'Off-Day denominator active (82 pts)' : 'Normal day scale (100 pts)'}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="shadow-md shadow-indigo-500/20"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isEditMode ? 'Update Entry' : 'Submit Today'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
