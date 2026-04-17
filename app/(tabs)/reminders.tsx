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
import { LinearGradient } from "expo-linear-gradient";
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
      return { label: t("home.greetingMorning"), icon: "sunny-outline", range: "5 AM – 12 PM", color: "#FBBF24" as string };
    case "afternoon":
      return { label: t("home.greetingAfternoon"), icon: "partly-sunny-outline", range: "12 PM – 5 PM", color: "#F97316" as string };
    case "evening":
      return { label: t("home.greetingEvening"), icon: "moon-outline", range: "5 PM – 9 PM", color: "#A594F9" as string };
    case "night":
      return { label: t("reminders.later"), icon: "cloudy-night-outline", range: "9 PM – 5 AM", color: "#60A5FA" as string };
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
    <View
      style={{
        borderRadius: R.xl,
        borderWidth: 1,
        borderColor: isDark ? "#1E1E1E" : c.border,
        backgroundColor: isDark ? "#111111" : c.surface,
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      {reminder.is_active && (
        <LinearGradient
          colors={["#3DD6A3", "#A594F9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            bottom: 0,
          }}
        />
      )}
      <View style={{ padding: S.base + 4, paddingLeft: reminder.is_active ? S.base + 10 : S.base + 4 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: Typography.xxl,
                  fontWeight: "700",
                  color: isDark ? "#3DD6A3" : c.violet,
                  lineHeight: 38,
                  letterSpacing: -1,
                }}
              >
                {formatTime(reminder.reminder_time)}
              </Text>
            </View>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginTop: 2 }}>
              {reminder.medicine_name}
            </Text>
            <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 4 }}>
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
          <View style={{ flexDirection: "row", marginTop: 14, gap: 6 }}>
            {DAY_LABELS.map((label, index) => {
              const isActive = reminder.days_of_week?.includes(index);
              return (
                <View
                  key={index}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={["#3DD6A3", "#A594F9"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center" }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>
                        {label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: c.textMuted }}>
                        {label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: c.textMuted, letterSpacing: 0.3 }}>
                {repeatLabel || "—"}
              </Text>
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", marginTop: 14, gap: 10 }}>
          <Pressable
            onPress={() => onEdit(reminder)}
            accessibilityLabel="Edit reminder"
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              minHeight: 42,
              paddingHorizontal: 16,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: isDark ? "#222222" : c.border,
              backgroundColor: isDark ? "#0D0D0D" : "#F7F8FA",
            }}
          >
            <Ionicons name="pencil-outline" size={16} color={isDark ? "rgba(255,255,255,0.5)" : c.textSecondary} />
            <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: isDark ? "rgba(255,255,255,0.6)" : c.textPrimary, marginLeft: 6 }}>
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
              minHeight: 42,
              paddingHorizontal: 16,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: isDark ? "rgba(248,113,113,0.2)" : "rgba(226,75,74,0.15)",
              backgroundColor: isDark ? "rgba(248,113,113,0.06)" : "rgba(226,75,74,0.04)",
            }}
          >
            <Ionicons name="trash-outline" size={16} color={c.danger} />
            <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: c.danger, marginLeft: 6 }}>
              {t("common.delete")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
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

  const groupedSections = useMemo(() => {
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
      | { type: "header"; key: string; label: string; icon: string; range: string; count: number; color: string }
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
        color: meta.color,
      });
      for (const r of section.reminders) {
        items.push({ type: "reminder", key: r.id, reminder: r });
      }
    }
    return items;
  }, [groupedSections, t]);

  if (loading && reminders.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#3DD6A3" : c.navy} />
        <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 16, fontWeight: "500" }}>
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: S.xl, paddingTop: 28, paddingBottom: 16 }}>
          <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, letterSpacing: -0.5 }}>
            {t("reminders.title")}
          </Text>
          <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.35)" : c.textMuted, marginTop: 4, fontWeight: "500" }}>
            {reminders.length > 0
              ? `${reminders.length} ${t("reminders.all")}`
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
              backgroundColor: isDark ? "rgba(248,113,113,0.06)" : "rgba(226,75,74,0.04)",
              borderWidth: 1,
              borderColor: isDark ? "rgba(248,113,113,0.2)" : "rgba(226,75,74,0.15)",
            }}
          >
            <Text style={{ fontSize: Typography.sm, color: c.danger, fontWeight: "500" }}>{error}</Text>
          </View>
        )}

        {reminders.length === 0 && !loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 28,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <LinearGradient
                colors={isDark ? ["#1A1A1A", "#111111"] : ["#F0F2F5", "#E8ECF2"]}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 48 }}>💊</Text>
              </LinearGradient>
            </View>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, textAlign: "center", marginBottom: 10 }}>
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
              style={{ borderRadius: R.lg, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#3DD6A3", "#A594F9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  minHeight: 52,
                  paddingHorizontal: 32,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: Typography.base, fontWeight: "700", color: "#FFFFFF" }}>
                  {t("reminders.firstReminder")}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: 110 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? "#3DD6A3" : c.navy}
              />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={item.color}
                      />
                    </View>
                    <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary, flex: 1 }}>
                      {item.label}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                      }}
                    >
                      <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: "600" }}>
                        {item.range}
                      </Text>
                    </View>
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
            width: 60,
            height: 60,
            borderRadius: 18,
            overflow: "hidden",
            opacity: pressed ? 0.85 : 1,
            shadowColor: "#3DD6A3",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 10,
          })}
        >
          <LinearGradient
            colors={["#3DD6A3", "#A594F9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
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
