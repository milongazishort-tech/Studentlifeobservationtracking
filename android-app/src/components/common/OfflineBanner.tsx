import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, RotateCcw } from 'lucide-react-native';
import { setNetworkErrorHandler } from '@/services/api';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setNetworkErrorHandler((offline: boolean) => {
      setIsOffline(offline);
    });
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.text}>Network Connection Issue — Check connection</Text>
      <TouchableOpacity onPress={() => setIsOffline(false)} style={styles.dismissBtn}>
        <RotateCcw size={14} color="#FFFFFF" />
        <Text style={styles.dismissText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    zIndex: 9999,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OfflineBanner;
