import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface ReflectionInputProps {
  title: string;
  subtitle: string;
  placeholder: string;
  value: string;
  points: number;
  maxChars?: number;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  title,
  subtitle,
  placeholder,
  value,
  points,
  maxChars = 500,
  onChange,
  icon,
}) => {
  const isFilled = value.trim().length > 0;
  const earned = isFilled ? points : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.pointsBadge, earned > 0 && styles.pointsBadgeActive]}>
          <Text style={[styles.pointsText, earned > 0 && styles.pointsTextActive]}>
            {earned} / {points} pts
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          maxLength={maxChars}
          value={value}
          onChangeText={onChange}
          textAlignVertical="top"
        />
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {value.length} / {maxChars}
          </Text>
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
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  textInput: {
    minHeight: 70,
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  counterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});

export default ReflectionInput;
