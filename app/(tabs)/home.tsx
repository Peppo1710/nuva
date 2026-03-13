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
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useReminderStore, TodayReminder } from "@/store/reminderStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
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

function ThemeToggle() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
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
        height: 26,
        width: 48,
        borderRadius: 999,
        backgroundColor: isDark
          ? "rgba(61,214,163,0.6)"
          : "rgba(255,255,255,0.2)",
        paddingHorizontal: 3,
        justifyContent: "center",
      }}
      hitSlop={8}
    >
      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", position: "absolute", left: 5 }}>
        ☀
      </Text>
      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", position: "absolute", right: 5 }}>
        ☾
      </Text>
      <Animated.View
        style={{
          position: "absolute",
          left: 3,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          transform: [{ translateX: thumbAnim }],
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
  const isTaken = reminder.log?.status === "taken";
  const isSkipped = reminder.log?.status === "skipped";
  const hasAction = isTaken || isSkipped;

  const bgColor = isTaken
    ? isDark ? "rgba(61,214,163,0.08)" : "rgba(29,158,117,0.06)"
    : isSkipped
      ? isDark ? "rgba(74,85,104,0.2)" : "rgba(160,170,186,0.1)"
      : c.surface;

  const borderColor = isTaken
    ? c.teal
    : isSkipped
      ? c.textMuted
      : c.border;

  return (
    <View
      style={{
        padding: S.base,
        borderRadius: R.lg,
        borderWidth: 0.5,
        borderColor,
        backgroundColor: bgColor,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {isTaken && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c.teal,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
        {isSkipped && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c.textMuted,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: Typography.base,
              fontWeight: "700",
              color: isTaken
                ? c.teal
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
              marginTop: 4,
              color: hasAction ? c.textMuted : c.textSecondary,
            }}
          >
            {formatTime(reminder.reminder_time)} · {formatDose(reminder.dose_amount, reminder.dose_unit)}
          </Text>
        </View>
      </View>

      {!hasAction && (
        <View style={{ flexDirection: "row", marginTop: 12, gap: 12 }}>
          <Pressable
            onPress={() => onTaken(reminder.id)}
            accessibilityLabel={`Mark ${reminder.medicine_name} as taken`}
            accessibilityRole="button"
            style={{
              flex: 1,
              flexDirection: "row",
              minHeight: 48,
              borderRadius: R.md,
              backgroundColor: c.teal,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: "#FFFFFF", marginLeft: 8 }}>
              Taken
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onSkip(reminder.id)}
            accessibilityLabel={`Skip ${reminder.medicine_name}`}
            accessibilityRole="button"
            style={{
              flex: 1,
              flexDirection: "row",
              minHeight: 48,
              borderRadius: R.md,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Ionicons name="close-circle" size={22} color={c.textSecondary} />
            <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.textSecondary, marginLeft: 8 }}>
              Skip
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { signOut, loading: authLoading } = useAuthStore();
  const { username, fetchProfile, loading: profileLoading } = useProfileStore();
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
      setError("Could not load your dashboard. Please check your internet.");
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
    <View
      style={{
        backgroundColor: isDark ? Colors.dark.navy : Colors.light.navy,
        paddingTop: insets.top + 12,
        paddingHorizontal: S.base,
        paddingBottom: 18,
        borderBottomLeftRadius: R.xl,
        borderBottomRightRadius: R.xl,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: Typography.md,
              fontWeight: "600",
              color: Colors.light.textOnNavy,
            }}
          >
            {getGreeting()}, {username || "there"}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              marginTop: 2,
            }}
          >
            {getFormattedDate()}
          </Text>
        </View>
        <ThemeToggle />
      </View>
    </View>
  );

  const headerComponent = (
    <View style={{ paddingTop: S.base }}>
      {error && (
        <NeoCard style={{ marginBottom: S.base }}>
          <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500" }}>
            {error}
          </Text>
          <NeoButton
            title="Try Again"
            onPress={() => {
              setError(null);
              loadAll();
            }}
            variant="outline"
            className="mt-3"
          />
        </NeoCard>
      )}

      {streak > 0 && (
        <NeoCard style={{ marginBottom: S.base }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 36, marginRight: 12 }}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.teal }}>
                {streak} Day Streak!
              </Text>
              <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 4 }}>
                You've taken medicine on time for {streak} day{streak !== 1 ? "s" : ""} in a row
              </Text>
            </View>
          </View>
        </NeoCard>
      )}

      {totalCount > 0 && (
        <NeoCard style={{ marginBottom: S.base }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              Today's Medications
            </Text>
            <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.navy }}>
              {takenCount}/{totalCount}
            </Text>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 999,
              backgroundColor: c.border,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                borderRadius: 999,
                backgroundColor: allDone ? c.teal : c.navy,
                width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
              }}
            />
          </View>
          {allDone && (
            <Text style={{ fontSize: Typography.sm, color: c.teal, fontWeight: "600", marginTop: 8 }}>
              All medications taken for today!
            </Text>
          )}
        </NeoCard>
      )}

      {totalCount > 0 && (
        <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
          Schedule
        </Text>
      )}
    </View>
  );

  const footerComponent = (
    <View style={{ marginTop: S.base, paddingBottom: 32 }}>
      <Pressable
        onPress={() => router.push("/(tabs)/chat")}
        style={{
          padding: S.lg,
          borderRadius: R.lg,
          backgroundColor: isDark ? "rgba(58,81,160,0.12)" : "rgba(26,39,68,0.04)",
          borderWidth: 0.5,
          borderColor: c.border,
          marginBottom: S.base,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: R.md,
              backgroundColor: c.navy,
              alignItems: "center",
              justifyContent: "center",
              marginRight: S.base,
            }}
          >
            <Ionicons name="camera-outline" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary }}>
              Scan a Prescription
            </Text>
            <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 4 }}>
              Use AI to read your prescription and add medicines
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={c.textMuted} />
        </View>
      </Pressable>

      <NeoButton
        title="Sign Out"
        onPress={() => setShowSignOutConfirm(true)}
        variant="outline"
        loading={authLoading}
      />
    </View>
  );

  if (profileLoading && todayReminders.length === 0) {
    return (
      <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.navy} />
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 16 }}>
          Loading your dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
                <View style={{ alignItems: "center", paddingVertical: S.base }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
                  <Text
                    style={{
                      fontSize: Typography.md,
                      fontWeight: "700",
                      color: c.textPrimary,
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    No medicines scheduled today
                  </Text>
                  <Text
                    style={{
                      fontSize: Typography.base,
                      color: c.textSecondary,
                      textAlign: "center",
                      lineHeight: 26,
                    }}
                  >
                    Tap the Reminders tab to add your medications and set up daily alerts.
                  </Text>
                </View>
                <NeoButton
                  title="Add a Reminder"
                  onPress={() => router.push("/reminder/add")}
                  className="mt-2"
                />
              </NeoCard>
              {footerComponent}
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={() => null}
        />
      )}

      <ConfirmDialog
        visible={showSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of MediAssist?"
        confirmText="Sign Out"
        cancelText="Stay"
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
