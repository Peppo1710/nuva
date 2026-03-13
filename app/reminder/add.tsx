import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoCard } from "@/components/ui/NeoCard";
import { useReminderStore, CreateReminderData } from "@/store/reminderStore";
import { useMedicalStore } from "@/store/medicalStore";

const DOSE_UNITS = ["tablet", "capsule", "ml", "drops"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REPEAT_OPTIONS = [
  { value: "daily", label: "Daily", description: "Every day" },
  { value: "specific_days", label: "Specific Days", description: "Choose days" },
  { value: "interval", label: "Interval", description: "Every X hours" },
] as const;

export default function AddReminderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    medicine_name?: string;
    dose_amount?: string;
    dose_unit?: string;
  }>();

  const isEditing = !!params.id;
  const {
    reminders,
    createReminder,
    updateReminder,
    saving,
  } = useReminderStore();
  const { medications, fetchMedications } = useMedicalStore();

  const [medicineName, setMedicineName] = useState(params.medicine_name || "");
  const [doseAmount, setDoseAmount] = useState(
    params.dose_amount ? parseFloat(params.dose_amount) : 1
  );
  const [doseUnit, setDoseUnit] = useState(params.dose_unit || "tablet");
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [repeatType, setRepeatType] = useState<"daily" | "specific_days" | "interval">("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [intervalHours, setIntervalHours] = useState(8);
  const [notes, setNotes] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const reminder = reminders.find((r) => r.id === params.id);
      if (reminder) {
        setMedicineName(reminder.medicine_name);
        setDoseAmount(reminder.dose_amount);
        setDoseUnit(reminder.dose_unit);
        const [h, m] = reminder.reminder_time.split(":");
        setHour(parseInt(h, 10));
        setMinute(parseInt(m, 10));
        setRepeatType(reminder.repeat_type);
        setDaysOfWeek(reminder.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
        setIntervalHours(reminder.interval_hours || 8);
        setNotes(reminder.notes || "");
      }
    }
  }, [isEditing, params.id]);

  const filteredMedications = medications.filter(
    (m) =>
      medicineName.length > 0 &&
      m.name.toLowerCase().includes(medicineName.toLowerCase()) &&
      m.name.toLowerCase() !== medicineName.toLowerCase()
  );

  const toggleDay = useCallback(
    (day: number) => {
      setDaysOfWeek((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
    },
    []
  );

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const handleSave = async () => {
    if (!medicineName.trim()) {
      setNameError("Please enter the medicine name");
      return;
    }
    setNameError("");

    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;

    const data: CreateReminderData = {
      medicine_name: medicineName.trim(),
      dose_amount: doseAmount,
      dose_unit: doseUnit,
      reminder_time: timeStr,
      repeat_type: repeatType,
      days_of_week: repeatType === "specific_days" ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
      interval_hours: repeatType === "interval" ? intervalHours : undefined,
      notes: notes.trim() || undefined,
    };

    let result;
    if (isEditing && params.id) {
      result = await updateReminder(params.id, data);
    } else {
      result = await createReminder(data);
    }

    if (result.error) {
      setNameError(result.error);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 pt-6 pb-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark items-center justify-center mr-4 shadow-sm"
          >
            <Text className="text-[28px] text-navy dark:text-navy-dark">←</Text>
          </Pressable>
          <Text className="text-[24px] font-bold text-navy dark:text-navy-dark flex-1">
            {isEditing ? "Edit Reminder" : "Add Reminder"}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Medicine Name */}
          <NeoCard className="mb-5">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mb-3">
              Medicine Name
            </Text>
            <NeoInput
              value={medicineName}
              onChangeText={(text) => {
                setMedicineName(text);
                setNameError("");
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter medicine name"
              error={nameError}
            />
            {showSuggestions && filteredMedications.length > 0 && (
              <View className="mt-2 rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
                {filteredMedications.slice(0, 5).map((med) => (
                  <Pressable
                    key={med.id}
                    onPress={() => {
                      setMedicineName(med.name);
                      setShowSuggestions(false);
                    }}
                    className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    <Text className="text-[18px] text-navy dark:text-navy-dark">
                      {med.name}
                    </Text>
                    {med.dosage && (
                      <Text className="text-[18px] text-gray-500 dark:text-gray-400">
                        {med.dosage}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </NeoCard>

          {/* Dosage */}
          <NeoCard className="mb-5">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mb-3">
              Dosage
            </Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => setDoseAmount(Math.max(0.5, doseAmount - 0.5))}
                className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm"
              >
                <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
                  −
                </Text>
              </Pressable>
              <View className="flex-1 items-center justify-center mx-4">
                <Text className="text-[32px] font-bold text-navy dark:text-navy-dark">
                  {doseAmount % 1 === 0 ? doseAmount.toFixed(0) : doseAmount.toFixed(1)}
                </Text>
              </View>
              <Pressable
                onPress={() => setDoseAmount(doseAmount + 0.5)}
                className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm"
              >
                <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
                  +
                </Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap">
              {DOSE_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => setDoseUnit(unit)}
                  className={`px-5 py-3 mr-3 mb-2 rounded-xl border-[1px] min-h-[48px] items-center justify-center shadow-sm ${
                    doseUnit === unit
                      ? "border-primary bg-primary/10 dark:bg-primary/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
                  }`}
                >
                  <Text
                    className={`text-[18px] font-semibold ${
                      doseUnit === unit
                        ? "text-primary"
                        : "text-navy dark:text-navy-dark"
                    }`}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </NeoCard>

          {/* Time Picker */}
          <NeoCard className="mb-5">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mb-3">
              Time
            </Text>
            <View className="flex-row items-center justify-center">
              <View className="items-center">
                <Pressable
                  onPress={() => setHour((h) => (h + 1) % 24)}
                  className="min-w-[56px] min-h-[48px] items-center justify-center"
                >
                  <Text className="text-[24px] text-navy dark:text-navy-dark">▲</Text>
                </Pressable>
                <View className="min-w-[80px] min-h-[64px] rounded-2xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm">
                  <Text className="text-[32px] font-bold text-navy dark:text-navy-dark">
                    {hour.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setHour((h) => (h - 1 + 24) % 24)}
                  className="min-w-[56px] min-h-[48px] items-center justify-center"
                >
                  <Text className="text-[24px] text-navy dark:text-navy-dark">▼</Text>
                </Pressable>
              </View>

              <Text className="text-[32px] font-bold text-navy dark:text-navy-dark mx-3">
                :
              </Text>

              <View className="items-center">
                <Pressable
                  onPress={() => setMinute((m) => (m + 5) % 60)}
                  className="min-w-[56px] min-h-[48px] items-center justify-center"
                >
                  <Text className="text-[24px] text-navy dark:text-navy-dark">▲</Text>
                </Pressable>
                <View className="min-w-[80px] min-h-[64px] rounded-2xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm">
                  <Text className="text-[32px] font-bold text-navy dark:text-navy-dark">
                    {minute.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setMinute((m) => (m - 5 + 60) % 60)}
                  className="min-w-[56px] min-h-[48px] items-center justify-center"
                >
                  <Text className="text-[24px] text-navy dark:text-navy-dark">▼</Text>
                </Pressable>
              </View>

              <View className="ml-4 items-center justify-center">
                <Text className="text-[20px] font-semibold text-gray-500 dark:text-gray-400">
                  {formatTime(hour, minute)}
                </Text>
              </View>
            </View>
          </NeoCard>

          {/* Repeat Pattern */}
          <NeoCard className="mb-5">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mb-3">
              Repeat
            </Text>
            {REPEAT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setRepeatType(option.value)}
                className={`p-4 mb-3 rounded-2xl border-[1px] min-h-[56px] shadow-sm ${
                  repeatType === option.value
                    ? "border-primary bg-primary/10 dark:bg-primary/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
                }`}
              >
                <Text
                  className={`text-[18px] font-bold ${
                    repeatType === option.value
                      ? "text-primary"
                      : "text-navy dark:text-navy-dark"
                  }`}
                >
                  {option.label}
                </Text>
                <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </Text>
              </Pressable>
            ))}

            {repeatType === "specific_days" && (
              <View className="mt-3">
                <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mb-3">
                  Select Days
                </Text>
                <View className="flex-row flex-wrap">
                  {DAY_LABELS.map((label, index) => (
                    <Pressable
                      key={index}
                      onPress={() => toggleDay(index)}
                      className={`min-w-[56px] min-h-[56px] rounded-xl items-center justify-center mr-2 mb-2 border-[1px] shadow-sm ${
                        daysOfWeek.includes(index)
                          ? "border-primary bg-primary"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
                      }`}
                    >
                      <Text
                        className={`text-[18px] font-bold ${
                          daysOfWeek.includes(index)
                            ? "text-white"
                            : "text-navy dark:text-navy-dark"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {repeatType === "interval" && (
              <View className="mt-3">
                <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mb-3">
                  Every how many hours?
                </Text>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => setIntervalHours(Math.max(1, intervalHours - 1))}
                    className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm"
                  >
                    <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
                      −
                    </Text>
                  </Pressable>
                  <View className="flex-1 items-center justify-center mx-4">
                    <Text className="text-[32px] font-bold text-navy dark:text-navy-dark">
                      {intervalHours}
                    </Text>
                    <Text className="text-[18px] text-gray-500 dark:text-gray-400">hours</Text>
                  </View>
                  <Pressable
                    onPress={() => setIntervalHours(intervalHours + 1)}
                    className="min-w-[56px] min-h-[56px] rounded-xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark items-center justify-center shadow-sm"
                  >
                    <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </NeoCard>

          {/* Notes */}
          <NeoCard className="mb-5">
            <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mb-3">
              Notes (Optional)
            </Text>
            <NeoInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Take after food, with water"
              multiline
              numberOfLines={3}
              className="min-h-[80px]"
            />
          </NeoCard>

          <View className="pb-8">
            <NeoButton
              title={saving ? "Saving..." : isEditing ? "Update Reminder" : "Save Reminder"}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
