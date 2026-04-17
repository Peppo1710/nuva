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
import { useColorScheme } from "nativewind";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoCard } from "@/components/ui/NeoCard";
import { useReminderStore, CreateReminderData } from "@/store/reminderStore";
import { useMedicalStore } from "@/store/medicalStore";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

const DOSE_UNITS = ["tablet", "capsule", "ml", "drops"] as const;
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const REPEAT_OPTIONS = [
  { value: "daily", labelKey: "reminderAdd.daily", descKey: "reminderAdd.dailyDesc" },
  { value: "specific_days", labelKey: "reminderAdd.specificDays", descKey: "reminderAdd.specificDaysDesc" },
  { value: "interval", labelKey: "reminderAdd.interval", descKey: "reminderAdd.intervalDesc" },
] as const;

export default function AddReminderScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();

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
      setNameError(t("reminderAdd.nameRequired"));
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.base }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={{
              minWidth: 56,
              minHeight: 56,
              borderRadius: R.md,
              borderWidth: 0.5,
              borderColor: c.border,
              backgroundColor: c.surface,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: Typography.xl, color: c.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: c.textPrimary, flex: 1 }}>
            {isEditing ? t("reminderAdd.editTitle") : t("reminderAdd.title")}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: S.xl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Medicine Name */}
          <NeoCard style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
              {t("reminderAdd.medicineName")}
            </Text>
            <NeoInput
              value={medicineName}
              onChangeText={(text) => {
                setMedicineName(text);
                setNameError("");
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={t("reminderAdd.medicineNamePlaceholder")}
              error={nameError}
            />
            {showSuggestions && filteredMedications.length > 0 && (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: R.md,
                  borderWidth: 0.5,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  overflow: "hidden",
                }}
              >
                {filteredMedications.slice(0, 5).map((med) => (
                  <Pressable
                    key={med.id}
                    onPress={() => {
                      setMedicineName(med.name);
                      setShowSuggestions(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 0.5,
                      borderBottomColor: c.border,
                    }}
                  >
                    <Text style={{ fontSize: Typography.base, color: c.textPrimary }}>
                      {med.name}
                    </Text>
                    {med.dosage && (
                      <Text style={{ fontSize: Typography.base, color: c.textSecondary }}>
                        {med.dosage}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </NeoCard>

          {/* Dosage */}
          <NeoCard style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
              {t("reminderAdd.dose")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Pressable
                onPress={() => setDoseAmount(Math.max(0.5, doseAmount - 0.5))}
                style={{
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: R.md,
                  borderWidth: 0.5,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
                  −
                </Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: 16 }}>
                <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.textPrimary }}>
                  {doseAmount % 1 === 0 ? doseAmount.toFixed(0) : doseAmount.toFixed(1)}
                </Text>
              </View>
              <Pressable
                onPress={() => setDoseAmount(doseAmount + 0.5)}
                style={{
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: R.md,
                  borderWidth: 0.5,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
                  +
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {DOSE_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => setDoseUnit(unit)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    marginRight: 12,
                    marginBottom: 8,
                    borderRadius: R.md,
                    borderWidth: doseUnit === unit ? 1.5 : 0.5,
                    minHeight: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: doseUnit === unit ? c.navy : c.border,
                    backgroundColor: doseUnit === unit
                      ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(26,39,68,0.06)")
                      : c.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: Typography.base,
                      fontWeight: "600",
                      color: doseUnit === unit ? c.navy : c.textPrimary,
                    }}
                  >
                    {t(`reminderAdd.units.${unit}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </NeoCard>

          {/* Time Picker */}
          <NeoCard style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
              {t("reminderAdd.time")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => setHour((h) => (h + 1) % 24)}
                  style={{ minWidth: 56, minHeight: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: Typography.lg, color: c.textPrimary }}>▲</Text>
                </Pressable>
                <View
                  style={{
                    minWidth: 80,
                    minHeight: 64,
                    borderRadius: R.lg,
                    borderWidth: 0.5,
                    borderColor: c.border,
                    backgroundColor: c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.violet }}>
                    {hour.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setHour((h) => (h - 1 + 24) % 24)}
                  style={{ minWidth: 56, minHeight: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: Typography.lg, color: c.textPrimary }}>▼</Text>
                </Pressable>
              </View>

              <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.textPrimary, marginHorizontal: 12 }}>
                :
              </Text>

              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => setMinute((m) => (m + 5) % 60)}
                  style={{ minWidth: 56, minHeight: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: Typography.lg, color: c.textPrimary }}>▲</Text>
                </Pressable>
                <View
                  style={{
                    minWidth: 80,
                    minHeight: 64,
                    borderRadius: R.lg,
                    borderWidth: 0.5,
                    borderColor: c.border,
                    backgroundColor: c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.violet }}>
                    {minute.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setMinute((m) => (m - 5 + 60) % 60)}
                  style={{ minWidth: 56, minHeight: 48, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: Typography.lg, color: c.textPrimary }}>▼</Text>
                </Pressable>
              </View>

              <View style={{ marginLeft: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: Typography.md, fontWeight: "600", color: c.textSecondary }}>
                  {formatTime(hour, minute)}
                </Text>
              </View>
            </View>
          </NeoCard>

          {/* Repeat Pattern */}
          <NeoCard style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
              {t("reminderAdd.repeat")}
            </Text>
            {REPEAT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setRepeatType(option.value)}
                style={{
                  padding: S.base,
                  marginBottom: 12,
                  borderRadius: R.lg,
                  borderWidth: repeatType === option.value ? 1.5 : 0.5,
                  minHeight: 56,
                  borderColor: repeatType === option.value ? c.navy : c.border,
                  backgroundColor: repeatType === option.value
                    ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(26,39,68,0.06)")
                    : c.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: Typography.base,
                    fontWeight: "700",
                    color: repeatType === option.value ? c.navy : c.textPrimary,
                  }}
                >
                  {t(option.labelKey)}
                </Text>
                <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 4 }}>
                  {t(option.descKey)}
                </Text>
              </Pressable>
            ))}

            {repeatType === "specific_days" && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.textPrimary, marginBottom: 12 }}>
                  {t("reminderAdd.selectDays")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {DAY_KEYS.map((dayKey, index) => (
                    <Pressable
                      key={index}
                      onPress={() => toggleDay(index)}
                      style={{
                        minWidth: 56,
                        minHeight: 56,
                        borderRadius: R.md,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                        marginBottom: 8,
                        borderWidth: 0.5,
                        borderColor: daysOfWeek.includes(index) ? c.navy : c.border,
                        backgroundColor: daysOfWeek.includes(index)
                          ? c.navy
                          : c.surface,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: Typography.base,
                          fontWeight: "700",
                          color: daysOfWeek.includes(index) ? "#FFFFFF" : c.textPrimary,
                        }}
                      >
                        {t(`reminderAdd.days.${dayKey}`)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {repeatType === "interval" && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.textPrimary, marginBottom: 12 }}>
                  {t("reminderAdd.intervalQuestion")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    onPress={() => setIntervalHours(Math.max(1, intervalHours - 1))}
                    style={{
                      minWidth: 56,
                      minHeight: 56,
                      borderRadius: R.md,
                      borderWidth: 0.5,
                      borderColor: c.border,
                      backgroundColor: c.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
                      −
                    </Text>
                  </Pressable>
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: 16 }}>
                    <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.textPrimary }}>
                      {intervalHours}
                    </Text>
                    <Text style={{ fontSize: Typography.base, color: c.textSecondary }}>{t("reminderAdd.hours")}</Text>
                  </View>
                  <Pressable
                    onPress={() => setIntervalHours(intervalHours + 1)}
                    style={{
                      minWidth: 56,
                      minHeight: 56,
                      borderRadius: R.md,
                      borderWidth: 0.5,
                      borderColor: c.border,
                      backgroundColor: c.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </NeoCard>

          {/* Notes */}
          <NeoCard style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
              {t("reminderAdd.notes")}
            </Text>
            <NeoInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t("reminderAdd.notesPlaceholder")}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />
          </NeoCard>

          <View style={{ paddingBottom: 32 }}>
            <NeoButton
              title={saving ? t("reminderAdd.saving") : isEditing ? t("reminderAdd.update") : t("reminderAdd.save")}
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
