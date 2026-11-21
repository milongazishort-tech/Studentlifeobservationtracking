import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus, Users } from 'lucide-react-native';
import { HapticsUtil } from '@/utils/haptics';

interface StepperInputProps {
  title: string;
  subtitle: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
}

export const StepperInput: React.FC<StepperInputProps> = ({
  title,
  subtitle,
  value,
  min = 0,
  max = 50,
  onChange,
}) => {
  // Score rule: >= 3 => 6 pts, 2 => 4 pts, 1 => 2 pts, 0 => 0 pts
  const points = value >= 3 ? 6 : value === 2 ? 4 : value === 1 ? 2 : 0;

  const handleDec = () => {
    if (value > min) {
      HapticsUtil.lightImpact();
      onChange(value - 1);
    }
  };

  const handleInc = () => {
    if (value < max) {
      HapticsUtil.lightImpact();
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Users size={18} color="#2563EB" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.pointsBadge, points > 0 && styles.pointsBadgeActive]}>
          <Text style={[styles.pointsText, points > 0 && styles.pointsTextActive]}>
            {points} / 6 pts
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.stepperContainer}>
        <Text style={styles.hintText}>Meaningful conversations (≥3 for max points)</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity onPress={handleDec} style={styles.iconBtn} disabled={value <= min}>
            <Minus size={18} color={value <= min ? '#CBD5E1' : '#2563EB'} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value}</Text>
          <TouchableOpacity onPress={handleInc} style={styles.iconBtn} disabled={value >= max}>
            <Plus size={18} color={value >= max ? '#CBD5E1' : '#2563EB'} />
          </TouchableOpacity>
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 6,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 36,
    textAlign: 'center',
  },
});

export default StepperInput;
