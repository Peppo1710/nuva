import { create } from "zustand";
import api from "@/lib/api";
import {
  registerForPushNotifications,
  scheduleReminder,
  cancelReminder,
  cancelAllReminders,
  setupNotificationCategories,
} from "@/lib/notifications";

export interface Reminder {
  id: string;
  user_id: string;
  medication_id: string | null;
  medicine_name: string;
  dose_amount: number;
  dose_unit: string;
  reminder_time: string;
  repeat_type: "daily" | "specific_days" | "interval";
  days_of_week: number[];
  interval_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  expo_notification_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  reminder_id: string;
  user_id: string;
  scheduled_date: string;
  status: "pending" | "taken" | "skipped";
  taken_at: string | null;
}

export interface TodayReminder extends Reminder {
  log: ReminderLog | null;
}

interface ReminderState {
  reminders: Reminder[];
  todayReminders: TodayReminder[];
  streak: number;
  loading: boolean;
  todayLoading: boolean;
  saving: boolean;
  notificationsEnabled: boolean;

  fetchReminders: () => Promise<void>;
  fetchTodayReminders: () => Promise<void>;
  fetchStreak: () => Promise<void>;
  createReminder: (data: CreateReminderData) => Promise<{ error: string | null; reminder?: Reminder }>;
  updateReminder: (id: string, data: Partial<CreateReminderData>) => Promise<{ error: string | null }>;
  deleteReminder: (id: string) => Promise<{ error: string | null }>;
  toggleReminder: (id: string, active: boolean) => Promise<{ error: string | null }>;
  markTaken: (id: string, status: "taken" | "skipped") => Promise<{ error: string | null }>;
  initNotifications: () => Promise<void>;
  rescheduleAll: () => Promise<void>;
  reset: () => void;
}

export interface CreateReminderData {
  medicine_name: string;
  dose_amount: number;
  dose_unit: string;
  reminder_time: string;
  repeat_type: "daily" | "specific_days" | "interval";
  days_of_week?: number[];
  interval_hours?: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  medication_id?: string;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  todayReminders: [],
  streak: 0,
  loading: false,
  todayLoading: false,
  saving: false,
  notificationsEnabled: false,

  initNotifications: async () => {
    const granted = await registerForPushNotifications();
    set({ notificationsEnabled: granted });
    if (granted) {
      await setupNotificationCategories();
    }
  },

  fetchReminders: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/reminders");
      set({ reminders: data.reminders || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTodayReminders: async () => {
    set({ todayLoading: true });
    try {
      const { data } = await api.get("/reminders/today");
      set({ todayReminders: data.reminders || [], todayLoading: false });
    } catch {
      set({ todayLoading: false });
    }
  },

  fetchStreak: async () => {
    try {
      const { data } = await api.get("/reminders/streak");
      set({ streak: data.streak || 0 });
    } catch {
      // Streak is non-critical
    }
  },

  createReminder: async (data) => {
    set({ saving: true });
    try {
      if (!get().notificationsEnabled) {
        await get().initNotifications();
      }

      const { data: responseData } = await api.post("/reminders", data);
      const reminder = responseData.reminder;

      const [hourStr, minuteStr] = data.reminder_time.split(":");
      const notifIds = await scheduleReminder({
        medicineName: data.medicine_name,
        doseAmount: data.dose_amount,
        doseUnit: data.dose_unit,
        hour: parseInt(hourStr, 10),
        minute: parseInt(minuteStr, 10),
        notes: data.notes,
        repeatType: data.repeat_type,
        daysOfWeek: data.days_of_week,
        intervalHours: data.interval_hours,
      });

      const notifIdStr = notifIds.join(",");
      if (notifIdStr) {
        await api.put(`/reminders/${reminder.id}`, {
          expo_notification_id: notifIdStr,
        });
        reminder.expo_notification_id = notifIdStr;
      }

      set((state) => ({
        reminders: [reminder, ...state.reminders],
        saving: false,
      }));
      return { error: null, reminder };
    } catch {
      set({ saving: false });
      return { error: "Could not create reminder. Please try again." };
    }
  },

  updateReminder: async (id, data) => {
    set({ saving: true });
    try {
      const existing = get().reminders.find((r) => r.id === id);
      if (existing?.expo_notification_id) {
        await cancelReminder(existing.expo_notification_id);
      }

      const { data: responseData } = await api.put(`/reminders/${id}`, data);
      const reminder = responseData.reminder;

      if (reminder.is_active) {
        const time = data.reminder_time || reminder.reminder_time;
        const [hourStr, minuteStr] = time.split(":");
        const notifIds = await scheduleReminder({
          medicineName: data.medicine_name || reminder.medicine_name,
          doseAmount: data.dose_amount || reminder.dose_amount,
          doseUnit: data.dose_unit || reminder.dose_unit,
          hour: parseInt(hourStr, 10),
          minute: parseInt(minuteStr, 10),
          notes: data.notes || reminder.notes || undefined,
          repeatType: (data.repeat_type || reminder.repeat_type) as "daily" | "specific_days" | "interval",
          daysOfWeek: data.days_of_week || reminder.days_of_week,
          intervalHours: data.interval_hours || reminder.interval_hours || undefined,
        });

        const notifIdStr = notifIds.join(",");
        await api.put(`/reminders/${id}`, {
          expo_notification_id: notifIdStr,
        });
        reminder.expo_notification_id = notifIdStr;
      }

      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
        saving: false,
      }));
      return { error: null };
    } catch {
      set({ saving: false });
      return { error: "Could not update reminder. Please try again." };
    }
  },

  deleteReminder: async (id) => {
    try {
      const existing = get().reminders.find((r) => r.id === id);
      if (existing?.expo_notification_id) {
        await cancelReminder(existing.expo_notification_id);
      }

      await api.delete(`/reminders/${id}`);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        todayReminders: state.todayReminders.filter((r) => r.id !== id),
      }));
      return { error: null };
    } catch {
      return { error: "Could not delete reminder. Please try again." };
    }
  },

  toggleReminder: async (id, active) => {
    try {
      const existing = get().reminders.find((r) => r.id === id);

      if (!active && existing?.expo_notification_id) {
        await cancelReminder(existing.expo_notification_id);
      }

      const { data } = await api.post(`/reminders/${id}/toggle`, { active });
      const reminder = data.reminder;

      if (active && existing) {
        const [hourStr, minuteStr] = existing.reminder_time.split(":");
        const notifIds = await scheduleReminder({
          medicineName: existing.medicine_name,
          doseAmount: existing.dose_amount,
          doseUnit: existing.dose_unit,
          hour: parseInt(hourStr, 10),
          minute: parseInt(minuteStr, 10),
          notes: existing.notes || undefined,
          repeatType: existing.repeat_type,
          daysOfWeek: existing.days_of_week,
          intervalHours: existing.interval_hours || undefined,
        });

        const notifIdStr = notifIds.join(",");
        await api.put(`/reminders/${id}`, {
          expo_notification_id: notifIdStr,
        });
        reminder.expo_notification_id = notifIdStr;
      }

      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
      }));
      return { error: null };
    } catch {
      return { error: "Could not toggle reminder. Please try again." };
    }
  },

  markTaken: async (id, status) => {
    try {
      const { data } = await api.post(`/reminders/${id}/taken`, { status });
      set((state) => ({
        todayReminders: state.todayReminders.map((r) =>
          r.id === id ? { ...r, log: data.log } : r
        ),
      }));

      get().fetchStreak();
      return { error: null };
    } catch {
      return { error: "Could not update status. Please try again." };
    }
  },

  rescheduleAll: async () => {
    try {
      await cancelAllReminders();
      const { reminders } = get();
      for (const r of reminders) {
        if (!r.is_active) continue;
        const [hourStr, minuteStr] = r.reminder_time.split(":");
        const notifIds = await scheduleReminder({
          medicineName: r.medicine_name,
          doseAmount: r.dose_amount,
          doseUnit: r.dose_unit,
          hour: parseInt(hourStr, 10),
          minute: parseInt(minuteStr, 10),
          notes: r.notes || undefined,
          repeatType: r.repeat_type,
          daysOfWeek: r.days_of_week,
          intervalHours: r.interval_hours || undefined,
        });

        const notifIdStr = notifIds.join(",");
        await api.put(`/reminders/${r.id}`, {
          expo_notification_id: notifIdStr,
        });
      }
    } catch {
      // Rescheduling is best-effort
    }
  },

  reset: () => {
    set({
      reminders: [],
      todayReminders: [],
      streak: 0,
      loading: false,
      todayLoading: false,
      saving: false,
    });
  },
}));
