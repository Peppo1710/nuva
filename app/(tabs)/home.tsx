import React, { useEffect, useState, useCallback } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useReminderStore, TodayReminder } from "@/store/reminderStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
    year: "numeric",
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
  const isTaken = reminder.log?.status === "taken";
  const isSkipped = reminder.log?.status === "skipped";
  const hasAction = isTaken || isSkipped;

  return (
    <View
      className={`p-4 rounded-2xl border-[1px] mb-3 ${
        isTaken
          ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800"
          : isSkipped
            ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800"
      }`}
    >
      <View className="flex-row items-center">
        {isTaken && (
          <View className="w-[32px] h-[32px] rounded-full bg-success items-center justify-center mr-3">
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
        {isSkipped && (
          <View className="w-[32px] h-[32px] rounded-full bg-gray-400 items-center justify-center mr-3">
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </View>
        )}
        <View className="flex-1">
          <Text
            className={`text-[18px] font-bold ${
              isTaken
                ? "text-green-700 dark:text-green-400 line-through"
                : isSkipped
                  ? "text-gray-400 dark:text-gray-500 line-through"
                  : "text-navy dark:text-navy-dark"
            }`}
          >
            {reminder.medicine_name}
          </Text>
          <Text
            className={`text-[16px] mt-1 ${
              hasAction
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {formatTime(reminder.reminder_time)} · {formatDose(reminder.dose_amount, reminder.dose_unit)}
          </Text>
        </View>
      </View>

      {!hasAction && (
        <View className="flex-row mt-3 gap-3">
          <Pressable
            onPress={() => onTaken(reminder.id)}
            accessibilityLabel={`Mark ${reminder.medicine_name} as taken`}
            accessibilityRole="button"
            className="flex-1 flex-row min-h-[48px] rounded-xl bg-success items-center justify-center"
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text className="text-[16px] font-bold text-white ml-2">Taken</Text>
          </Pressable>
          <Pressable
            onPress={() => onSkip(reminder.id)}
            accessibilityLabel={`Skip ${reminder.medicine_name}`}
            accessibilityRole="button"
            className="flex-1 flex-row min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center border-[1px] border-gray-200 dark:border-gray-700"
          >
            <Ionicons
              name="close-circle"
              size={22}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <Text className="text-[16px] font-bold text-gray-600 dark:text-gray-400 ml-2">
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

  const headerComponent = (
    <View>
      {/* Greeting */}
      <Text className="text-[24px] font-bold text-navy dark:text-navy-dark">
        {getGreeting()}, {username || "there"}!
      </Text>
      <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-1 mb-6">
        {getFormattedDate()}
      </Text>

      {error && (
        <NeoCard className="mb-4 border-error">
          <Text className="text-[18px] text-error font-medium">{error}</Text>
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

      {/* Streak Card */}
      {streak > 0 && (
        <NeoCard className="mb-4">
          <View className="flex-row items-center">
            <Text className="text-[36px] mr-3">🔥</Text>
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-navy dark:text-navy-dark">
                {streak} Day Streak!
              </Text>
              <Text className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
                You've taken medicine on time for {streak} day{streak !== 1 ? "s" : ""} in a row
              </Text>
            </View>
          </View>
        </NeoCard>
      )}

      {/* Progress summary */}
      {totalCount > 0 && (
        <NeoCard className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark">
              Today's Medications
            </Text>
            <Text className="text-[18px] font-semibold text-primary">
              {takenCount}/{totalCount}
            </Text>
          </View>
          <View className="h-[8px] rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <View
              className={`h-full rounded-full ${allDone ? "bg-success" : "bg-primary"}`}
              style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
            />
          </View>
          {allDone && (
            <Text className="text-[16px] text-success font-semibold mt-2">
              All medications taken for today!
            </Text>
          )}
        </NeoCard>
      )}

      {/* Section header for the list */}
      {totalCount > 0 && (
        <Text className="text-[18px] font-bold text-navy dark:text-navy-dark mb-3">
          Schedule
        </Text>
      )}
    </View>
  );

  const footerComponent = (
    <View className="mt-4 pb-8">
      {/* Scan Prescription Shortcut */}
      <Pressable
        onPress={() => router.push("/(tabs)/chat")}
        className="p-5 rounded-2xl bg-primary/10 dark:bg-primary/20 border-[1px] border-primary/30 dark:border-primary/40 mb-4"
      >
        <View className="flex-row items-center">
          <View className="w-[48px] h-[48px] rounded-xl bg-primary items-center justify-center mr-4">
            <Ionicons name="camera-outline" size={26} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark">
              Scan a Prescription
            </Text>
            <Text className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
              Use AI to read your prescription and add medicines
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? "#A1A1AA" : "#9CA3AF"}
          />
        </View>
      </Pressable>

      {/* Sign Out */}
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
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#0F766E" />
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-4">
          Loading your dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {totalCount > 0 ? (
        <FlatList
          data={todayReminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, flexGrow: 1 }}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={
            <View className="flex-1">
              <NeoCard className="mb-6">
                <View className="items-center py-4">
                  <Text className="text-[48px] mb-3">📋</Text>
                  <Text className="text-[20px] font-bold text-navy dark:text-navy-dark text-center mb-2">
                    No medicines scheduled today
                  </Text>
                  <Text className="text-[18px] text-gray-500 dark:text-gray-400 text-center leading-[26px]">
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
    </SafeAreaView>
  );
}
