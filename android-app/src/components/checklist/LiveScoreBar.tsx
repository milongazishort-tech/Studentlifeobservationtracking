import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LiveScoreBarProps {
  score: number;             // 0 to 100%
  achievedPoints: number;
  maxPoints: number;
}

export const LiveScoreBar: React.FC<LiveScoreBarProps> = ({
  score,
  achievedPoints,
  maxPoints,
}) => {
  const getBadgeColor = () => {
    if (score >= 80) return { bg: '#DCFCE7', text: '#15803D' };
    if (score >= 50) return { bg: '#FEF3C7', text: '#B45309' };
    return { bg: '#FEE2E2', text: '#B91C1C' };
  };

  const badge = getBadgeColor();

  return (
    <View style={styles.bar}>
      <View>
        <Text style={styles.label}>LIVE DAILY SCORE</Text>
        <Text style={styles.pointsSub}>
          {achievedPoints} / {maxPoints} available points
        </Text>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.scoreText, { color: badge.text }]}>
          {score.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  pointsSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export default LiveScoreBar;
