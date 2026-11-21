import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Moon, Sunrise, Sparkles, CheckCircle, Calendar } from 'lucide-react-native';
import { useCycle } from '@/context/CycleContext';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ApiStandardError } from '@/types/api.types';

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export default function CycleSetupScreen() {
  const router = useRouter();
  const { startCycle } = useCycle();

  const [wakeUpTime, setWakeUpTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiStandardError | null>(null);

  const handleStartCycle = async () => {
    // Validate times
    if (!TIME_REGEX.test(wakeUpTime.trim())) {
      setError({
        code: 'INVALID_TIME_FORMAT',
        message: 'Wake-up time must follow 24-hour format HH:mm (e.g. 06:30).',
        field: 'targetWakeUpTime',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!TIME_REGEX.test(sleepTime.trim())) {
      setError({
        code: 'INVALID_TIME_FORMAT',
        message: 'Bedtime must follow 24-hour format HH:mm (e.g. 23:00).',
        field: 'targetSleepTime',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await startCycle({
        targetWakeUpTime: wakeUpTime.trim(),
        targetSleepTime: sleepTime.trim(),
        startDate: new Date().toISOString(),
      });

      Alert.alert(
        'Cycle Activated! 🎯',
        'Your 30-Day self-improvement cycle is now active. Complete today’s checklist to start your streak!',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/' as any),
          },
        ]
      );
    } catch (err: any) {
      setError(err as ApiStandardError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={22} color="#0F172A" />
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <Sparkles size={24} color="#2563EB" />
            </View>
            <Text style={styles.title}>Start 30-Day Cycle</Text>
            <Text style={styles.subtitle}>
              Observe yourself, understand your habits, and achieve personal mastery over 30 structured days.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <ErrorBanner message={error?.message ?? null} code={error?.code} />

            {/* Target Wake-Up Time */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Sunrise size={18} color="#D97706" />
                <Text style={styles.label}>Target Wake-Up Time (24h)</Text>
              </View>
              <Text style={styles.helperText}>Used to evaluate Item 1: Early Morning habit</Text>
              <View style={[styles.inputWrapper, error?.field === 'targetWakeUpTime' && styles.inputError]}>
                <Clock size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="06:30"
                  placeholderTextColor="#94A3B8"
                  value={wakeUpTime}
                  maxLength={5}
                  onChangeText={(val) => {
                    setWakeUpTime(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* Target Sleep Time */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Moon size={18} color="#6366F1" />
                <Text style={styles.label}>Target Bedtime (24h)</Text>
              </View>
              <Text style={styles.helperText}>Used to evaluate Item 12: Sleeping on time</Text>
              <View style={[styles.inputWrapper, error?.field === 'targetSleepTime' && styles.inputError]}>
                <Clock size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="23:00"
                  placeholderTextColor="#94A3B8"
                  value={sleepTime}
                  maxLength={5}
                  onChangeText={(val) => {
                    setSleepTime(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* What to expect box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>What to expect:</Text>
              <View style={styles.infoRow}>
                <CheckCircle size={16} color="#16A34A" style={styles.infoIcon} />
                <Text style={styles.infoText}>12 daily life areas scored out of 100 points</Text>
              </View>
              <View style={styles.infoRow}>
                <CheckCircle size={16} color="#16A34A" style={styles.infoIcon} />
                <Text style={styles.infoText}>Weekly radar analytics & personalized focus tips</Text>
              </View>
              <View style={styles.infoRow}>
                <CheckCircle size={16} color="#16A34A" style={styles.infoIcon} />
                <Text style={styles.infoText}>30-Day Life Stage Classification (Stages 1 to 10)</Text>
              </View>
            </View>

            {/* Submit button */}
            <Button
              title="Begin 30-Day Journey"
              onPress={handleStartCycle}
              loading={loading}
              style={styles.startBtn}
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
    padding: 24,
    paddingTop: 12,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 14,
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    flexShrink: 0,
  },
  infoText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '500',
  },
  startBtn: {
    marginTop: 10,
  },
});
