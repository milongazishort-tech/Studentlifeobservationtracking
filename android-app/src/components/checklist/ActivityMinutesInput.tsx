import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { HapticsUtil } from '@/utils/haptics';

interface ActivityMinutesInputProps {
  active: boolean;
  minutes: number;
  onActiveChange: (active: boolean) => void;
  onMinutesChange: (mins: number) => void;
}

export const ActivityMinutesInput: React.FC<ActivityMinutesInputProps> = ({
  active,
  minutes,
  onActiveChange,
  onMinutesChange,
}) => {
  // Score rule: active AND mins >= 15 -> 10 pts; active AND mins < 15 -> 5 pts; inactive -> 0 pts
  const points = !active ? 0 : minutes >= 15 ? 10 : 5;

  const quickMinutes = [15, 30, 45, 60];

  const handleToggle = (val: boolean) => {
    HapticsUtil.lightImpact();
    onActiveChange(val);
    if (val && minutes === 0) {
      onMinutesChange(20);
    }
  };

  const handleSelectMinutes = (m: number) => {
    HapticsUtil.lightImpact();
    onMinutesChange(m);
    if (!active) onActiveChange(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Activity size={18} color="#16A34A" />
          <Text style={styles.title}>Physical Activity / Exercise</Text>
        </View>
        <View style={[styles.pointsBadge, points > 0 && styles.pointsBadgeActive]}>
          <Text style={[styles.pointsText, points > 0 && styles.pointsTextActive]}>
            {points} / 10 pts
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Walking, running, workout or sports (≥15 mins for full 10 pts)</Text>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Did you exercise today?</Text>
        <Switch
          value={active}
          onValueChange={handleToggle}
          trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
          thumbColor={active ? '#16A34A' : '#94A3B8'}
        />
      </View>

      {active && (
        <View style={styles.minutesSection}>
          <Text style={styles.minutesLabel}>Duration: <Text style={styles.minsBold}>{minutes} minutes</Text></Text>
          <View style={styles.pillsRow}>
            {quickMinutes.map((m) => {
              const isSelected = minutes === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleSelectMinutes(m)}
                  style={[styles.minutePill, isSelected && styles.minutePillSelected]}>
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {m}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  pointsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pointsTextActive: {
    color: '#15803D',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  minutesSection: {
    marginTop: 12,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
  },
  minutesLabel: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 8,
  },
  minsBold: {
    fontWeight: '800',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minutePill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  minutePillSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});

export default ActivityMinutesInput;
