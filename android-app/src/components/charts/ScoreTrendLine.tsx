import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyScoreRecord } from '@/types/score.types';

interface ScoreTrendLineProps {
  scores: DailyScoreRecord[];
}

export const ScoreTrendLine: React.FC<ScoreTrendLineProps> = ({ scores }) => {
  // Take last 7 days of scores
  const recentScores = scores.slice(-7);

  if (recentScores.length === 0) {
    return null;
  }

  const getBarColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 50) return '#D97706';
    return '#DC2626';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent 7-Day Performance</Text>
      <View style={styles.chartRow}>
        {recentScores.map((item, index) => {
          const heightPercent = Math.max(12, Math.min(100, item.totalScore));
          const color = getBarColor(item.totalScore);
          return (
            <View key={item.date || index} style={styles.barColumn}>
              <Text style={styles.scoreText}>{Math.round(item.totalScore)}%</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>D{item.dayNumber}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  barTrack: {
    width: 22,
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
});

export default ScoreTrendLine;
