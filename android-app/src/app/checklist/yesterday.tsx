import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, History, Sunrise, Moon } from 'lucide-react-native';

import { ChecklistService } from '@/services/checklist.service';
import { calculateDailyScore } from '@/services/scoringEngine';
import { ChecklistPayload, AttendanceStatus, SocialMediaControlLevel } from '@/types/checklist.types';
import { HapticsUtil } from '@/utils/haptics';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ApiStandardError } from '@/types/api.types';
import { useCycle } from '@/context/CycleContext';

// Modular form items
import { ItemToggle } from '@/components/checklist/ItemToggle';
import { AttendanceSelector } from '@/components/checklist/AttendanceSelector';
import { ClassFractionInput } from '@/components/checklist/ClassFractionInput';
import { StepperInput } from '@/components/checklist/StepperInput';
import { ActivityMinutesInput } from '@/components/checklist/ActivityMinutesInput';
import { SkillMinutesInput } from '@/components/checklist/SkillMinutesInput';
import { SegmentedControl } from '@/components/checklist/SegmentedControl';
import { ReflectionInput } from '@/components/checklist/ReflectionInput';
import { LiveScoreBar } from '@/components/checklist/LiveScoreBar';

export default function YesterdayGraceScreen() {
  const router = useRouter();
  const { reloadCycle } = useCycle();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiStandardError | null>(null);

  // Form State for Yesterday
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

  const handleAttendanceChange = (status: AttendanceStatus) => {
    setAttendance(status);
    if (status === 'off_day') {
      setIsOffDay(true);
    } else {
      setIsOffDay(false);
    }
  };

  const payload: ChecklistPayload = useMemo(
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

  const calculatedScore = useMemo(() => calculateDailyScore(payload), [payload]);

  const handleSubmitGrace = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await ChecklistService.submitYesterdayGrace(payload);

      await HapticsUtil.success();
      await reloadCycle();

      Alert.alert(
        'Yesterday Grace Saved! ⏳',
        `Yesterday’s score has been recorded: ${res.totalScore.toFixed(1)}%\nYour streak has been recovered!`,
        [
          {
            text: 'Return to Dashboard',
            onPress: () => router.replace('/(tabs)' as any),
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.badge}>
              <History size={20} color="#D97706" />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Yesterday Grace Window</Text>
              <Text style={styles.subtitle}>
                You have until 23:59 tonight to record or update yesterday's checklist.
              </Text>
            </View>
          </View>

          {/* Live Score */}
          <LiveScoreBar
            score={calculatedScore.totalScore}
            achievedPoints={calculatedScore.achievedPoints}
            maxPoints={calculatedScore.maxAvailablePoints}
          />

          <ErrorBanner message={error?.message ?? null} code={error?.code} />

          {/* Form Items */}
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
            subtitle="Reviewed class materials or lecture notes"
            points={10}
            value={classWorkRecap}
            onValueChange={setClassWorkRecap}
          />

          <ReflectionInput
            title="Daily Learning Note"
            subtitle="What knowledge did you acquire yesterday?"
            placeholder="e.g. Mastered React Native gesture handlers..."
            points={10}
            value={dailyLearning}
            onChange={setDailyLearning}
          />

          <SkillMinutesInput minutes={skillMinutes} onChange={setSkillMinutes} />

          <ItemToggle
            title="Personal Discipline"
            subtitle="Morning routine or spiritual practice"
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
            subtitle="Slept on or before your target sleep time"
            points={6}
            value={sleepOnTime}
            onValueChange={setSleepOnTime}
            icon={<Moon size={18} color="#6366F1" />}
          />

          <StepperInput
            title="Social Interactions"
            subtitle="Meaningful face-to-face interactions"
            value={socialCount}
            onChange={setSocialCount}
          />

          <ReflectionInput
            title="Self-Reflection Journal"
            subtitle="Honest review of yesterday's performance"
            placeholder="e.g. Kept good habits throughout..."
            points={8}
            value={selfReflection}
            onChange={setSelfReflection}
          />

          <View style={styles.submitSection}>
            <Button
              title="Submit Yesterday's Grace Entry"
              onPress={handleSubmitGrace}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  subtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  submitSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  submitBtn: {
    height: 54,
  },
});
