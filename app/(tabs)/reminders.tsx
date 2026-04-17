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
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

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

function getGroupMeta(group: TimeGroup, t: (k: string) => string) {
  switch (group) {
    case "morning":
      return { label: t("home.greetingMorning"), icon: "sunny-outline", range: "5 AM – 12 PM" };
    case "afternoon":
      return { label: t("home.greetingAfternoon"), icon: "partly-sunny-outline", range: "12 PM – 5 PM" };
    case "evening":
      return { label: t("home.greetingEvening"), icon: "moon-outline", range: "5 PM – 9 PM" };
    case "night":
      return { label: t("reminders.later"), icon: "cloudy-night-outline", range: "9 PM – 5 AM" };
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
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();
  const repeatLabel =
    reminder.repeat_type === "daily"
      ? t("reminderAdd.repeatDaily")
      : reminder.repeat_type === "interval"
        ? `${t("reminderAdd.repeat")} ${reminder.interval_hours}h`
        : "";

  return (
    <NeoCard style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.violet, lineHeight: 38 }}>
            {formatTime(reminder.reminder_time)}
          </Text>
          <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginTop: 4 }}>
            {reminder.medicine_name}
          </Text>
          <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 4 }}>
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
        <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
          {DAY_LABELS.map((label, index) => {
            const isActive = reminder.days_of_week?.includes(index);
            return (
              <View
                key={index}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? c.navy : (isDark ? Colors.dark.surface : "#F0F2F5"),
                }}
              >
                <Text
                  style={{
                    fontSize: Typography.sm,
                    fontWeight: "700",
                    color: isActive ? "#FFFFFF" : c.textMuted,
                  }}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ fontSize: Typography.sm, color: c.textMuted, marginTop: 12 }}>
          {repeatLabel}
        </Text>
      )}

      <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
        <Pressable
          onPress={() => onEdit(reminder)}
          accessibilityLabel="Edit reminder"
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: 48,
            paddingHorizontal: 16,
            borderRadius: R.md,
            borderWidth: 0.5,
            borderColor: c.border,
            backgroundColor: isDark ? Colors.dark.surface : "#F7F8FA",
          }}
        >
          <Ionicons name="pencil-outline" size={20} color={c.textPrimary} />
          <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: c.textPrimary, marginLeft: 8 }}>
            {t("common.edit")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(reminder)}
          accessibilityLabel="Delete reminder"
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: 48,
            paddingHorizontal: 16,
            borderRadius: R.md,
            borderWidth: 0.5,
            borderColor: isDark ? "rgba(240,149,149,0.3)" : "rgba(226,75,74,0.2)",
            backgroundColor: isDark ? "rgba(240,149,149,0.08)" : "rgba(226,75,74,0.04)",
          }}
        >
          <Ionicons name="trash-outline" size={20} color={c.danger} />
          <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: c.danger, marginLeft: 8 }}>
            {t("common.delete")}
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
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();
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
      setError(t("common.error"));
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
        label: getGroupMeta(g, t).label,
        icon: getGroupMeta(g, t).icon,
        reminders: groups[g].sort((a, b) =>
          a.reminder_time.localeCompare(b.reminder_time)
        ),
      }));
  }, [reminders, t]);

  const flatData = useMemo(() => {
    const items: Array<
      | { type: "header"; key: string; label: string; icon: string; range: string; count: number }
      | { type: "reminder"; key: string; reminder: Reminder }
    > = [];
    for (const section of groupedSections) {
      const meta = getGroupMeta(section.key, t);
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
  }, [groupedSections, t]);

  if (loading && reminders.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.navy} />
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 16 }}>
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: S.xl, paddingTop: 32, paddingBottom: 16 }}>
          <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
            {t("reminders.title")}
          </Text>
          <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 4 }}>
            {reminders.length > 0
              ? `${reminders.length} · ${t("reminders.all")}`
              : t("reminders.emptyTitle")}
          </Text>
        </View>

        {error && (
          <View
            style={{
              marginHorizontal: S.xl,
              marginBottom: 16,
              padding: S.base,
              borderRadius: R.lg,
              backgroundColor: isDark ? "rgba(240,149,149,0.08)" : "rgba(226,75,74,0.04)",
              borderWidth: 0.5,
              borderColor: isDark ? "rgba(240,149,149,0.3)" : "rgba(226,75,74,0.2)",
            }}
          >
            <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500" }}>{error}</Text>
          </View>
        )}

        {reminders.length === 0 && !loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 64, marginBottom: 24 }}>💊</Text>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, textAlign: "center", marginBottom: 12 }}>
              {t("reminders.emptyTitle")}
            </Text>
            <Text
              style={{
                fontSize: Typography.base,
                color: c.textSecondary,
                textAlign: "center",
                lineHeight: 26,
                marginBottom: 32,
              }}
            >
              {t("reminders.emptyBody")}
            </Text>
            <Pressable
              onPress={() => router.push("/reminder/add")}
              style={{
                minHeight: 56,
                paddingHorizontal: 32,
                borderRadius: R.md,
                backgroundColor: c.navy,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.textOnNavy }}>
                {t("reminders.firstReminder")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={c.textSecondary}
                    />
                    <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginLeft: 8, flex: 1 }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: Typography.sm, color: c.textMuted }}>
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

        {/* FAB */}
        <Pressable
          onPress={() => router.push("/reminder/add")}
          accessibilityLabel="Add new reminder"
          accessibilityRole="button"
          style={({ pressed }) => ({
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: R.lg,
            backgroundColor: c.navy,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          })}
        >
          <Ionicons name="add" size={32} color={c.textOnNavy} />
        </Pressable>
      </View>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t("reminders.deleteTitle")}
        message={t("reminders.deleteBody", { name: deleteTarget?.medicine_name })}
        confirmText={t("common.delete")}
        cancelText={t("common.keep")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </SafeAreaView>
  );
}
