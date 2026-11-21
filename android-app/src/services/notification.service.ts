import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set default foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Request notification permissions and register Android channel
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Configure high-importance channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminder', {
          name: 'Daily Check-in Reminder',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
          sound: 'default',
        });
      }

      return true;
    } catch (err) {
      console.warn('[NotificationService] Permission error:', err);
      return false;
    }
  },

  /**
   * Schedule recurring daily notification at student's reminder time (e.g. "21:00")
   */
  async scheduleDailyReminder(timeStr: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('[NotificationService] Notification permission not granted');
        return null;
      }

      // Parse HH:mm
      const parts = timeStr.split(':');
      const hour = parseInt(parts[0], 10) || 21;
      const minute = parseInt(parts[1], 10) || 0;

      // Cancel previous scheduled reminders
      await this.cancelAllReminders();

      // Schedule repeating daily notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'StudentLife Check-in Reminder 🎯',
          body: "Don't break your streak! Record today's 12 life areas before midnight.",
          sound: 'default',
          data: { screen: '/(tabs)/checklist' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      return id;
    } catch (err) {
      console.warn('[NotificationService] Schedule error:', err);
      return null;
    }
  },

  /**
   * Cancel all pending scheduled local notifications
   */
  async cancelAllReminders(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('[NotificationService] Cancel error:', err);
    }
  },
};

export default NotificationService;
