import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { computeWindow } from '@/domain/flash-window';
import type { ReminderScheduler } from '@/domain/ports';

const CHANNEL = 'flash';
const CONTENT = { title: '¡Es ahora!', body: 'Tienes 2 minutos para mostrar qué estás haciendo.', sound: true };

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/** Avisos locales con expo-notifications: funcionan aunque no haya servidor. */
export class ExpoReminderScheduler implements ReminderScheduler {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Ventana del flash',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 200, 250],
        lightColor: '#FFC53D',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  }

  async scheduleUpcoming(days = 5): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const { start } = computeWindow(date);
      if (start <= now + 5000) continue;
      await Notifications.scheduleNotificationAsync({
        content: CONTENT,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: start, channelId: CHANNEL },
      });
    }
  }

  async remindIn(seconds: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: CONTENT,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
    });
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
