import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useCycle } from '@/context/CycleContext';
import { ScoreService } from '@/services/score.service';
import { MonthlyReportData } from '@/types/score.types';
import { LifeRadarChart } from '@/components/charts/LifeRadarChart';
import { Button } from '@/components/common/Button';

const LIFE_STAGES_DIRECTORY = [
  { stage: 10, name: 'Exceptional Self-Development', range: '95–100%' },
  { stage: 9, name: 'Exemplary Lifestyle', range: '90–94.9%' },
  { stage: 8, name: 'High Achiever', range: '80–89.9%' },
  { stage: 7, name: 'Disciplined Student', range: '70–79.9%' },
  { stage: 6, name: 'Steady Progress', range: '60–69.9%' },
  { stage: 5, name: 'Moderate Balance', range: '50–59.9%' },
  { stage: 4, name: 'Emerging Awareness', range: '40–49.9%' },
  { stage: 3, name: 'Inconsistent Routine', range: '30–39.9%' },
  { stage: 2, name: 'Struggling / Low Discipline', range: '20–29.9%' },
  { stage: 1, name: 'Critical / Highly Unbalanced', range: '0–19.9%' },
];

export default function MonthlyReportScreen() {
  const router = useRouter();
  const { activeCycle, hasActiveCycle, isCycleLoading } = useCycle();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);

  const fetchMonthlyReport = useCallback(async () => {
    if (!activeCycle) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await ScoreService.getMonthlyReport(activeCycle.cycleId);
      if (res.isCompleted && res.data) {
        setIsCompleted(true);
        setReportData(res.data);
      } else {
        setIsCompleted(false);
        setReportData(null);
      }
    } catch (err) {
      console.warn('[MonthlyScreen] Fetch error:', err);
      setIsCompleted(false);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeCycle]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMonthlyReport();
    setRefreshing(false);
  };

  const getStageColor = (stage: number) => {
    if (stage >= 8) return { bg: '#2563EB', badge: '#DBEAFE', badgeText: '#1E40AF' };
    if (stage >= 6) return { bg: '#0D9488', badge: '#CCFBF1', badgeText: '#0F766E' };
    if (stage >= 4) return { bg: '#D97706', badge: '#FEF3C7', badgeText: '#B45309' };
    return { bg: '#DC2626', badge: '#FEE2E2', badgeText: '#991B1B' };
  };

  if (!hasActiveCycle && !isCycleLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Award size={48} color="#2563EB" />
          <Text style={styles.emptyTitle}>No Active Cycle</Text>
          <Text style={styles.emptySubtitle}>
            Complete a 30-day tracking journey to unlock your official Life Stage classification and comprehensive lifestyle reflection.
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
          <Text style={styles.headerTitle}>30-Day Life Stage</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive evaluation across 10 lifestyle development stages
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading 30-day evaluation...</Text>
          </View>
        )}

        {/* State A: In-Progress 30-Day Journey (Day < 30) */}
        {!loading && !isCompleted && (
          <View style={styles.inProgressSection}>
            <View style={styles.journeyCard}>
              <View style={styles.journeyHeader}>
                <View>
                  <Text style={styles.journeyLabel}>CURRENT CYCLE #{activeCycle?.cycleNumber || 1}</Text>
                  <Text style={styles.journeyDays}>
                    Day {activeCycle?.dayNumber || 1} of 30
                  </Text>
                </View>
                <View style={styles.daysRemainingBadge}>
                  <Text style={styles.daysRemainingText}>
                    {30 - (activeCycle?.dayNumber || 1)} Days Left
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(100, ((activeCycle?.dayNumber || 1) / 30) * 100)}%` },
                  ]}
                />
              </View>

              <Text style={styles.journeyNotice}>
                🌟 The final 30-Day Life Stage & Insights Report unlocks after you complete Day 30. Keep logging your daily habits!
              </Text>
            </View>

            {/* Educational 10 Life Stages Guide */}
            <View style={styles.stagesDirectory}>
              <View style={styles.dirHeader}>
                <ShieldCheck size={20} color="#2563EB" />
                <Text style={styles.dirTitle}>10 Life Stages Benchmark</Text>
              </View>
              <Text style={styles.dirSub}>
                Your final Life Score will place you in one of the following stages:
              </Text>

              <View style={styles.stagesList}>
                {LIFE_STAGES_DIRECTORY.map((s) => (
                  <View key={s.stage} style={styles.stageRow}>
                    <View style={styles.stageNumBadge}>
                      <Text style={styles.stageNumText}>S{s.stage}</Text>
                    </View>
                    <Text style={styles.stageName}>{s.name}</Text>
                    <Text style={styles.stageRange}>{s.range}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* State B: Completed 30-Day Life Stage Report */}
        {!loading && isCompleted && reportData && (
          <View style={styles.completedSection}>
            {/* Life Stage Hero Banner */}
            <View
              style={[
                styles.heroBanner,
                { backgroundColor: getStageColor(reportData.lifeStage).bg },
              ]}>
              <View
                style={[
                  styles.stageBadgePill,
                  { backgroundColor: getStageColor(reportData.lifeStage).badge },
                ]}>
                <Text
                  style={[
                    styles.stageBadgeText,
                    { color: getStageColor(reportData.lifeStage).badgeText },
                  ]}>
                  STAGE {reportData.lifeStage} OF 10
                </Text>
              </View>

              <Text style={styles.heroTitle}>{reportData.lifeStageName}</Text>
              <Text style={styles.heroDesc}>{reportData.lifeStageDescription}</Text>

              {/* Primary Metrics Row */}
              <View style={styles.heroMetrics}>
                <View style={styles.heroMetricItem}>
                  <Text style={styles.heroMetricVal}>{reportData.lifeScore.toFixed(1)}%</Text>
                  <Text style={styles.heroMetricLbl}>30-DAY LIFE SCORE</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroMetricItem}>
                  <Text style={styles.heroMetricVal}>{reportData.habitConsistency.toFixed(1)}%</Text>
                  <Text style={styles.heroMetricLbl}>HABIT CONSISTENCY</Text>
                </View>
              </View>
            </View>

            {/* 12-Axis SVG Radar Chart */}
            <LifeRadarChart areaCompletionRates={reportData.areaCompletionRates || {}} />

            {/* Top 3 Strengths & Weaknesses */}
            <View style={styles.analysisRow}>
              {/* Strengths */}
              <View style={[styles.rankCard, styles.strengthCard]}>
                <View style={styles.rankHeader}>
                  <CheckCircle size={18} color="#16A34A" />
                  <Text style={styles.strengthTitle}>Top 3 Strengths</Text>
                </View>
                {reportData.strengths?.map((item, idx) => (
                  <View key={item.item || idx} style={styles.rankItem}>
                    <Text style={styles.rankPos}>#{idx + 1}</Text>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName}>{item.areaName}</Text>
                      <Text style={styles.rankPct}>
                        {Math.round(item.completionRate * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Weaknesses */}
              <View style={[styles.rankCard, styles.weaknessCard]}>
                <View style={styles.rankHeader}>
                  <AlertCircle size={18} color="#D97706" />
                  <Text style={styles.weaknessTitle}>Top 3 Weaknesses</Text>
                </View>
                {reportData.weaknesses?.map((item, idx) => (
                  <View key={item.item || idx} style={styles.rankItem}>
                    <Text style={styles.rankPos}>#{idx + 1}</Text>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName}>{item.areaName}</Text>
                      <Text style={styles.rankPct}>
                        {Math.round(item.completionRate * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Life Insight Card */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Zap size={20} color="#2563EB" />
                <Text style={styles.insightTitle}>Personalized Life Insight</Text>
              </View>
              <Text style={styles.insightBody}>{reportData.lifeInsight}</Text>

              {!reportData.hasEnoughData && (
                <View style={styles.limitedDataNotice}>
                  <Text style={styles.limitedDataText}>
                    ⚠️ Habit consistency was under 50% ({reportData.daysTracked}/30 days tracked). This insight is generated with limited data.
                  </Text>
                </View>
              )}
            </View>

            {/* Improvement Suggestions */}
            {reportData.improvementSuggestions?.length > 0 && (
              <View style={styles.suggestionsCard}>
                <Text style={styles.suggestionsTitle}>Recommendations for Next Cycle:</Text>
                {reportData.improvementSuggestions.map((sug, i) => (
                  <View key={i} style={styles.suggestionRow}>
                    <Text style={styles.suggestionBullet}>•</Text>
                    <Text style={styles.suggestionText}>{sug}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer Action: Start Cycle 2 */}
            <View style={styles.footerAction}>
              <Button
                title={`Start Cycle #${reportData.cycleNumber + 1}`}
                onPress={() => router.push('/cycle/setup' as any)}
                style={styles.nextCycleBtn}
              />
            </View>
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
  inProgressSection: {
    gap: 16,
  },
  journeyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  journeyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  journeyDays: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  daysRemainingBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  daysRemainingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  journeyNotice: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    fontWeight: '500',
  },
  stagesDirectory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dirTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dirSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  stagesList: {
    gap: 8,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stageNumBadge: {
    width: 32,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    marginRight: 10,
  },
  stageNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  stageName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  stageRange: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  completedSection: {
    gap: 16,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  stageBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 10,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 18,
    width: '100%',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetricLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  analysisRow: {
    gap: 12,
  },
  rankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
  },
  strengthCard: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  weaknessCard: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  strengthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
  },
  weaknessTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rankPos: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    width: 24,
  },
  rankInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  rankPct: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  limitedDataNotice: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  limitedDataText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
  },
  suggestionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  suggestionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  footerAction: {
    marginTop: 8,
    marginBottom: 20,
  },
  nextCycleBtn: {
    height: 52,
  },
});
