import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoToggle } from "@/components/ui/NeoToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useReminderStore, Reminder } from "@/store/reminderStore";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type TimeGroup = "morning" | "afternoon" | "evening" | "night";

interface GroupedSection {
  key: TimeGroup;
  label: string;
  icon: string;
  reminders: Reminder[];
}

function getTimeGroup(timeStr: string): TimeGroup {
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getGroupMeta(group: TimeGroup) {
  switch (group) {
    case "morning":
      return { label: "Morning", icon: "sunny-outline", range: "5 AM – 12 PM" };
    case "afternoon":
      return { label: "Afternoon", icon: "partly-sunny-outline", range: "12 PM – 5 PM" };
    case "evening":
      return { label: "Evening", icon: "moon-outline", range: "5 PM – 9 PM" };
    case "night":
      return { label: "Night", icon: "cloudy-night-outline", range: "9 PM – 5 AM" };
  }
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDose(amount: number, unit: string): string {
  const qty = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1);
  return `${qty} ${unit}${amount !== 1 ? "s" : ""}`;
}

const ReminderCard = React.memo(function ReminderCard({
  reminder,
  onToggle,
  onEdit,
  onDelete,
  isDark,
}: {
  reminder: Reminder;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
  isDark: boolean;
}) {
  const repeatLabel =
    reminder.repeat_type === "daily"
      ? "Every day"
      : reminder.repeat_type === "interval"
        ? `Every ${reminder.interval_hours}h`
        : "";

  return (
    <NeoCard className="mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-[32px] font-bold text-navy dark:text-navy-dark leading-[38px]">
            {formatTime(reminder.reminder_time)}
          </Text>
          <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mt-1">
            {reminder.medicine_name}
          </Text>
          <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-1">
            {formatDose(reminder.dose_amount, reminder.dose_unit)}
            {reminder.notes ? ` · ${reminder.notes}` : ""}
          </Text>
        </View>
        <NeoToggle
          value={reminder.is_active}
          onValueChange={(val) => onToggle(reminder.id, val)}
        />
      </View>

      {reminder.repeat_type === "specific_days" ? (
        <View className="flex-row mt-4 gap-2">
          {DAY_LABELS.map((label, index) => {
            const isActive = reminder.days_of_week?.includes(index);
            return (
              <View
                key={index}
                className={`w-[38px] h-[38px] rounded-full items-center justify-center ${
                  isActive
                    ? "bg-primary"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-[14px] font-bold ${
                    isActive ? "text-white" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="text-[16px] text-gray-400 dark:text-gray-500 mt-3">
          {repeatLabel}
        </Text>
      )}

      <View className="flex-row mt-4 gap-3">
        <Pressable
          onPress={() => onEdit(reminder)}
          accessibilityLabel="Edit reminder"
          accessibilityRole="button"
          className="flex-row items-center min-h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-[1px] border-gray-200 dark:border-gray-700"
        >
          <Ionicons
            name="pencil-outline"
            size={20}
            color={isDark ? "#E5E7EB" : "#374151"}
          />
          <Text className="text-[16px] font-semibold text-navy dark:text-navy-dark ml-2">
            Edit
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(reminder)}
          accessibilityLabel="Delete reminder"
          accessibilityRole="button"
          className="flex-row items-center min-h-[48px] px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-[1px] border-red-200 dark:border-red-800"
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#EF4444"
          />
          <Text className="text-[16px] font-semibold text-error ml-2">
            Delete
          </Text>
        </Pressable>
      </View>
    </NeoCard>
  );
});

export default function RemindersScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    reminders,
    loading,
    fetchReminders,
    toggleReminder,
    deleteReminder,
    initNotifications,
  } = useReminderStore();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initNotifications();
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      await fetchReminders();
    } catch {
      setError("Could not load reminders. Please check your internet.");
    }
  }, [fetchReminders]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggle = useCallback(
    async (id: string, active: boolean) => {
      const result = await toggleReminder(id, active);
      if (result.error) setError(result.error);
    },
    [toggleReminder]
  );

  const handleEdit = useCallback(
    (reminder: Reminder) => {
      router.push({
        pathname: "/reminder/add",
        params: { id: reminder.id },
      });
    },
    [router]
  );

  const handleDelete = useCallback(
    async (reminder: Reminder) => {
      setDeleteTarget(reminder);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteReminder(deleteTarget.id);
    if (result.error) setError(result.error);
    setDeleteTarget(null);
  }, [deleteTarget, deleteReminder]);

  const groupedSections: GroupedSection[] = useMemo(() => {
    const groups: Record<TimeGroup, Reminder[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    for (const r of reminders) {
      groups[getTimeGroup(r.reminder_time)].push(r);
    }

    const order: TimeGroup[] = ["morning", "afternoon", "evening", "night"];
    return order
      .filter((g) => groups[g].length > 0)
      .map((g) => ({
        key: g,
        label: getGroupMeta(g).label,
        icon: getGroupMeta(g).icon,
        reminders: groups[g].sort((a, b) =>
          a.reminder_time.localeCompare(b.reminder_time)
        ),
      }));
  }, [reminders]);

  const flatData = useMemo(() => {
    const items: Array<
      | { type: "header"; key: string; label: string; icon: string; range: string; count: number }
      | { type: "reminder"; key: string; reminder: Reminder }
    > = [];
    for (const section of groupedSections) {
      const meta = getGroupMeta(section.key);
      items.push({
        type: "header",
        key: `header-${section.key}`,
        label: meta.label,
        icon: meta.icon,
        range: meta.range,
        count: section.reminders.length,
      });
      for (const r of section.reminders) {
        items.push({ type: "reminder", key: r.id, reminder: r });
      }
    }
    return items;
  }, [groupedSections]);

  if (loading && reminders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#0F766E" />
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-4">
          Loading your reminders...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-1">
        <View className="px-6 pt-8 pb-4">
          <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
            Reminders
          </Text>
          <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-1">
            {reminders.length > 0
              ? `${reminders.length} active reminder${reminders.length !== 1 ? "s" : ""}`
              : "No reminders yet"}
          </Text>
        </View>

        {error && (
          <View className="mx-6 mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-[1px] border-red-200 dark:border-red-800">
            <Text className="text-[18px] text-error font-medium">{error}</Text>
          </View>
        )}

        {reminders.length === 0 && !loading ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-[64px] mb-6">💊</Text>
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark text-center mb-3">
              No Reminders Set
            </Text>
            <Text className="text-[18px] text-gray-500 dark:text-gray-400 text-center leading-[26px] mb-8">
              Tap the + button below to add your first medication reminder. 
              You'll get notifications so you never miss a dose.
            </Text>
            <Pressable
              onPress={() => router.push("/reminder/add")}
              className="min-h-[56px] px-8 rounded-xl bg-primary items-center justify-center"
            >
              <Text className="text-[18px] font-bold text-white">
                Add Your First Reminder
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View className="flex-row items-center mt-4 mb-3">
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={isDark ? "#A1A1AA" : "#6B7280"}
                    />
                    <Text className="text-[20px] font-bold text-navy dark:text-navy-dark ml-2 flex-1">
                      {item.label}
                    </Text>
                    <Text className="text-[16px] text-gray-400 dark:text-gray-500">
                      {item.range}
                    </Text>
                  </View>
                );
              }
              return (
                <ReminderCard
                  reminder={item.reminder}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDark={isDark}
                />
              );
            }}
          />
        )}

        {/* FAB - Add Reminder */}
        <Pressable
          onPress={() => router.push("/reminder/add")}
          accessibilityLabel="Add new reminder"
          accessibilityRole="button"
          className="absolute bottom-6 right-6 w-[64px] h-[64px] rounded-2xl bg-primary items-center justify-center shadow-lg"
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          })}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Reminder"
        message={`Are you sure you want to delete the reminder for "${deleteTarget?.medicine_name}"? This will also cancel its notifications.`}
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </SafeAreaView>
  );
}
