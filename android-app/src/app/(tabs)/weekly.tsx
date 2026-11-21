import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Lock,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { format } from 'date-fns';

import { useCycle } from '@/context/CycleContext';
import { ScoreService } from '@/services/score.service';
import { WeeklyReportData } from '@/types/score.types';
import { AreaBarChart } from '@/components/charts/AreaBarChart';
import { Button } from '@/components/common/Button';
import { useRouter } from 'expo-router';

interface WeekTabMeta {
  weekNum: number;
  label: string;
  days: string;
  endDay: number;
}

const WEEKS_META: WeekTabMeta[] = [
  { weekNum: 1, label: 'Week 1', days: 'Days 1–7', endDay: 7 },
  { weekNum: 2, label: 'Week 2', days: 'Days 8–14', endDay: 14 },
  { weekNum: 3, label: 'Week 3', days: 'Days 15–21', endDay: 21 },
  { weekNum: 4, label: 'Week 4', days: 'Days 22–28', endDay: 28 },
  { weekNum: 5, label: 'Final', days: 'Days 29–30', endDay: 30 },
];

export default function WeeklyAnalyticsScreen() {
  const router = useRouter();
  const { activeCycle, hasActiveCycle, isCycleLoading } = useCycle();

  // Compute recommended default week based on dayNumber
  const getDefaultWeek = () => {
    if (!activeCycle) return 1;
    const d = activeCycle.dayNumber;
    if (d > 28) return 5;
    if (d > 21) return 4;
    if (d > 14) return 3;
    if (d > 7) return 2;
    return 1;
  };

  const [selectedWeek, setSelectedWeek] = useState<number>(getDefaultWeek);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);

  const fetchWeeklyReport = useCallback(async (weekNum: number) => {
    if (!hasActiveCycle) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await ScoreService.getWeeklySummary(weekNum);
      if (res.isLocked) {
        setIsLocked(true);
        setLockMessage(res.lockMessage || `Week ${weekNum} report will unlock after Day ${WEEKS_META[weekNum - 1]?.endDay} is completed.`);
        setReportData(null);
      } else if (res.data) {
        setIsLocked(false);
        setReportData(res.data);
      }
    } catch (err: any) {
      console.warn('[WeeklyScreen] Fetch error:', err);
      setIsLocked(true);
      setLockMessage(err.message || 'Report not available yet.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [hasActiveCycle]);

  useEffect(() => {
    fetchWeeklyReport(selectedWeek);
  }, [selectedWeek, fetchWeeklyReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklyReport(selectedWeek);
    setRefreshing(false);
  };

  const currentMeta = WEEKS_META[selectedWeek - 1];

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: '#15803D', bg: '#DCFCE7' };
    if (score >= 50) return { text: '#B45309', bg: '#FEF3C7' };
    return { text: '#B91C1C', bg: '#FEE2E2' };
  };

  if (!hasActiveCycle && !isCycleLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <BarChart3 size={48} color="#2563EB" />
          <Text style={styles.emptyTitle}>No Active Cycle</Text>
          <Text style={styles.emptySubtitle}>
            Start a 30-day tracking cycle to unlock weekly analytics and personalized lifestyle focus tips.
          </Text>
          <Button
            title="Start 30-Day Cycle"
            onPress={() => router.push('/cycle/setup' as any)}
            style={{ width: 220, marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Milestones & 7-day lifestyle habit consistency
          </Text>
        </View>

        {/* Week Selector Tab Bar */}
        <View style={styles.tabBar}>
          {WEEKS_META.map((meta) => {
            const isSelected = selectedWeek === meta.weekNum;
            return (
              <TouchableOpacity
                key={meta.weekNum}
                onPress={() => setSelectedWeek(meta.weekNum)}
                style={[styles.tabItem, isSelected && styles.tabItemSelected]}>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                  {meta.label}
                </Text>
                <Text style={[styles.tabDays, isSelected && styles.tabDaysSelected]}>
                  {meta.days}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching Week {selectedWeek} analytics...</Text>
          </View>
        )}

        {/* State A: Locked Week Screen */}
        {!loading && isLocked && (
          <View style={styles.lockedCard}>
            <View style={styles.lockBadge}>
              <Lock size={32} color="#64748B" />
            </View>
            <Text style={styles.lockedTitle}>Week {selectedWeek} is Locked</Text>
            <Text style={styles.lockedDesc}>
              {lockMessage ||
                `This report unlocks after Day ${currentMeta?.endDay} is completed. Current progress: Day ${activeCycle?.dayNumber || 1} of 30.`}
            </Text>
            <View style={styles.lockedInfoBox}>
              <Calendar size={18} color="#2563EB" />
              <Text style={styles.lockedInfoText}>
                Keep filling your 12 daily life areas to unlock this milestone report!
              </Text>
            </View>
          </View>
        )}

        {/* State B: Unlocked Weekly Report */}
        {!loading && !isLocked && reportData && (
          <View style={styles.reportContent}>
            {/* Summary Metrics Grid */}
            <View style={styles.metricsGrid}>
              {/* Average Score Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>WEEKLY AVERAGE</Text>
                <Text style={styles.metricValue}>
                  {reportData.weeklyAverageScore.toFixed(1)}%
                </Text>
                <View
                  style={[
                    styles.metricBadge,
                    { backgroundColor: getScoreColor(reportData.weeklyAverageScore).bg },
                  ]}>
                  <Text
                    style={[
                      styles.metricBadgeText,
                      { color: getScoreColor(reportData.weeklyAverageScore).text },
                    ]}>
                    {reportData.weeklyAverageScore >= 80 ? 'High Achiever' : reportData.weeklyAverageScore >= 60 ? 'Disciplined' : 'Needs Balance'}
                  </Text>
                </View>
              </View>

              {/* Consistency Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TRACKING CONSISTENCY</Text>
                <Text style={styles.metricValue}>
                  {reportData.daysTracked} / {reportData.daysInWeek}
                </Text>
                <Text style={styles.metricSub}>Days Logged</Text>
              </View>
            </View>

            {/* Best & Lowest Day Row */}
            <View style={styles.extremesRow}>
              {reportData.bestDay && (
                <View style={[styles.extremeCard, styles.bestCard]}>
                  <Text style={styles.extremeLabel}>🌟 BEST DAY</Text>
                  <Text style={styles.extremeScore}>{reportData.bestDay.score.toFixed(0)}%</Text>
                  <Text style={styles.extremeDate}>
                    {format(new Date(reportData.bestDay.date), 'EEE, MMM d')}
                  </Text>
                </View>
              )}

              {reportData.lowestDay && (
                <View style={[styles.extremeCard, styles.lowestCard]}>
                  <Text style={styles.extremeLabel}>⚠️ LOWEST DAY</Text>
                  <Text style={styles.extremeScore}>{reportData.lowestDay.score.toFixed(0)}%</Text>
                  <Text style={styles.extremeDate}>
                    {format(new Date(reportData.lowestDay.date), 'EEE, MMM d')}
                  </Text>
                </View>
              )}
            </View>

            {/* Week-over-Week Delta Badge */}
            <View style={styles.deltaCard}>
              {reportData.deltaFromPreviousWeek !== null ? (
                <>
                  <View style={styles.deltaIconBox}>
                    {reportData.deltaFromPreviousWeek >= 0 ? (
                      <TrendingUp size={20} color="#16A34A" />
                    ) : (
                      <TrendingDown size={20} color="#DC2626" />
                    )}
                  </View>
                  <View style={styles.deltaInfo}>
                    <Text style={styles.deltaTitle}>
                      {reportData.deltaFromPreviousWeek >= 0 ? '+' : ''}
                      {reportData.deltaFromPreviousWeek.toFixed(1)}% vs Prior Week
                    </Text>
                    <Text style={styles.deltaSub}>
                      {reportData.deltaFromPreviousWeek >= 0
                        ? 'Great progress! Your weekly lifestyle consistency is trending upwards.'
                        : 'Slight dip this week. Check the focus tip below to rebuild momentum.'}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.deltaIconBox}>
                    <Sparkles size={20} color="#2563EB" />
                  </View>
                  <View style={styles.deltaInfo}>
                    <Text style={styles.deltaTitle}>Baseline Week</Text>
                    <Text style={styles.deltaSub}>
                      Week 1 sets your initial habit baseline. Week 2 will show your growth comparison!
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Contextual Focus Tip Card */}
            {reportData.focusTip && (
              <View style={styles.focusTipCard}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipIconBox}>
                    <Lightbulb size={20} color="#D97706" />
                  </View>
                  <Text style={styles.tipTitle}>This Week's Focus Tip</Text>
                </View>
                <Text style={styles.tipBody}>{reportData.focusTip}</Text>
              </View>
            )}

            {/* 12 Life Areas Breakdown Chart */}
            <AreaBarChart areaBreakdown={reportData.areaBreakdown || {}} />
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabItemSelected: {
    backgroundColor: '#2563EB',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabLabelSelected: {
    color: '#FFFFFF',
  },
  tabDays: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabDaysSelected: {
    color: '#BFDBFE',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
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
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  lockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  lockBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  lockedDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  lockedInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
  },
  lockedInfoText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  reportContent: {
    gap: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  metricBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  metricBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  extremesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  extremeCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  bestCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  lowestCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  extremeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  extremeScore: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  extremeDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  deltaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  deltaIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaInfo: {
    flex: 1,
  },
  deltaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  deltaSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  focusTipCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  tipBody: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '500',
  },
});
