import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { HapticsUtil } from '@/utils/haptics';

interface ItemToggleProps {
  title: string;
  subtitle: string;
  points: number;
  value: boolean;
  onValueChange: (val: boolean) => void;
  icon?: React.ReactNode;
}

export const ItemToggle: React.FC<ItemToggleProps> = ({
  title,
  subtitle,
  points,
  value,
  onValueChange,
  icon,
}) => {
  const handleToggle = (val: boolean) => {
    HapticsUtil.lightImpact();
    onValueChange(val);
  };

  return (
    <View style={[styles.container, value && styles.containerActive]}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconBox}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.pointsBadge, value && styles.pointsBadgeActive]}>
            <Text style={[styles.pointsText, value && styles.pointsTextActive]}>
              {value ? `+${points} pts` : `0/${points} pts`}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
        thumbColor={value ? '#2563EB' : '#94A3B8'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  containerActive: {
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFF',
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  iconBox: {
    marginRight: 2,
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
    lineHeight: 18,
  },
});

export default ItemToggle;
