import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface GraceAlertBannerProps {
  show: boolean;
}

export const GraceAlertBanner: React.FC<GraceAlertBannerProps> = ({ show }) => {
  const router = useRouter();

  if (!show) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/checklist/yesterday' as any)}
      style={styles.banner}>
      <View style={styles.iconBox}>
        <AlertTriangle size={20} color="#D97706" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Yesterday Needs Attention</Text>
        <Text style={styles.subtitle}>
          Fill yesterday's entry before 23:59 tonight to recover your streak!
        </Text>
      </View>
      <ArrowRight size={18} color="#D97706" style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  subtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default GraceAlertBanner;
