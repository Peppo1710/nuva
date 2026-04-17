import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useReminderStore, TodayReminder } from "@/store/reminderStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

function getGreetingKey(): "home.greetingMorning" | "home.greetingAfternoon" | "home.greetingEvening" {
  const hour = new Date().getHours();
  if (hour < 12) return "home.greetingMorning";
  if (hour < 17) return "home.greetingAfternoon";
  return "home.greetingEvening";
}

function getFormattedDate(locale: string): string {
  const localeMap: Record<string, string> = { en: "en-US", hi: "hi-IN", mr: "mr-IN" };
  return new Date().toLocaleDateString(localeMap[locale] || "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

function ThemeToggle({ isDark }: { isDark: boolean }) {
  const { setTheme } = useProfileStore();
  const thumbAnim = useRef(new Animated.Value(isDark ? 22 : 0)).current;

  useEffect(() => {
    Animated.spring(thumbAnim, {
      toValue: isDark ? 22 : 0,
      stiffness: 200,
      damping: 20,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const handleToggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <Pressable
      onPress={handleToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 28,
        width: 52,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(61,214,163,0.15)" : "rgba(255,255,255,0.2)",
        paddingHorizontal: 3,
        borderWidth: 1,
        borderColor: isDark ? "rgba(61,214,163,0.3)" : "rgba(255,255,255,0.3)",
      }}
      hitSlop={8}
    >
      <Text style={{ fontSize: 10, position: "absolute", left: 6 }}>☀</Text>
      <Text style={{ fontSize: 10, position: "absolute", right: 5 }}>☾</Text>
      <Animated.View
        style={{
          position: "absolute",
          left: 3,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: isDark ? "#3DD6A3" : "#FFFFFF",
          transform: [{ translateX: thumbAnim }],
          shadowColor: isDark ? "#3DD6A3" : "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
      />
    </Pressable>
  );
}

const MedicationItem = React.memo(function MedicationItem({
  reminder,
  onTaken,
  onSkip,
  isDark,
}: {
  reminder: TodayReminder;
  onTaken: (id: string) => void;
  onSkip: (id: string) => void;
  isDark: boolean;
}) {
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();
  const isTaken = reminder.log?.status === "taken";
  const isSkipped = reminder.log?.status === "skipped";
  const hasAction = isTaken || isSkipped;

  return (
    <View
      style={{
        borderRadius: R.xl,
        borderWidth: 1,
        borderColor: isTaken
          ? isDark ? "rgba(61,214,163,0.3)" : "rgba(29,158,117,0.2)"
          : isSkipped
            ? isDark ? "#222" : "rgba(160,170,186,0.2)"
            : isDark ? "#1E1E1E" : c.border,
        backgroundColor: isTaken
          ? isDark ? "rgba(61,214,163,0.06)" : "rgba(29,158,117,0.04)"
          : isSkipped
            ? isDark ? "rgba(255,255,255,0.02)" : "rgba(160,170,186,0.06)"
            : isDark ? "#111111" : c.surface,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {isTaken && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            bottom: 0,
            backgroundColor: "#3DD6A3",
            borderTopLeftRadius: R.xl,
            borderBottomLeftRadius: R.xl,
          }}
        />
      )}
      <View style={{ padding: S.base, paddingLeft: isTaken ? S.base + 6 : S.base }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isTaken
                ? isDark ? "rgba(61,214,163,0.15)" : "rgba(29,158,117,0.1)"
                : isSkipped
                  ? isDark ? "#1A1A1A" : "#F0F2F5"
                  : isDark ? "#1A1A1A" : "#F0F2F5",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {isTaken ? (
              <Ionicons name="checkmark-circle" size={22} color="#3DD6A3" />
            ) : isSkipped ? (
              <Ionicons name="remove-circle-outline" size={22} color={c.textMuted} />
            ) : (
              <Text style={{ fontSize: 20 }}>💊</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: Typography.base,
                fontWeight: "700",
                color: isTaken
                  ? isDark ? "#3DD6A3" : c.teal
                  : isSkipped
                    ? c.textMuted
                    : c.textPrimary,
                textDecorationLine: hasAction ? "line-through" : "none",
              }}
            >
              {reminder.medicine_name}
            </Text>
            <Text
              style={{
                fontSize: Typography.sm,
                marginTop: 2,
                color: hasAction ? c.textMuted : c.textSecondary,
              }}
            >
              {formatTime(reminder.reminder_time)} · {formatDose(reminder.dose_amount, reminder.dose_unit)}
            </Text>
          </View>
          {isTaken && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: isDark ? "rgba(61,214,163,0.12)" : "rgba(29,158,117,0.08)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: isDark ? "#3DD6A3" : c.teal }}>
                TAKEN
              </Text>
            </View>
          )}
          {isSkipped && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(160,170,186,0.1)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: c.textMuted }}>
                SKIPPED
              </Text>
            </View>
          )}
        </View>

        {!hasAction && (
          <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>
            <Pressable
              onPress={() => onTaken(reminder.id)}
              accessibilityLabel={`Mark ${reminder.medicine_name} as taken`}
              accessibilityRole="button"
              style={{ flex: 1, overflow: "hidden", borderRadius: R.md }}
            >
              <LinearGradient
                colors={["#3DD6A3", "#2BC48A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: R.md,
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: "#FFFFFF", marginLeft: 6 }}>
                  {t("home.taken")}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => onSkip(reminder.id)}
              accessibilityLabel={`Skip ${reminder.medicine_name}`}
              accessibilityRole="button"
              style={{
                flex: 1,
                flexDirection: "row",
                minHeight: 44,
                borderRadius: R.md,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isDark ? "#2A2A2A" : c.border,
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color={c.textSecondary} />
              <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.textSecondary, marginLeft: 6 }}>
                {t("home.skip")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();
  const insets = useSafeAreaInsets();
  const { signOut, loading: authLoading } = useAuthStore();
  const { username, fetchProfile, loading: profileLoading } = useProfileStore();
  const language = useProfileStore((s) => s.language);
  const {
    todayReminders,
    streak,
    todayLoading,
    fetchTodayReminders,
    fetchStreak,
    markTaken,
    initNotifications,
  } = useReminderStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([
        fetchProfile(),
        fetchTodayReminders(),
        fetchStreak(),
        initNotifications(),
      ]);
    } catch {
      setError(t("common.error"));
    }
  }, [fetchProfile, fetchTodayReminders, fetchStreak, initNotifications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const handleTaken = useCallback(
    async (id: string) => {
      const result = await markTaken(id, "taken");
      if (result.error) setError(result.error);
    },
    [markTaken]
  );

  const handleSkip = useCallback(
    async (id: string) => {
      const result = await markTaken(id, "skipped");
      if (result.error) setError(result.error);
    },
    [markTaken]
  );

  const takenCount = todayReminders.filter((r) => r.log?.status === "taken").length;
  const totalCount = todayReminders.length;
  const allDone = totalCount > 0 && takenCount === totalCount;

  const topPanel = (
    <LinearGradient
      colors={isDark ? ["#0A0A0A", "#000000"] : ["#1A2744", "#0D1321"]}
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: S.xl,
        paddingBottom: 24,
      }}
    >
      {/* Decorative circles */}
      <View
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: isDark ? "rgba(61,214,163,0.05)" : "rgba(61,214,163,0.08)",
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: "absolute",
          bottom: -30,
          left: 40,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: isDark ? "rgba(165,148,249,0.04)" : "rgba(165,148,249,0.06)",
        }}
        pointerEvents="none"
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: Typography.sm,
              color: "rgba(255,255,255,0.45)",
              fontWeight: "500",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            {getFormattedDate(language).toUpperCase()}
          </Text>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "700",
              color: "#FFFFFF",
            }}
          >
            {t(getGreetingKey())}, {username || t("home.friend")} 👋
          </Text>
        </View>
        <ThemeToggle isDark={isDark} />
      </View>

      {streak > 0 && (
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(61,214,163,0.12)",
            borderWidth: 1,
            borderColor: "rgba(61,214,163,0.2)",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text
            style={{
              fontSize: Typography.sm,
              fontWeight: "700",
              color: "#3DD6A3",
              marginLeft: 8,
            }}
          >
            {streak} Day Streak
          </Text>
        </View>
      )}
    </LinearGradient>
  );

  const headerComponent = (
    <View style={{ paddingTop: S.base }}>
      {error && (
        <View
          style={{
            marginBottom: S.base,
            padding: S.base,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: isDark ? "rgba(248,113,113,0.3)" : "rgba(226,75,74,0.2)",
            backgroundColor: isDark ? "rgba(248,113,113,0.06)" : "rgba(226,75,74,0.04)",
          }}
        >
          <Text style={{ fontSize: Typography.sm, color: c.danger, fontWeight: "500" }}>
            {error}
          </Text>
          <Pressable
            onPress={() => { setError(null); loadAll(); }}
            style={{ marginTop: 8 }}
          >
            <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.danger }}>
              Retry →
            </Text>
          </Pressable>
        </View>
      )}

      {totalCount > 0 && (
        <NeoCard style={{ marginBottom: S.base }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary }}>
              {t("home.todayHeader")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: allDone
                  ? isDark ? "rgba(61,214,163,0.12)" : "rgba(29,158,117,0.08)"
                  : isDark ? "#1A1A1A" : "#F0F2F5",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: Typography.sm,
                  fontWeight: "700",
                  color: allDone ? (isDark ? "#3DD6A3" : c.teal) : c.textSecondary,
                }}
              >
                {takenCount}/{totalCount}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 999,
              backgroundColor: isDark ? "#1A1A1A" : c.border,
              overflow: "hidden",
            }}
          >
            {takenCount > 0 && (
              <LinearGradient
                colors={allDone ? ["#3DD6A3", "#A594F9"] : ["#3DD6A3", "#2BC48A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: "100%",
                  borderRadius: 999,
                  width: `${(takenCount / totalCount) * 100}%`,
                }}
              />
            )}
          </View>
          {allDone && (
            <Text style={{ fontSize: Typography.sm, color: isDark ? "#3DD6A3" : c.teal, fontWeight: "600", marginTop: 10 }}>
              ✓ All medications taken for today!
            </Text>
          )}
        </NeoCard>
      )}

      {totalCount > 0 && (
        <Text
          style={{
            fontSize: Typography.sm,
            fontWeight: "700",
            color: isDark ? "rgba(255,255,255,0.4)" : c.textMuted,
            marginBottom: 12,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {t("home.upcoming")}
        </Text>
      )}
    </View>
  );

  const footerComponent = (
    <View style={{ marginTop: S.base, paddingBottom: 32 }}>
      <Pressable
        onPress={() => router.push("/(tabs)/chat")}
        style={{
          borderRadius: R.xl,
          overflow: "hidden",
          marginBottom: S.base,
        }}
      >
        <LinearGradient
          colors={isDark ? ["#141414", "#0D0D0D"] : ["#F7F8FA", "#FFFFFF"]}
          style={{
            padding: S.base + 4,
            borderRadius: R.xl,
            borderWidth: 1,
            borderColor: isDark ? "#1E1E1E" : c.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              overflow: "hidden",
              marginRight: S.base,
            }}
          >
            <LinearGradient
              colors={["#3DD6A3", "#A594F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary }}>
              {t("home.scanPrescription")}
            </Text>
            <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 2 }}>
              {t("home.scanPrescriptionDesc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "rgba(255,255,255,0.2)" : c.textMuted} />
        </LinearGradient>
      </Pressable>

      <NeoButton
        title={t("common.signOut")}
        onPress={() => setShowSignOutConfirm(true)}
        variant="outline"
        loading={authLoading}
      />
    </View>
  );

  if (profileLoading && todayReminders.length === 0) {
    return (
      <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: isDark ? "#000" : c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#3DD6A3" : c.navy} />
        <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 16, fontWeight: "500" }}>
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
      {topPanel}
      {totalCount > 0 ? (
        <FlatList
          data={todayReminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: S.base }}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={footerComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? "#3DD6A3" : c.navy}
            />
          }
          renderItem={({ item }) => (
            <MedicationItem
              reminder={item}
              onTaken={handleTaken}
              onSkip={handleSkip}
              isDark={isDark}
            />
          )}
        />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => "empty"}
          contentContainerStyle={{ paddingHorizontal: S.base, flexGrow: 1 }}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={
            <View style={{ flex: 1 }}>
              <NeoCard style={{ marginBottom: 24 }}>
                <View style={{ alignItems: "center", paddingVertical: S.lg }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 24,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    <LinearGradient
                      colors={isDark ? ["#1A1A1A", "#111111"] : ["#F0F2F5", "#E8ECF2"]}
                      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                    >
                      <Text style={{ fontSize: 40 }}>📋</Text>
                    </LinearGradient>
                  </View>
                  <Text
                    style={{
                      fontSize: Typography.md,
                      fontWeight: "700",
                      color: c.textPrimary,
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    {t("home.noRemindersTitle")}
                  </Text>
                  <Text
                    style={{
                      fontSize: Typography.base,
                      color: c.textSecondary,
                      textAlign: "center",
                      lineHeight: 26,
                    }}
                  >
                    {t("home.noRemindersBody")}
                  </Text>
                </View>
                <NeoButton
                  title={t("home.addReminder")}
                  onPress={() => router.push("/reminder/add")}
                  className="mt-2"
                />
              </NeoCard>
              {footerComponent}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? "#3DD6A3" : c.navy}
            />
          }
          renderItem={() => null}
        />
      )}

      <ConfirmDialog
        visible={showSignOutConfirm}
        title={t("home.signOutConfirmTitle")}
        message={t("home.signOutConfirmBody")}
        confirmText={t("common.signOut")}
        cancelText={t("common.cancel")}
        onConfirm={() => {
          setShowSignOutConfirm(false);
          signOut();
        }}
        onCancel={() => setShowSignOutConfirm(false)}
        destructive
      />
    </View>
  );
}
