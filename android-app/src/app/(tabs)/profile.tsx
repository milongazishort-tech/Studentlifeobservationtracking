import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Clock,
  Sunrise,
  Moon,
  Bell,
  LogOut,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building,
  GraduationCap,
  Mail,
  Shield,
} from 'lucide-react-native';

import { useAuth } from '@/context/AuthContext';
import { useCycle } from '@/context/CycleContext';
import { UserService } from '@/services/user.service';
import { NotificationService } from '@/services/notification.service';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { HapticsUtil } from '@/utils/haptics';
import { ApiStandardError } from '@/types/api.types';

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, reloadProfile } = useAuth();
  const { activeCycle } = useCycle();

  // Targets state
  const [wakeUpTime, setWakeUpTime] = useState(user?.targetWakeUpTime || '06:30');
  const [sleepTime, setSleepTime] = useState(user?.targetSleepTime || '23:00');
  const [reminderTime, setReminderTime] = useState(user?.reminderTime || '21:00');
  const [reminderEnabled, setReminderEnabled] = useState(user?.reminderEnabled ?? true);

  const [savingTargets, setSavingTargets] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState<ApiStandardError | null>(null);

  const handleSaveTargets = async () => {
    // Validate time format
    if (!TIME_REGEX.test(wakeUpTime.trim())) {
      setError({
        code: 'INVALID_TIME_FORMAT',
        message: 'Wake-up target must follow HH:mm 24-hour format (e.g. 06:30).',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!TIME_REGEX.test(sleepTime.trim())) {
      setError({
        code: 'INVALID_TIME_FORMAT',
        message: 'Bedtime target must follow HH:mm 24-hour format (e.g. 23:00).',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!TIME_REGEX.test(reminderTime.trim())) {
      setError({
        code: 'INVALID_TIME_FORMAT',
        message: 'Reminder time must follow HH:mm 24-hour format (e.g. 21:00).',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setSavingTargets(true);
      setError(null);

      await UserService.updateProfile({
        targetWakeUpTime: wakeUpTime.trim(),
        targetSleepTime: sleepTime.trim(),
        reminderTime: reminderTime.trim(),
        reminderEnabled,
      });

      // Sync local push notifications
      if (reminderEnabled) {
        await NotificationService.scheduleDailyReminder(reminderTime.trim());
      } else {
        await NotificationService.cancelAllReminders();
      }

      await reloadProfile();
      await HapticsUtil.success();

      Alert.alert('Settings Updated ✨', 'Your lifestyle targets and daily reminders have been saved.');
    } catch (err: any) {
      await HapticsUtil.error();
      setError(err as ApiStandardError);
    } finally {
      setSavingTargets(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of StudentLife?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account & Data',
      'This will permanently delete your student account, all cycle records, checklists, and reports. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              await UserService.deleteAccount();
              await logout();
              router.replace('/(auth)/login' as any);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Profile Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>

            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <View style={styles.infoPills}>
              <View style={styles.infoPill}>
                <Building size={14} color="#64748B" />
                <Text style={styles.infoPillText}>{user?.university || 'University'}</Text>
              </View>
              <View style={styles.infoPill}>
                <GraduationCap size={14} color="#64748B" />
                <Text style={styles.infoPillText}>{user?.department || 'Department'}</Text>
              </View>
            </View>
          </View>

          <ErrorBanner message={error?.message ?? null} code={error?.code} />

          {/* Section: Lifestyle Target Times */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Lifestyle Targets & Reminders</Text>
            </View>
            <Text style={styles.cardSub}>
              Configured times are used to automatically evaluate daily wake-up and bedtime scoring items.
            </Text>

            {/* Target Wake-Up Time */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Sunrise size={16} color="#D97706" />
                <Text style={styles.inputLabel}>Target Wake-Up Time (24h)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={wakeUpTime}
                onChangeText={setWakeUpTime}
                placeholder="06:30"
                maxLength={5}
              />
            </View>

            {/* Target Sleep Time */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Moon size={16} color="#6366F1" />
                <Text style={styles.inputLabel}>Target Bedtime (24h)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="23:00"
                maxLength={5}
              />
            </View>

            {/* Daily Reminder Time */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Bell size={16} color="#0D9488" />
                <Text style={styles.inputLabel}>Daily Check-in Reminder (24h)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="21:00"
                maxLength={5}
              />
            </View>

            {/* Enable Push Notifications Toggle */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextGroup}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchDesc}>Daily reminder alert before midnight</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                thumbColor={reminderEnabled ? '#2563EB' : '#94A3B8'}
              />
            </View>

            <Button
              title="Save Target Settings"
              onPress={handleSaveTargets}
              loading={savingTargets}
              style={styles.saveBtn}
            />
          </View>

          {/* Section: Account & Cycle Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield size={18} color="#16A34A" />
              <Text style={styles.cardTitle}>Account & Cycle Status</Text>
            </View>

            <View style={styles.statusList}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Active Cycle</Text>
                <Text style={styles.statusVal}>
                  {activeCycle ? `Cycle #${activeCycle.cycleNumber} (Day ${activeCycle.dayNumber}/30)` : 'None'}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Active Streak</Text>
                <Text style={styles.statusVal}>{activeCycle?.currentStreak || 0} Consecutive Days</Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Email Status</Text>
                <Text style={[styles.statusVal, { color: user?.emailVerified ? '#16A34A' : '#D97706' }]}>
                  {user?.emailVerified ? 'Verified ✓' : 'Unverified'}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>App Version</Text>
                <Text style={styles.statusVal}>v1.0.0 (Production Ready)</Text>
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#64748B" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Danger Zone */}
          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <Trash2 size={18} color="#DC2626" />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            <Text style={styles.dangerDesc}>
              Permanently erase your student account, cycle history, and scores. This operation cannot be reversed.
            </Text>
            <Button
              title="Delete Account & All Data"
              variant="danger"
              onPress={handleDeleteAccount}
              loading={deletingAccount}
              style={styles.deleteBtn}
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  infoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  infoPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  switchTextGroup: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  switchDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  saveBtn: {
    marginTop: 10,
  },
  statusList: {
    gap: 10,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 50,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  dangerDesc: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 18,
    marginBottom: 12,
  },
  deleteBtn: {
    marginVertical: 0,
  },
});
