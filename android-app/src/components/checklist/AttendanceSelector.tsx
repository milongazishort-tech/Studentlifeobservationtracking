import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AttendanceStatus } from '@/types/checklist.types';
import { HapticsUtil } from '@/utils/haptics';

interface AttendanceSelectorProps {
  value: AttendanceStatus;
  onChange: (val: AttendanceStatus) => void;
}

export const AttendanceSelector: React.FC<AttendanceSelectorProps> = ({ value, onChange }) => {
  const options: { label: string; value: AttendanceStatus; pts: string }[] = [
    { label: 'Attended Classes', value: 'yes', pts: '+10 pts' },
    { label: 'Absent / Skipped', value: 'no', pts: '0 pts' },
    { label: 'Off Day / Weekend', value: 'off_day', pts: 'Excluded' },
  ];

  const handleSelect = (status: AttendanceStatus) => {
    HapticsUtil.lightImpact();
    onChange(status);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>University Attendance</Text>
        <Text style={styles.badge}>{value === 'yes' ? '+10 pts' : value === 'off_day' ? 'Excluded' : '0 pts'}</Text>
      </View>
      <Text style={styles.subtitle}>Select your university schedule for today</Text>

      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => handleSelect(opt.value)}
              style={[styles.pill, isSelected && styles.pillSelected]}>
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{opt.label}</Text>
              <Text style={[styles.pillSub, isSelected && styles.pillSubSelected]}>{opt.pts}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {value === 'off_day' && (
        <View style={styles.offDayNotice}>
          <Text style={styles.offDayText}>
            ℹ️ On Off-Days, Items 2 & 3 are excluded from max available points (Max = 82 pts).
          </Text>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  optionsRow: {
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  pillTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  pillSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  pillSubSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  offDayNotice: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  offDayText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default AttendanceSelector;
