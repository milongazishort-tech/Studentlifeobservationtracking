import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In Expo Go or development builds, hostUri has the dev computer IP:port (e.g. "192.168.0.199:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:5000/api/v1`;
    }
  }

  // Local Wi-Fi network IP fallback
  if (Platform.OS === 'android') {
    return 'http://192.168.0.199:5000/api/v1';
  }

  return 'http://localhost:5000/api/v1';
};

export const Config = {
  API_BASE_URL: getBaseUrl(),
  API_TIMEOUT_MS: 15000,
  APP_NAME: 'StudentLife Tracker',
  APP_VERSION: '1.0.0',
  CYCLE_DURATION_DAYS: 30,
  DEFAULT_TARGET_WAKE_UP: '06:30',
  DEFAULT_TARGET_SLEEP: '23:00',
  DEFAULT_REMINDER_TIME: '21:00',
} as const;

export default Config;
