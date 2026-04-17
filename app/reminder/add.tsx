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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
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
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#1E1E1E" : c.border,
              backgroundColor: isDark ? "#111111" : c.surface,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "rgba(255,255,255,0.7)" : c.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: c.textPrimary, flex: 1, letterSpacing: -0.3 }}>
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
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <Pressable
                onPress={() => setDoseAmount(Math.max(0.5, doseAmount - 0.5))}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? "#222" : c.border,
                  backgroundColor: isDark ? "#0D0D0D" : c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>−</Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: 16 }}>
                <Text style={{ fontSize: Typography.xxl + 4, fontWeight: "700", color: isDark ? "#3DD6A3" : c.navy }}>
                  {doseAmount % 1 === 0 ? doseAmount.toFixed(0) : doseAmount.toFixed(1)}
                </Text>
              </View>
              <Pressable
                onPress={() => setDoseAmount(doseAmount + 0.5)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#3DD6A3", "#2BC48A"]}
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: "#FFFFFF" }}>+</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DOSE_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => setDoseUnit(unit)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: R.md,
                    minHeight: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: doseUnit === unit
                      ? (isDark ? "rgba(61,214,163,0.4)" : c.navy)
                      : isDark ? "#1E1E1E" : c.border,
                    backgroundColor: doseUnit === unit
                      ? (isDark ? "rgba(61,214,163,0.1)" : "rgba(26,39,68,0.06)")
                      : isDark ? "#0D0D0D" : c.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: Typography.sm,
                      fontWeight: "600",
                      color: doseUnit === unit ? (isDark ? "#3DD6A3" : c.navy) : c.textPrimary,
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
                <Pressable onPress={() => setHour((h) => (h + 1) % 24)} style={{ width: 64, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chevron-up" size={20} color={isDark ? "rgba(255,255,255,0.4)" : c.textMuted} />
                </Pressable>
                <View
                  style={{
                    width: 80,
                    height: 72,
                    borderRadius: R.lg,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(61,214,163,0.2)" : c.border,
                    backgroundColor: isDark ? "#0D0D0D" : c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: isDark ? "#3DD6A3" : c.violet }}>
                    {hour.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable onPress={() => setHour((h) => (h - 1 + 24) % 24)} style={{ width: 64, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chevron-down" size={20} color={isDark ? "rgba(255,255,255,0.4)" : c.textMuted} />
                </Pressable>
              </View>

              <Text style={{ fontSize: Typography.xxl + 4, fontWeight: "700", color: isDark ? "rgba(255,255,255,0.3)" : c.textMuted, marginHorizontal: 10 }}>
                :
              </Text>

              <View style={{ alignItems: "center" }}>
                <Pressable onPress={() => setMinute((m) => (m + 5) % 60)} style={{ width: 64, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chevron-up" size={20} color={isDark ? "rgba(255,255,255,0.4)" : c.textMuted} />
                </Pressable>
                <View
                  style={{
                    width: 80,
                    height: 72,
                    borderRadius: R.lg,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(165,148,249,0.2)" : c.border,
                    backgroundColor: isDark ? "#0D0D0D" : c.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: isDark ? "#A594F9" : c.violet }}>
                    {minute.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable onPress={() => setMinute((m) => (m - 5 + 60) % 60)} style={{ width: 64, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chevron-down" size={20} color={isDark ? "rgba(255,255,255,0.4)" : c.textMuted} />
                </Pressable>
              </View>

              <View style={{ marginLeft: 16, alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: R.md,
                    backgroundColor: isDark ? "rgba(61,214,163,0.08)" : "rgba(26,39,68,0.06)",
                  }}
                >
                  <Text style={{ fontSize: Typography.base, fontWeight: "700", color: isDark ? "#3DD6A3" : c.navy }}>
                    {formatTime(hour, minute)}
                  </Text>
                </View>
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
                  marginBottom: 10,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  minHeight: 60,
                  borderColor: repeatType === option.value
                    ? (isDark ? "rgba(61,214,163,0.4)" : c.navy)
                    : isDark ? "#1E1E1E" : c.border,
                  backgroundColor: repeatType === option.value
                    ? (isDark ? "rgba(61,214,163,0.06)" : "rgba(26,39,68,0.04)")
                    : isDark ? "#0D0D0D" : c.surface,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: repeatType === option.value
                      ? (isDark ? "#3DD6A3" : c.navy)
                      : isDark ? "#333" : c.border,
                    backgroundColor: repeatType === option.value
                      ? (isDark ? "#3DD6A3" : c.navy)
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                    flexShrink: 0,
                  }}
                >
                  {repeatType === option.value && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" }} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: Typography.base,
                      fontWeight: "700",
                      color: repeatType === option.value
                        ? (isDark ? "#3DD6A3" : c.navy)
                        : c.textPrimary,
                    }}
                  >
                    {t(option.labelKey)}
                  </Text>
                  <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 2 }}>
                    {t(option.descKey)}
                  </Text>
                </View>
              </Pressable>
            ))}

            {repeatType === "specific_days" && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: Typography.base, fontWeight: "600", color: c.textPrimary, marginBottom: 12 }}>
                  {t("reminderAdd.selectDays")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {DAY_KEYS.map((dayKey, index) => (
                    <Pressable
                      key={index}
                      onPress={() => toggleDay(index)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {daysOfWeek.includes(index) ? (
                        <LinearGradient
                          colors={["#3DD6A3", "#A594F9"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center" }}
                        >
                          <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: "#FFFFFF" }}>
                            {t(`reminderAdd.days.${dayKey}`)}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: isDark ? "#222" : c.border,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#0D0D0D" : c.surface,
                          }}
                        >
                          <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: c.textMuted }}>
                            {t(`reminderAdd.days.${dayKey}`)}
                          </Text>
                        </View>
                      )}
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
