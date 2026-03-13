import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("Notifications require a physical device");
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medication", {
      name: "Medication Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }

  return true;
}

export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync("MEDICATION", [
    {
      identifier: "TAKEN",
      buttonTitle: "Mark as Taken ✓",
      options: { opensAppToForeground: true },
    },
    {
      identifier: "SNOOZE",
      buttonTitle: "Snooze 10 min",
      options: { opensAppToForeground: false },
    },
  ]);
}

export interface ScheduleReminderParams {
  medicineName: string;
  doseAmount: number;
  doseUnit: string;
  hour: number;
  minute: number;
  notes?: string;
  repeatType: "daily" | "specific_days" | "interval";
  daysOfWeek?: number[];
  intervalHours?: number;
}

export async function scheduleReminder(
  params: ScheduleReminderParams
): Promise<string[]> {
  const notificationIds: string[] = [];
  const body = `${params.medicineName} — ${params.doseAmount} ${params.doseUnit}${params.notes ? ` | ${params.notes}` : ""}`;

  const content: Notifications.NotificationContentInput = {
    title: "Time for your medicine! 💊",
    body,
    categoryIdentifier: "MEDICATION",
    sound: "default",
    ...(Platform.OS === "android" && { channelId: "medication" }),
  };

  if (params.repeatType === "daily") {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: params.hour,
        minute: params.minute,
      },
    });
    notificationIds.push(id);
  } else if (
    params.repeatType === "specific_days" &&
    params.daysOfWeek
  ) {
    for (const weekday of params.daysOfWeek) {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday === 0 ? 1 : weekday + 1,
          hour: params.hour,
          minute: params.minute,
        },
      });
      notificationIds.push(id);
    }
  } else if (params.repeatType === "interval" && params.intervalHours) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: params.intervalHours * 3600,
        repeats: true,
      },
    });
    notificationIds.push(id);
  }

  return notificationIds;
}

export async function cancelReminder(
  notificationId: string
): Promise<void> {
  const ids = notificationId.split(",");
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id.trim());
    } catch {
      // Notification may have already fired or been cancelled
    }
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllReminders(
  reminders: Array<{
    medicine_name: string;
    dose_amount: number;
    dose_unit: string;
    reminder_time: string;
    repeat_type: "daily" | "specific_days" | "interval";
    days_of_week?: number[];
    interval_hours?: number;
    notes?: string;
    is_active: boolean;
  }>
): Promise<Map<string, string>> {
  await cancelAllReminders();
  const idMap = new Map<string, string>();

  for (const r of reminders) {
    if (!r.is_active) continue;

    const [hourStr, minuteStr] = r.reminder_time.split(":");
    const ids = await scheduleReminder({
      medicineName: r.medicine_name,
      doseAmount: r.dose_amount,
      doseUnit: r.dose_unit,
      hour: parseInt(hourStr, 10),
      minute: parseInt(minuteStr, 10),
      notes: r.notes || undefined,
      repeatType: r.repeat_type as "daily" | "specific_days" | "interval",
      daysOfWeek: r.days_of_week,
      intervalHours: r.interval_hours || undefined,
    });

    idMap.set(r.medicine_name, ids.join(","));
  }

  return idMap;
}
