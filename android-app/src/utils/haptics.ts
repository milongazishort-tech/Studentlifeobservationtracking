import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerLightImpact = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore on unsupported devices
  }
};

export const triggerMediumImpact = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // ignore
  }
};

export const triggerSuccessFeedback = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
};

export const triggerErrorFeedback = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // ignore
  }
};

export const HapticsUtil = {
  lightImpact: triggerLightImpact,
  mediumImpact: triggerMediumImpact,
  success: triggerSuccessFeedback,
  error: triggerErrorFeedback,
};

export default HapticsUtil;
