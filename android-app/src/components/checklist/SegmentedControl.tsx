import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Smartphone } from 'lucide-react-native';
import { SocialMediaControlLevel } from '@/types/checklist.types';
import { HapticsUtil } from '@/utils/haptics';

interface SegmentedControlProps {
  value: SocialMediaControlLevel;
  onChange: (val: SocialMediaControlLevel) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => {
  const pointsMap = { controlled: 6, useful: 3, excessive: 0 };
  const currentPoints = pointsMap[value] ?? 0;

  const options: { label: string; value: SocialMediaControlLevel; pts: string }[] = [
    { label: 'Controlled', value: 'controlled', pts: '6 pts' },
    { label: 'Useful / Study', value: 'useful', pts: '3 pts' },
    { label: 'Excessive / Doomscroll', value: 'excessive', pts: '0 pts' },
  ];

  const handleSelect = (v: SocialMediaControlLevel) => {
    HapticsUtil.lightImpact();
    onChange(v);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Smartphone size={18} color="#8B5CF6" />
          <Text style={styles.title}>Social Media Control</Text>
        </View>
        <View style={[styles.pointsBadge, currentPoints > 0 && styles.pointsBadgeActive]}>
          <Text style={[styles.pointsText, currentPoints > 0 && styles.pointsTextActive]}>
            {currentPoints} / 6 pts
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Daily screen time & social media discipline</Text>

      <View style={styles.pillsContainer}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              style={[styles.pill, isSelected && styles.pillSelected]}>
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.pillPts, isSelected && styles.pillPtsSelected]}>
                {opt.pts}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  pillsContainer: {
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
    paddingVertical: 10,
    borderRadius: 12,
  },
  pillSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  pillTextSelected: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  pillPts: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  pillPtsSelected: {
    color: '#7C3AED',
  },
});

export default SegmentedControl;
