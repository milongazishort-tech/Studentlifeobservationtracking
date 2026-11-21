import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface ErrorBannerProps {
  message: string | null;
  code?: string | null;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, code }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <AlertCircle size={20} color="#DC2626" style={styles.icon} />
      <View style={styles.textContainer}>
        {code && <Text style={styles.codeText}>{code}</Text>}
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14,
    color: '#B91C1C',
    fontWeight: '500',
  },
});

export default ErrorBanner;
