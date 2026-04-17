import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useProfileStore, UserProfile } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoDropdown } from "@/components/ui/NeoDropdown";
import { NeoToggle } from "@/components/ui/NeoToggle";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { LANGUAGE_OPTIONS, AppLanguage } from "@/lib/i18n";
import { useT } from "@/lib/useT";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
];

function Avatar({
  username,
  onPress,
  colors,
}: {
  username: string | null;
  onPress?: () => void;
  colors: typeof Colors.light;
}) {
  const initials = username
    ? username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 0.5,
        borderColor: colors.border,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      }}
    >
      <Text style={{ fontSize: 40, fontWeight: "700", color: colors.textOnNavy }}>
        {initials}
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  const t = useT();
  const {
    username,
    age,
    gender,
    blood_group,
    weight_kg,
    height_cm,
    city,
    phone,
    emergency_contact_name,
    emergency_contact_phone,
    theme_preference,
    language,
    loading,
    saving,
    fetchProfile,
    saveProfile,
    setTheme,
    setLanguage,
  } = useProfileStore();

  const authUser = useAuthStore((s) => s.user);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const startEditing = useCallback(() => {
    setForm({
      username: username || "",
      age,
      gender,
      blood_group,
      weight_kg,
      height_cm,
      city: city || "",
      emergency_contact_name: emergency_contact_name || "",
      emergency_contact_phone: emergency_contact_phone || "",
    });
    setSaveError(null);
    setEditing(true);
  }, [
    username,
    age,
    gender,
    blood_group,
    weight_kg,
    height_cm,
    city,
    emergency_contact_name,
    emergency_contact_phone,
  ]);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    const { error } = await saveProfile(form);
    if (error) {
      setSaveError(error);
    } else {
      setEditing(false);
    }
  }, [form, saveProfile]);

  const handleThemeToggle = useCallback(
    (isDark: boolean) => {
      setTheme(isDark ? "dark" : "light");
    },
    [setTheme]
  );

  const handleLanguageSelect = useCallback(
    (label: string) => {
      const match = LANGUAGE_OPTIONS.find((opt) => opt.label === label);
      if (match) setLanguage(match.code as AppLanguage);
    },
    [setLanguage]
  );

  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find((o) => o.code === language)?.label ||
    LANGUAGE_OPTIONS[0].label;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.navy} />
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 16 }}>
          {t("profile.loadingProfile")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: S.xl, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary }}>
              {t("profile.title")}
            </Text>
            {!editing && (
              <Pressable
                onPress={startEditing}
                style={{
                  minHeight: 44,
                  minWidth: 100,
                  borderRadius: R.pill,
                  borderWidth: 1.5,
                  borderColor: c.navy,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: c.navy }}>
                  {t("common.edit")}
                </Text>
              </Pressable>
            )}
          </View>

          <Avatar username={username} colors={c} />
          <Text
            style={{
              fontSize: Typography.md,
              fontWeight: "700",
              color: c.textPrimary,
              textAlign: "center",
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {username || t("profile.yourName")}
          </Text>
          <Text
            style={{
              fontSize: Typography.base,
              color: c.textSecondary,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {authUser?.phone || phone || ""}
          </Text>

          {saveError && (
            <View
              style={{
                marginBottom: 16,
                padding: S.base,
                borderWidth: 0.5,
                borderColor: c.danger,
                borderRadius: R.md,
                backgroundColor: isDark ? "rgba(240,149,149,0.08)" : "rgba(226,75,74,0.06)",
              }}
            >
              <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500" }}>
                {saveError}
              </Text>
            </View>
          )}

          <NeoCard style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 16 }}>
              {t("profile.personalInfo")}
            </Text>

            {editing ? (
              <View style={{ gap: 16 }}>
                <NeoInput
                  label={t("profile.fullName")}
                  value={form.username || ""}
                  onChangeText={(val) => setForm({ ...form, username: val })}
                  placeholder={t("profile.placeholderName")}
                />
                <NeoInput
                  label={t("profile.age")}
                  value={form.age?.toString() || ""}
                  onChangeText={(val) =>
                    setForm({
                      ...form,
                      age: val ? parseInt(val, 10) || null : null,
                    })
                  }
                  placeholder={t("profile.placeholderAge")}
                  keyboardType="number-pad"
                />
                <NeoDropdown
                  label={t("profile.gender")}
                  value={form.gender || null}
                  options={GENDER_OPTIONS}
                  onSelect={(v) => setForm({ ...form, gender: v })}
                  placeholder={t("profile.placeholderGender")}
                />
                <NeoDropdown
                  label={t("profile.bloodGroup")}
                  value={form.blood_group || null}
                  options={BLOOD_GROUP_OPTIONS}
                  onSelect={(v) => setForm({ ...form, blood_group: v })}
                  placeholder={t("profile.placeholderBlood")}
                />
                <NeoInput
                  label={t("profile.weightKg")}
                  value={form.weight_kg?.toString() || ""}
                  onChangeText={(val) =>
                    setForm({
                      ...form,
                      weight_kg: val ? parseFloat(val) || null : null,
                    })
                  }
                  placeholder={t("profile.placeholderWeight")}
                  keyboardType="decimal-pad"
                />
                <NeoInput
                  label={t("profile.heightCm")}
                  value={form.height_cm?.toString() || ""}
                  onChangeText={(val) =>
                    setForm({
                      ...form,
                      height_cm: val ? parseFloat(val) || null : null,
                    })
                  }
                  placeholder={t("profile.placeholderHeight")}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <ProfileField label={t("profile.fullName")} value={username} colors={c} notSetLabel={t("common.notSet")} />
                <ProfileField label={t("profile.age")} value={age?.toString()} colors={c} notSetLabel={t("common.notSet")} />
                <ProfileField label={t("profile.gender")} value={gender} colors={c} notSetLabel={t("common.notSet")} />
                <ProfileField label={t("profile.bloodGroup")} value={blood_group} colors={c} notSetLabel={t("common.notSet")} />
                <ProfileField
                  label={t("profile.weight")}
                  value={weight_kg ? `${weight_kg} kg` : null}
                  colors={c}
                  notSetLabel={t("common.notSet")}
                />
                <ProfileField
                  label={t("profile.height")}
                  value={height_cm ? `${height_cm} cm` : null}
                  colors={c}
                  notSetLabel={t("common.notSet")}
                />
              </View>
            )}
          </NeoCard>

          <NeoCard style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 16 }}>
              {t("profile.contactInfo")}
            </Text>

            {editing ? (
              <View style={{ gap: 16 }}>
                <View>
                  <Text
                    style={{
                      fontSize: Typography.base,
                      fontWeight: "600",
                      color: c.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    {t("profile.phone")}
                  </Text>
                  <View
                    style={{
                      minHeight: 56,
                      width: "100%",
                      paddingHorizontal: 16,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: R.md,
                      backgroundColor: isDark ? Colors.dark.surface : "#F7F8FA",
                    }}
                  >
                    <Text style={{ fontSize: Typography.base, color: c.textMuted }}>
                      {authUser?.phone || phone || t("common.notSet")}
                    </Text>
                  </View>
                </View>
                <NeoInput
                  label={t("profile.emergencyContactName")}
                  value={form.emergency_contact_name || ""}
                  onChangeText={(val) =>
                    setForm({ ...form, emergency_contact_name: val })
                  }
                  placeholder={t("profile.placeholderContactName")}
                />
                <NeoInput
                  label={t("profile.emergencyContactPhone")}
                  value={form.emergency_contact_phone || ""}
                  onChangeText={(val) =>
                    setForm({ ...form, emergency_contact_phone: val })
                  }
                  placeholder={t("profile.placeholderContactPhone")}
                  keyboardType="phone-pad"
                />
                <NeoInput
                  label={t("profile.city")}
                  value={form.city || ""}
                  onChangeText={(val) => setForm({ ...form, city: val })}
                  placeholder={t("profile.placeholderCity")}
                />
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <ProfileField
                  label={t("profile.phone")}
                  value={authUser?.phone || phone}
                  colors={c}
                  notSetLabel={t("common.notSet")}
                />
                <ProfileField
                  label={t("profile.emergencyContact")}
                  value={emergency_contact_name}
                  colors={c}
                  notSetLabel={t("common.notSet")}
                />
                <ProfileField
                  label={t("profile.emergencyPhone")}
                  value={emergency_contact_phone}
                  colors={c}
                  notSetLabel={t("common.notSet")}
                />
                <ProfileField label={t("profile.city")} value={city} colors={c} notSetLabel={t("common.notSet")} />
              </View>
            )}
          </NeoCard>

          <NeoCard style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 16 }}>
              {t("profile.appPrefs")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 }}>
              <Text style={{ fontSize: Typography.base, color: c.textPrimary }}>
                {t("profile.theme")}
              </Text>
              <NeoToggle
                value={theme_preference === "dark"}
                onValueChange={handleThemeToggle}
                leftLabel={t("profile.light")}
                rightLabel={t("profile.dark")}
              />
            </View>
            <View style={{ height: 12 }} />
            <NeoDropdown
              label={t("profile.language")}
              value={currentLanguageLabel}
              options={LANGUAGE_OPTIONS.map((o) => o.label)}
              onSelect={handleLanguageSelect}
            />
          </NeoCard>

          {editing && (
            <View style={{ gap: 12, marginBottom: 16 }}>
              <NeoButton
                title={saving ? t("profile.saving") : t("profile.saveChanges")}
                onPress={handleSave}
                loading={saving}
                disabled={saving}
              />
              <NeoButton
                title={t("common.cancel")}
                onPress={() => {
                  setEditing(false);
                  setSaveError(null);
                }}
                variant="outline"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileField({
  label,
  value,
  colors,
  notSetLabel,
}: {
  label: string;
  value: string | null | undefined;
  colors: typeof Colors.light;
  notSetLabel: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
      <Text style={{ fontSize: Typography.base, color: colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: Typography.base, fontWeight: "500", color: colors.textPrimary, flex: 1, textAlign: "right" }}>
        {value || notSetLabel}
      </Text>
    </View>
  );
}
