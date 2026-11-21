import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Award,
  Sunrise,
  BookOpen,
  Users,
  Brain,
  Activity,
  Briefcase,
  FileCheck,
  Smartphone,
  Moon,
  Sparkles,
  Edit3,
} from 'lucide-react-native';

import { ScoreService } from '@/services/score.service';
import { DailyScoreRecord } from '@/types/score.types';
import { Button } from '@/components/common/Button';

export default function DailyScoreScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [loading, setLoading] = useState(true);
  const [scoreRecord, setScoreRecord] = useState<DailyScoreRecord | null>(null);

  useEffect(() => {
    async function loadScore() {
      try {
        setLoading(true);
        const targetDate = date || 'today';
        const res = await ScoreService.getScoreByDate(targetDate);
        setScoreRecord(res);
      } catch (err) {
        console.warn('[DailyScoreScreen] Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScore();
  }, [date]);

  const itemsConfig = [
    { key: 'item1', label: 'Early Morning', max: 8, icon: <Sunrise size={18} color="#D97706" /> },
    { key: 'item2', label: 'University Attendance', max: 10, icon: <BookOpen size={18} color="#2563EB" /> },
    { key: 'item3', label: 'Class Participation', max: 8, icon: <FileCheck size={18} color="#2563EB" /> },
    { key: 'item4', label: 'Personal Discipline', max: 8, icon: <Sparkles size={18} color="#E11D48" /> },
    { key: 'item5', label: 'Social Interaction', max: 6, icon: <Users size={18} color="#7C3AED" /> },
    { key: 'item6', label: 'Daily Learning Note', max: 10, icon: <Brain size={18} color="#0D9488" /> },
    { key: 'item7', label: 'Physical Activity', max: 10, icon: <Activity size={18} color="#16A34A" /> },
    { key: 'item8', label: 'Skill Development', max: 10, icon: <Briefcase size={18} color="#D97706" /> },
    { key: 'item9', label: 'Class Work Recap', max: 10, icon: <BookOpen size={18} color="#2563EB" /> },
    { key: 'item10', label: 'Social Media Control', max: 6, icon: <Smartphone size={18} color="#8B5CF6" /> },
    { key: 'item11', label: 'Self-Reflection Journal', max: 8, icon: <Award size={18} color="#7C3AED" /> },
    { key: 'item12', label: 'Sleeping on Time', max: 6, icon: <Moon size={18} color="#6366F1" /> },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Calculating score breakdown...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!scoreRecord) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Score Recorded</Text>
          <Text style={styles.emptySubtitle}>There is no checklist submission for this date yet.</Text>
          <Button
            title="Go to Today's Checklist"
            onPress={() => router.push('/(tabs)/checklist' as any)}
            style={{ width: 220, marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const getScoreTheme = (pct: number) => {
    if (pct >= 85) return { bg: '#DCFCE7', text: '#15803D', badge: 'High Achiever Day 🌟' };
    if (pct >= 70) return { bg: '#EFF6FF', text: '#1D4ED8', badge: 'Disciplined Student Day 🚀' };
    if (pct >= 50) return { bg: '#FEF3C7', text: '#B45309', badge: 'Moderate Balance ⚖️' };
    return { bg: '#FEE2E2', text: '#B91C1C', badge: 'Needs Attention ⚠️' };
  };

  const theme = getScoreTheme(scoreRecord.totalScore);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Bar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#0F172A" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>

        {/* Hero Score Card */}
        <View style={styles.heroCard}>
          <View style={[styles.badgePill, { backgroundColor: theme.bg }]}>
            <Text style={[styles.badgeText, { color: theme.text }]}>{theme.badge}</Text>
          </View>

          <Text style={styles.scorePercentage}>{scoreRecord.totalScore.toFixed(1)}%</Text>
          <Text style={styles.pointsEarned}>
            {scoreRecord.achievedPoints} / {scoreRecord.maxAvailablePoints} Available Points
          </Text>

          <Text style={styles.dayBadge}>Day {scoreRecord.dayNumber} of 30</Text>
        </View>

        {/* Breakdown List Header */}
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>12 Life Areas Breakdown</Text>
          <Text style={styles.breakdownSub}>Points earned across daily targets</Text>
        </View>

        {/* Breakdown Cards */}
        <View style={styles.itemsList}>
          {itemsConfig.map((item) => {
            const earned = scoreRecord.scores[item.key] ?? 0;
            const max = (scoreRecord.maxAvailablePoints === 82 && (item.key === 'item2' || item.key === 'item3')) ? 0 : item.max;
            const isExcluded = max === 0;
            const percent = isExcluded ? 0 : Math.min(100, (earned / max) * 100);

            return (
              <View key={item.key} style={styles.itemRow}>
                <View style={styles.itemIconBox}>{item.icon}</View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.label}</Text>
                    <Text style={[styles.itemScore, isExcluded && styles.excludedText]}>
                      {isExcluded ? 'Off-Day' : `${earned} / ${max} pts`}
                    </Text>
                  </View>
                  {!isExcluded && (
                    <View style={styles.itemBarTrack}>
                      <View
                        style={[
                          styles.itemBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: percent === 100 ? '#16A34A' : percent > 0 ? '#2563EB' : '#E2E8F0',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Checklist Entry"
            variant="outline"
            onPress={() => router.push('/(tabs)/checklist' as any)}
            style={styles.editBtn}
          />
          <Button
            title="Return to Dashboard"
            onPress={() => router.replace('/(tabs)' as any)}
            style={styles.returnBtn}
          />
        </View>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  pointsEarned: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  dayBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 12,
  },
  breakdownHeader: {
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  breakdownSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  excludedText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  itemBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  editBtn: {
    marginVertical: 0,
  },
  returnBtn: {
    marginVertical: 0,
  },
});
