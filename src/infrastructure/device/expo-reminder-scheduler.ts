import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { computeWindow } from '@/domain/flash-window';
import type { NotificationContent, ReminderScheduler } from '@/domain/ports';

const CHANNEL = 'flash';
const FLASH_PREFIX = 'flash-';
/** Prefijo de los recordatorios de eventos (ver event-reminders-store). */
const EVENT_PREFIX = 'event-';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/**
 * Avisos locales con expo-notifications: funcionan aunque no haya servidor.
 * Cada aviso lleva un identificador, así los del flash y los de eventos no se pisan.
 */
export class ExpoReminderScheduler implements ReminderScheduler {
  async hasPermission(): Promise<boolean> {
    return (await Notifications.getPermissionsAsync()).granted;
  }

  async requestPermission(): Promise<boolean> {
    await this.ensureChannel();
    if (await this.hasPermission()) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  }

  async scheduleDailyFlash(content: NotificationContent, days = 7): Promise<void> {
    await this.cancelDailyFlash();
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const { id, start } = computeWindow(date);
      if (start <= now + 5000) continue;
      await this.scheduleAt(FLASH_PREFIX + id, start, content);
    }
  }

  async cancelDailyFlash(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        // Todo lo que no sea recordatorio de evento: incluye los avisos de versiones anteriores (sin prefijo).
        .filter((n) => !n.identifier.startsWith(EVENT_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  }

  async remindIn(seconds: number, content: NotificationContent): Promise<void> {
    await this.ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: `${FLASH_PREFIX}test`,
      content: { ...content, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
    });
  }

  async scheduleAt(id: string, at: number, content: NotificationContent): Promise<void> {
    await this.ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { ...content, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  }

  async cancel(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /** Android exige un canal antes de mostrar avisos; crearlo varias veces no tiene efecto. */
  private async ensureChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Flashly',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#FFC53D',
    });
  }
}
