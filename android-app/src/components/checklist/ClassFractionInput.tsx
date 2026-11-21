import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { HapticsUtil } from '@/utils/haptics';

interface ClassFractionInputProps {
  attended: number;
  total: number;
  isOffDay: boolean;
  onAttendedChange: (val: number) => void;
  onTotalChange: (val: number) => void;
}

export const ClassFractionInput: React.FC<ClassFractionInputProps> = ({
  attended,
  total,
  isOffDay,
  onAttendedChange,
  onTotalChange,
}) => {
  const points = isOffDay || total === 0 ? 0 : Math.round(((Math.min(attended, total) / total) * 8) * 10) / 10;

  const handleAttendedDec = () => {
    if (attended > 0) {
      HapticsUtil.lightImpact();
      onAttendedChange(attended - 1);
    }
  };

  const handleAttendedInc = () => {
    if (attended < total) {
      HapticsUtil.lightImpact();
      onAttendedChange(attended + 1);
    }
  };

  const handleTotalDec = () => {
    if (total > 0) {
      HapticsUtil.lightImpact();
      const newTotal = total - 1;
      onTotalChange(newTotal);
      if (attended > newTotal) {
        onAttendedChange(newTotal);
      }
    }
  };

  const handleTotalInc = () => {
    HapticsUtil.lightImpact();
    onTotalChange(total + 1);
  };

  if (isOffDay) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, styles.disabledText]}>Class Participation</Text>
          <Text style={styles.badgeDisabled}>Excluded (Off-Day)</Text>
        </View>
        <Text style={styles.subtitle}>No scheduled classes today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Class Participation</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{points} / 8 pts</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Classes attended out of total classes scheduled today (a / b × 8 pts)</Text>

      <View style={styles.steppersContainer}>
        {/* Attended Stepper */}
        <View style={styles.stepperBox}>
          <Text style={styles.stepperLabel}>Attended</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={handleAttendedDec} style={styles.iconBtn}>
              <Minus size={16} color="#2563EB" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{attended}</Text>
            <TouchableOpacity onPress={handleAttendedInc} style={styles.iconBtn}>
              <Plus size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.slash}>/</Text>

        {/* Scheduled Stepper */}
        <View style={styles.stepperBox}>
          <Text style={styles.stepperLabel}>Scheduled</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={handleTotalDec} style={styles.iconBtn}>
              <Minus size={16} color="#2563EB" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{total}</Text>
            <TouchableOpacity onPress={handleTotalInc} style={styles.iconBtn}>
              <Plus size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  disabledContainer: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
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
  disabledText: {
    color: '#64748B',
  },
  badgeDisabled: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  steppersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  stepperBox: {
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  slash: {
    fontSize: 24,
    fontWeight: '300',
    color: '#94A3B8',
    marginHorizontal: 12,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 6,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 32,
    textAlign: 'center',
  },
});

export default ClassFractionInput;
