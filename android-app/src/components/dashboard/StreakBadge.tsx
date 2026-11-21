import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  const getBadgeStyle = () => {
    if (streak >= 21) return { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C', flame: '#DC2626' };
    if (streak >= 7) return { bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C', flame: '#EA580C' };
    return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', flame: '#2563EB' };
  };

  const style = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Flame size={22} color={style.flame} />
      <View>
        <Text style={[styles.streakNumber, { color: style.text }]}>
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </Text>
        <Text style={styles.streakLabel}>CURRENT STREAK</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
});

export default StreakBadge;
