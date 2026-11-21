import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { HapticsUtil } from '@/utils/haptics';

interface SkillMinutesInputProps {
  minutes: number;
  onChange: (mins: number) => void;
}

export const SkillMinutesInput: React.FC<SkillMinutesInputProps> = ({ minutes, onChange }) => {
  // Score rule: >= 60 mins -> 10 pts; 30-59 mins -> 6 pts; 15-29 mins -> 3 pts; < 15 mins -> 0 pts
  const points = minutes >= 60 ? 10 : minutes >= 30 ? 6 : minutes >= 15 ? 3 : 0;

  const tiers = [
    { label: '< 15m', mins: 0, pts: '0 pts' },
    { label: '15-29m', mins: 15, pts: '3 pts' },
    { label: '30-59m', mins: 30, pts: '6 pts' },
    { label: '≥ 60m', mins: 60, pts: '10 pts' },
  ];

  const handleSelect = (m: number) => {
    HapticsUtil.lightImpact();
    onChange(m);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Briefcase size={18} color="#D97706" />
          <Text style={styles.title}>Skill Development / Earning</Text>
        </View>
        <View style={[styles.pointsBadge, points > 0 && styles.pointsBadgeActive]}>
          <Text style={[styles.pointsText, points > 0 && styles.pointsTextActive]}>
            {points} / 10 pts
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Programming, design, freelancing, or personal skill practice</Text>

      <View style={styles.tiersGrid}>
        {tiers.map((tier) => {
          const isSelected =
            (tier.mins === 60 && minutes >= 60) ||
            (tier.mins === 30 && minutes >= 30 && minutes < 60) ||
            (tier.mins === 15 && minutes >= 15 && minutes < 30) ||
            (tier.mins === 0 && minutes < 15);

          return (
            <TouchableOpacity
              key={tier.label}
              onPress={() => handleSelect(tier.mins)}
              style={[styles.tierCard, isSelected && styles.tierCardSelected]}>
              <Text style={[styles.tierLabel, isSelected && styles.tierLabelSelected]}>
                {tier.label}
              </Text>
              <Text style={[styles.tierPts, isSelected && styles.tierPtsSelected]}>
                {tier.pts}
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
  tiersGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  tierCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tierCardSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  tierLabelSelected: {
    color: '#B45309',
  },
  tierPts: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  tierPtsSelected: {
    color: '#D97706',
  },
});

export default SkillMinutesInput;
