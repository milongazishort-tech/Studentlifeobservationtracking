import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AreaBarChartProps {
  areaBreakdown: Record<string, number>; // 0.0 to 1.0
}

interface AreaItemMeta {
  key: string;
  name: string;
  tag: string;
}

const LIFE_AREAS: AreaItemMeta[] = [
  { key: 'item1', name: 'Early Morning', tag: 'Academic & Routine' },
  { key: 'item2', name: 'University Attendance', tag: 'Academic & Routine' },
  { key: 'item3', name: 'Class Participation', tag: 'Academic & Routine' },
  { key: 'item4', name: 'Personal Discipline', tag: 'Mind & Discipline' },
  { key: 'item5', name: 'Social Interaction', tag: 'Social & Wellbeing' },
  { key: 'item6', name: 'Daily Learning Note', tag: 'Skills & Growth' },
  { key: 'item7', name: 'Physical Activity', tag: 'Health & Wellness' },
  { key: 'item8', name: 'Skill Development', tag: 'Skills & Growth' },
  { key: 'item9', name: 'Class Work Recap', tag: 'Academic & Routine' },
  { key: 'item10', name: 'Social Media Control', tag: 'Mind & Discipline' },
  { key: 'item11', name: 'Self-Reflection Journal', tag: 'Social & Wellbeing' },
  { key: 'item12', name: 'Sleeping on Time', tag: 'Health & Wellness' },
];

export const AreaBarChart: React.FC<AreaBarChartProps> = ({ areaBreakdown }) => {
  // Find highest and lowest values for contextual coloring
  const values = Object.values(areaBreakdown || {});
  const maxVal = values.length > 0 ? Math.max(...values) : 1;
  const minVal = values.length > 0 ? Math.min(...values) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>12 Life Areas Performance</Text>
        <Text style={styles.subtext}>Average Weekly Completion</Text>
      </View>

      <View style={styles.list}>
        {LIFE_AREAS.map((area) => {
          const rate = areaBreakdown[area.key] ?? 0;
          const pct = Math.min(100, Math.max(0, Math.round(rate * 100)));
          const isHighest = pct === Math.round(maxVal * 100) && maxVal > 0;
          const isLowest = pct === Math.round(minVal * 100) && minVal < maxVal;

          let barColor = '#2563EB';
          if (isHighest) barColor = '#16A34A';
          if (isLowest) barColor = '#D97706';

          return (
            <View key={area.key} style={styles.itemRow}>
              <View style={styles.labelRow}>
                <View style={styles.nameContainer}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  {isHighest && <Text style={styles.highBadge}>Top Area 🌟</Text>}
                  {isLowest && <Text style={styles.lowBadge}>Focus Needed ⚠️</Text>}
                </View>
                <Text style={[styles.pctText, isHighest && styles.highPct, isLowest && styles.lowPct]}>
                  {pct}%
                </Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
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
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  list: {
    gap: 14,
  },
  itemRow: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  areaName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  highBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  lowBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  highPct: {
    color: '#16A34A',
  },
  lowPct: {
    color: '#D97706',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default AreaBarChart;
