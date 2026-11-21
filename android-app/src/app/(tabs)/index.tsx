import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { format, subDays } from 'date-fns';

import { useAuth } from '@/context/AuthContext';
import { useCycle } from '@/context/CycleContext';
import { ScoreService } from '@/services/score.service';
import { DailyScoreRecord } from '@/types/score.types';
import { Button } from '@/components/common/Button';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { GraceAlertBanner } from '@/components/dashboard/GraceAlertBanner';
import { ScoreTrendLine } from '@/components/charts/ScoreTrendLine';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeCycle, hasActiveCycle, isCycleLoading, reloadCycle, abandonCycle } = useCycle();

  const [todayScore, setTodayScore] = useState<DailyScoreRecord | null>(null);
  const [cycleScores, setCycleScores] = useState<DailyScoreRecord[]>([]);
  const [showGraceBanner, setShowGraceBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardScores = useCallback(async () => {
    if (!activeCycle) {
      setTodayScore(null);
      setCycleScores([]);
      setShowGraceBanner(false);
      return;
    }

    try {
      const [todayRes, allScores] = await Promise.all([
        ScoreService.getTodayScore(),
        ScoreService.getCycleScores(activeCycle.cycleId),
      ]);

      setTodayScore(todayRes);
      setCycleScores(allScores);

      // Check if yesterday was missed (if dayNumber > 1)
      if (activeCycle.dayNumber > 1) {
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const hasYesterday = allScores.some(
          (s) => s.date?.startsWith(yesterdayStr) && s.totalScore > 0
        );
        setShowGraceBanner(!hasYesterday);
      } else {
        setShowGraceBanner(false);
      }
    } catch (err) {
      console.warn('[DashboardScreen] Failed to load scores:', err);
    }
  }, [activeCycle]);

  useEffect(() => {
    loadDashboardScores();
  }, [loadDashboardScores]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reloadCycle(), loadDashboardScores()]);
    setRefreshing(false);
  };

  const handleAbandon = () => {
    if (!activeCycle) return;
    Alert.alert(
      'Abandon Active Cycle?',
      `Are you sure you want to cancel Cycle #${activeCycle.cycleNumber}? Your active streak will reset.`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Abandon Cycle',
          style: 'destructive',
          onPress: async () => {
            try {
              await abandonCycle(activeCycle.cycleId);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to abandon cycle.');
            }
          },
        },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 50) return '#D97706';
    return '#DC2626';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing || isCycleLoading} onRefresh={onRefresh} />}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Student'} 👋</Text>
            <Text style={styles.institution}>
              {user?.university} • {user?.department}
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{format(new Date(), 'EEE, MMM d')}</Text>
          </View>
        </View>

        {/* State 1: No Active Cycle Card */}
        {!hasActiveCycle && !isCycleLoading && (
          <View style={styles.emptyCycleCard}>
            <View style={styles.emptyIconBadge}>
              <Sparkles size={32} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>No Active Tracking Cycle</Text>
            <Text style={styles.emptySubtitle}>
              Observe, understand, and improve your university routine across 12 daily life areas for the next 30 days.
            </Text>
            <Button
              title="Start Your 30-Day Cycle"
              onPress={() => router.push('/cycle/setup' as any)}
              style={styles.startBtn}
            />
          </View>
        )}

        {/* State 2: Active Cycle Dashboard */}
        {hasActiveCycle && activeCycle && (
          <View style={styles.activeSection}>
            {/* Grace Window Warning Banner if yesterday missed */}
            <GraceAlertBanner show={showGraceBanner} />

            {/* Cycle Milestone & Streak Card */}
            <View style={styles.cycleCard}>
              <View style={styles.cycleHeader}>
                <View>
                  <Text style={styles.cycleLabel}>CYCLE #{activeCycle.cycleNumber}</Text>
                  <Text style={styles.dayCounter}>Day {activeCycle.dayNumber} of 30</Text>
                </View>
                <StreakBadge streak={activeCycle.currentStreak} />
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(100, (activeCycle.dayNumber / 30) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {30 - activeCycle.dayNumber} days remaining until final Life Stage report
              </Text>
            </View>

            {/* Today's Score / Status Card */}
            <View style={styles.todayCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.todayTitle}>Today's Daily Status</Text>
                {activeCycle.hasSubmittedToday ? (
                  <View style={styles.submittedPill}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <Text style={styles.submittedText}>Recorded</Text>
                  </View>
                ) : (
                  <View style={styles.pendingPill}>
                    <AlertCircle size={16} color="#D97706" />
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                )}
              </View>

              {activeCycle.hasSubmittedToday && todayScore ? (
                <View style={styles.scoreRow}>
                  <View
                    style={[
                      styles.scoreCircle,
                      { borderColor: getScoreColor(todayScore.totalScore) },
                    ]}>
                    <Text
                      style={[
                        styles.scorePercent,
                        { color: getScoreColor(todayScore.totalScore) },
                      ]}>
                      {todayScore.totalScore.toFixed(0)}%
                    </Text>
                    <Text style={styles.scorePoints}>
                      {todayScore.achievedPoints}/{todayScore.maxAvailablePoints}
                    </Text>
                  </View>

                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreTitle}>Checklist Completed!</Text>
                    <Text style={styles.scoreDesc}>
                      You earned {todayScore.achievedPoints} points today.
                    </Text>
                    <TouchableOpacity
                      style={styles.breakdownLink}
                      onPress={() => router.push('/score/today' as any)}>
                      <Text style={styles.breakdownLinkText}>View Score Breakdown</Text>
                      <ChevronRight size={16} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.statusContent}>
                  <Text style={styles.statusDesc}>
                    Record your 12 life areas today before 23:59 midnight to maintain your streak!
                  </Text>
                  <Button
                    title="Complete Today's Checklist"
                    onPress={() => router.push('/(tabs)/checklist' as any)}
                    style={styles.actionBtn}
                  />
                </View>
              )}

              {activeCycle.hasSubmittedToday && (
                <View style={styles.editRow}>
                  <Button
                    title="Edit Today's Checklist"
                    variant="outline"
                    onPress={() => router.push('/(tabs)/checklist' as any)}
                    style={styles.editBtn}
                  />
                </View>
              )}
            </View>

            {/* Recent 7-Day Performance Mini-Chart */}
            <ScoreTrendLine scores={cycleScores} />

            {/* Target Times Quick Reference */}
            <View style={styles.targetsRow}>
              <View style={styles.targetCard}>
                <Clock size={18} color="#2563EB" />
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Wake Target</Text>
                  <Text style={styles.targetVal}>{user?.targetWakeUpTime || '06:30'}</Text>
                </View>
              </View>

              <View style={styles.targetCard}>
                <Clock size={18} color="#6366F1" />
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Bedtime Target</Text>
                  <Text style={styles.targetVal}>{user?.targetSleepTime || '23:00'}</Text>
                </View>
              </View>
            </View>

            {/* Abandon Cycle Option */}
            <TouchableOpacity onPress={handleAbandon} style={styles.abandonButton}>
              <Text style={styles.abandonText}>Abandon Current Cycle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  institution: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  dateBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyCycleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startBtn: {
    width: '100%',
  },
  activeSection: {
    gap: 16,
  },
  cycleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cycleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  dayCounter: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  submittedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  submittedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 6,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  scorePercent: {
    fontSize: 20,
    fontWeight: '900',
  },
  scorePoints: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  scoreDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  breakdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  breakdownLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  statusContent: {
    marginTop: 4,
  },
  statusDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 14,
  },
  actionBtn: {
    marginVertical: 0,
  },
  editRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  editBtn: {
    marginVertical: 0,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  targetVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  abandonButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  abandonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
