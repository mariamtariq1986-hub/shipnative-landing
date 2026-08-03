/**
 * Local reminder stubs — no server required.
 * Call requestReminderPermission() from Settings; scheduleLocalReminder()
 * can fire a one-off local notification (Expo Go / dev builds).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotifyPref, setNotifyPref } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    await setNotifyPref(false);
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  const ok = status === 'granted';
  await setNotifyPref(ok);
  if (ok && Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reply reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return ok;
}

export async function scheduleLocalReminder(minutesFromNow = 60): Promise<string | null> {
  const enabled = await getNotifyPref();
  if (!enabled) return null;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Replyly',
      body: 'Any customer messages still waiting for a reply?',
      data: { type: 'reply_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(60, minutesFromNow * 60),
      channelId: 'reminders',
    },
  });
  return id;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
