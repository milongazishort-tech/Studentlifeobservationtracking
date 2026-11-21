import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sunrise,
  BookOpen,
  Award,
  Sparkles,
  HeartPulse,
  Brain,
  Moon,
  CheckCircle2,
} from 'lucide-react-native';

import { useCycle } from '@/context/CycleContext';
import { ChecklistService } from '@/services/checklist.service';
import { calculateDailyScore } from '@/services/scoringEngine';
import { ChecklistPayload, AttendanceStatus, SocialMediaControlLevel } from '@/types/checklist.types';
import { HapticsUtil } from '@/utils/haptics';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ApiStandardError } from '@/types/api.types';

// Modular item components
import { ItemToggle } from '@/components/checklist/ItemToggle';
import { AttendanceSelector } from '@/components/checklist/AttendanceSelector';
import { ClassFractionInput } from '@/components/checklist/ClassFractionInput';
import { StepperInput } from '@/components/checklist/StepperInput';
import { ActivityMinutesInput } from '@/components/checklist/ActivityMinutesInput';
import { SkillMinutesInput } from '@/components/checklist/SkillMinutesInput';
import { SegmentedControl } from '@/components/checklist/SegmentedControl';
import { ReflectionInput } from '@/components/checklist/ReflectionInput';
import { LiveScoreBar } from '@/components/checklist/LiveScoreBar';

export default function ChecklistScreen() {
  const router = useRouter();
  const { hasActiveCycle, isCycleLoading, reloadCycle } = useCycle();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<ApiStandardError | null>(null);

  // Form State for 12 Items
  const [isOffDay, setIsOffDay] = useState(false);
  const [earlyMorning, setEarlyMorning] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceStatus>('yes');
  const [classesAttended, setClassesAttended] = useState(3);
  const [classesTotal, setClassesTotal] = useState(3);
  const [personalDiscipline, setPersonalDiscipline] = useState(false);
  const [socialCount, setSocialCount] = useState(2);
  const [dailyLearning, setDailyLearning] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState(false);
  const [physicalMinutes, setPhysicalMinutes] = useState(0);
  const [skillMinutes, setSkillMinutes] = useState(30);
  const [classWorkRecap, setClassWorkRecap] = useState(false);
  const [socialMedia, setSocialMedia] = useState<SocialMediaControlLevel>('controlled');
  const [selfReflection, setSelfReflection] = useState('');
  const [sleepOnTime, setSleepOnTime] = useState(false);

  // Load existing checklist entry for today if any
  useEffect(() => {
    async function fetchTodayEntry() {
      if (!hasActiveCycle) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const record = await ChecklistService.getTodayEntry();
        if (record) {
          setIsEdit(true);
          setIsOffDay(record.isOffDay ?? false);
          setEarlyMorning(record.item1_earlyMorning ?? false);
          setAttendance(record.item2_universityAttendance ?? 'yes');
          setClassesAttended(record.item3_classParticipation_attended ?? 0);
          setClassesTotal(record.item3_classParticipation_total ?? 0);
          setPersonalDiscipline(record.item4_personalDiscipline ?? false);
          setSocialCount(record.item5_socialInteractions ?? 0);
          setDailyLearning(record.item6_dailyLearning ?? '');
          setPhysicalActivity(record.item7_physicalActivity ?? false);
          setPhysicalMinutes(record.item7_physicalMinutes ?? 0);
          setSkillMinutes(record.item8_skillDevelopmentMinutes ?? 0);
          setClassWorkRecap(record.item9_classWorkRecap ?? false);
          setSocialMedia(record.item10_socialMediaControl ?? 'controlled');
          setSelfReflection(record.item11_selfReflection ?? '');
          setSleepOnTime(record.item12_sleepOnTime ?? false);
        }
      } catch (err) {
        console.warn('[Checklist] Failed to load today entry:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTodayEntry();
  }, [hasActiveCycle]);

  // Handle Attendance changes: if 'off_day', toggle isOffDay
  const handleAttendanceChange = (status: AttendanceStatus) => {
    setAttendance(status);
    if (status === 'off_day') {
      setIsOffDay(true);
    } else {
      setIsOffDay(false);
    }
  };

  // Compile payload object
  const currentPayload: ChecklistPayload = useMemo(
    () => ({
      isOffDay: isOffDay || attendance === 'off_day',
      item1_earlyMorning: earlyMorning,
      item2_universityAttendance: attendance,
      item3_classParticipation_attended: classesAttended,
      item3_classParticipation_total: classesTotal,
      item4_personalDiscipline: personalDiscipline,
      item5_socialInteractions: socialCount,
      item6_dailyLearning: dailyLearning,
      item7_physicalActivity: physicalActivity,
      item7_physicalMinutes: physicalMinutes,
      item8_skillDevelopmentMinutes: skillMinutes,
      item9_classWorkRecap: classWorkRecap,
      item10_socialMediaControl: socialMedia,
      item11_selfReflection: selfReflection,
      item12_sleepOnTime: sleepOnTime,
    }),
    [
      isOffDay,
      attendance,
      earlyMorning,
      classesAttended,
      classesTotal,
      personalDiscipline,
      socialCount,
      dailyLearning,
      physicalActivity,
      physicalMinutes,
      skillMinutes,
      classWorkRecap,
      socialMedia,
      selfReflection,
      sleepOnTime,
    ]
  );

  // Live real-time score calculation
  const calculatedScore = useMemo(() => calculateDailyScore(currentPayload), [currentPayload]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      let res;
      if (isEdit) {
        res = await ChecklistService.updateTodayChecklist(currentPayload);
      } else {
        res = await ChecklistService.submitTodayChecklist(currentPayload);
      }

      await HapticsUtil.success();
      await reloadCycle();

      Alert.alert(
        isEdit ? 'Checklist Updated! ✨' : 'Checklist Recorded! 🎯',
        `Daily Score: ${res.totalScore.toFixed(1)}%\nPoints: ${res.achievedPoints}/${res.maxAvailablePoints}\nCurrent Streak: ${res.currentStreak} Days`,
        [
          {
            text: 'View Dashboard',
            onPress: () => router.push('/(tabs)' as any),
          },
        ]
      );
    } catch (err: any) {
      await HapticsUtil.error();
      setError(err as ApiStandardError);
    } finally {
      setSubmitting(false);
    }
  };

  if (isCycleLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading today's checklist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasActiveCycle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Sparkles size={48} color="#2563EB" />
          <Text style={styles.emptyTitle}>No Active Tracking Cycle</Text>
          <Text style={styles.emptySubtitle}>
            To log daily checklist items, please start an active 30-day tracking cycle first.
          </Text>
          <Button
            title="Start 30-Day Cycle"
            onPress={() => router.push('/cycle/setup' as any)}
            style={styles.emptyBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>12 Life Areas Checklist</Text>
              <Text style={styles.headerSubtitle}>Honest self-reporting for self-mastery</Text>
            </View>
            {isEdit && (
              <View style={styles.editBadge}>
                <CheckCircle2 size={14} color="#15803D" />
                <Text style={styles.editBadgeText}>Editing Today</Text>
              </View>
            )}
          </View>

          {/* Sticky Live Score Indicator */}
          <LiveScoreBar
            score={calculatedScore.totalScore}
            achievedPoints={calculatedScore.achievedPoints}
            maxPoints={calculatedScore.maxAvailablePoints}
          />

          <ErrorBanner message={error?.message ?? null} code={error?.code} />

          {/* SECTION 1: Academic & University (Items 1, 2, 3, 9) */}
          <View style={styles.sectionHeader}>
            <BookOpen size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Academic & Routine</Text>
          </View>

          <ItemToggle
            title="Early Morning"
            subtitle="Woke up on or before your target wake-up time"
            points={8}
            value={earlyMorning}
            onValueChange={setEarlyMorning}
            icon={<Sunrise size={18} color="#D97706" />}
          />

          <AttendanceSelector value={attendance} onChange={handleAttendanceChange} />

          <ClassFractionInput
            attended={classesAttended}
            total={classesTotal}
            isOffDay={isOffDay || attendance === 'off_day'}
            onAttendedChange={setClassesAttended}
            onTotalChange={setClassesTotal}
          />

          <ItemToggle
            title="Class Work Recap"
            subtitle="Reviewed class materials, slides, or organized lecture notes"
            points={10}
            value={classWorkRecap}
            onValueChange={setClassWorkRecap}
          />

          {/* SECTION 2: Skills & Learning (Items 6, 8) */}
          <View style={styles.sectionHeader}>
            <Brain size={18} color="#0D9488" />
            <Text style={styles.sectionTitle}>Skills & Learning</Text>
          </View>

          <ReflectionInput
            title="Daily Learning Note"
            subtitle="What meaningful knowledge did you acquire today?"
            placeholder="e.g. Learned MongoDB indexing strategies and Express validation..."
            points={10}
            value={dailyLearning}
            onChange={setDailyLearning}
          />

          <SkillMinutesInput minutes={skillMinutes} onChange={setSkillMinutes} />

          {/* SECTION 3: Physical & Discipline (Items 4, 7, 10, 12) */}
          <View style={styles.sectionHeader}>
            <HeartPulse size={18} color="#E11D48" />
            <Text style={styles.sectionTitle}>Discipline & Wellness</Text>
          </View>

          <ItemToggle
            title="Personal Discipline"
            subtitle="Completed morning routine, prayers, or personal spiritual practice"
            points={8}
            value={personalDiscipline}
            onValueChange={setPersonalDiscipline}
          />

          <ActivityMinutesInput
            active={physicalActivity}
            minutes={physicalMinutes}
            onActiveChange={setPhysicalActivity}
            onMinutesChange={setPhysicalMinutes}
          />

          <SegmentedControl value={socialMedia} onChange={setSocialMedia} />

          <ItemToggle
            title="Sleeping on Time"
            subtitle="Went to bed on or before your target bedtime"
            points={6}
            value={sleepOnTime}
            onValueChange={setSleepOnTime}
            icon={<Moon size={18} color="#6366F1" />}
          />

          {/* SECTION 4: Social & Reflection (Items 5, 11) */}
          <View style={styles.sectionHeader}>
            <Award size={18} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Social & Reflection</Text>
          </View>

          <StepperInput
            title="Social Interactions"
            subtitle="Meaningful face-to-face or supportive conversations"
            value={socialCount}
            onChange={setSocialCount}
          />

          <ReflectionInput
            title="Self-Reflection Journal"
            subtitle="Honest review of today's successes, challenges, and mindset"
            placeholder="e.g. Maintained solid focus in morning; need better bedtime discipline..."
            points={8}
            value={selfReflection}
            onChange={setSelfReflection}
          />

          {/* Submit Action */}
          <View style={styles.submitSection}>
            <Button
              title={isEdit ? "Update Today's Checklist" : "Submit Today's Checklist"}
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    width: 220,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  submitBtn: {
    height: 54,
  },
});
