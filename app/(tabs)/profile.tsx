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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Avatar({
  username,
  onPress,
  isDark,
}: {
  username: string | null;
  onPress?: () => void;
  isDark: boolean;
}) {
  const initials = username
    ? username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <Pressable
      onPress={onPress}
      style={{ alignSelf: "center", alignItems: "center" }}
    >
      {/* Gradient ring */}
      <View
        style={{
          width: 124,
          height: 124,
          borderRadius: 62,
          overflow: "hidden",
          padding: 3,
          shadowColor: "#3DD6A3",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.35 : 0.2,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={["#3DD6A3", "#A594F9", "#3DD6A3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 62,
            padding: 3,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 59,
              backgroundColor: isDark ? "#0D0D0D" : "#F0F2F5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 36, fontWeight: "700", color: isDark ? "#FFFFFF" : "#1A2744" }}>
              {initials}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function SectionCard({
  title,
  icon,
  iconColor,
  children,
  action,
  isDark,
  colors,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  isDark: boolean;
  colors: typeof Colors.light;
}) {
  return (
    <NeoCard style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        <Text style={{ fontSize: Typography.base, fontWeight: "700", color: colors.textPrimary, flex: 1 }}>
          {title}
        </Text>
        {action}
      </View>
      {children}
    </NeoCard>
  );
}

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  const t = useT();
  const {
    username, age, gender, blood_group, weight_kg, height_cm, city, phone,
    emergency_contact_name, emergency_contact_phone, theme_preference, language,
    loading, saving, fetchProfile, saveProfile, setTheme, setLanguage,
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
  }, [username, age, gender, blood_group, weight_kg, height_cm, city, emergency_contact_name, emergency_contact_phone]);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#3DD6A3" : c.navy} />
        <Text style={{ fontSize: Typography.sm, color: c.textSecondary, marginTop: 16, fontWeight: "500" }}>
          {t("profile.loadingProfile")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
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
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, letterSpacing: -0.5 }}>
              {t("profile.title")}
            </Text>
            {!editing && (
              <Pressable
                onPress={startEditing}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: R.pill,
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(61,214,163,0.3)" : c.navy,
                  backgroundColor: isDark ? "rgba(61,214,163,0.06)" : "transparent",
                }}
              >
                <Text style={{ fontSize: Typography.sm, fontWeight: "700", color: isDark ? "#3DD6A3" : c.navy }}>
                  {t("common.edit")}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Avatar + Name */}
          <Avatar username={username} isDark={isDark} />
          <Text
            style={{
              fontSize: Typography.md,
              fontWeight: "700",
              color: c.textPrimary,
              textAlign: "center",
              marginTop: 14,
              marginBottom: 4,
            }}
          >
            {username || t("profile.yourName")}
          </Text>
          <Text
            style={{
              fontSize: Typography.sm,
              color: isDark ? "rgba(255,255,255,0.35)" : c.textSecondary,
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            {authUser?.phone || phone || ""}
          </Text>

          {/* Stats row */}
          {(age || blood_group || weight_kg) && (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {age && (
                <StatPill label="Age" value={`${age}y`} isDark={isDark} color="#3DD6A3" />
              )}
              {blood_group && (
                <StatPill label="Blood" value={blood_group} isDark={isDark} color="#F87171" />
              )}
              {weight_kg && (
                <StatPill label="Weight" value={`${weight_kg}kg`} isDark={isDark} color="#A594F9" />
              )}
              {height_cm && (
                <StatPill label="Height" value={`${height_cm}cm`} isDark={isDark} color="#60A5FA" />
              )}
            </View>
          )}

          {saveError && (
            <View
              style={{
                marginBottom: 16,
                padding: S.base,
                borderWidth: 1,
                borderColor: isDark ? "rgba(248,113,113,0.2)" : "rgba(226,75,74,0.15)",
                borderRadius: R.lg,
                backgroundColor: isDark ? "rgba(248,113,113,0.06)" : "rgba(226,75,74,0.04)",
              }}
            >
              <Text style={{ fontSize: Typography.sm, color: c.danger, fontWeight: "500" }}>{saveError}</Text>
            </View>
          )}

          {/* Personal Info */}
          <SectionCard
            title={t("profile.personalInfo")}
            icon="person-outline"
            iconColor="#3DD6A3"
            isDark={isDark}
            colors={c}
          >
            {editing ? (
              <View style={{ gap: 16 }}>
                <NeoInput label={t("profile.fullName")} value={form.username || ""} onChangeText={(val) => setForm({ ...form, username: val })} placeholder={t("profile.placeholderName")} />
                <NeoInput label={t("profile.age")} value={form.age?.toString() || ""} onChangeText={(val) => setForm({ ...form, age: val ? parseInt(val, 10) || null : null })} placeholder={t("profile.placeholderAge")} keyboardType="number-pad" />
                <NeoDropdown label={t("profile.gender")} value={form.gender || null} options={GENDER_OPTIONS} onSelect={(v) => setForm({ ...form, gender: v })} placeholder={t("profile.placeholderGender")} />
                <NeoDropdown label={t("profile.bloodGroup")} value={form.blood_group || null} options={BLOOD_GROUP_OPTIONS} onSelect={(v) => setForm({ ...form, blood_group: v })} placeholder={t("profile.placeholderBlood")} />
                <NeoInput label={t("profile.weightKg")} value={form.weight_kg?.toString() || ""} onChangeText={(val) => setForm({ ...form, weight_kg: val ? parseFloat(val) || null : null })} placeholder={t("profile.placeholderWeight")} keyboardType="decimal-pad" />
                <NeoInput label={t("profile.heightCm")} value={form.height_cm?.toString() || ""} onChangeText={(val) => setForm({ ...form, height_cm: val ? parseFloat(val) || null : null })} placeholder={t("profile.placeholderHeight")} keyboardType="decimal-pad" />
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <ProfileField label={t("profile.fullName")} value={username} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.age")} value={age?.toString()} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.gender")} value={gender} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.bloodGroup")} value={blood_group} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.weight")} value={weight_kg ? `${weight_kg} kg` : null} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.height")} value={height_cm ? `${height_cm} cm` : null} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
              </View>
            )}
          </SectionCard>

          {/* Contact Info */}
          <SectionCard
            title={t("profile.contactInfo")}
            icon="call-outline"
            iconColor="#60A5FA"
            isDark={isDark}
            colors={c}
          >
            {editing ? (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: isDark ? "rgba(255,255,255,0.6)" : c.textSecondary, marginBottom: 8, letterSpacing: 0.3, textTransform: "uppercase" }}>
                    {t("profile.phone")}
                  </Text>
                  <View
                    style={{
                      minHeight: 54,
                      paddingHorizontal: 16,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: isDark ? "#1E1E1E" : c.border,
                      borderRadius: R.lg,
                      backgroundColor: isDark ? "#0D0D0D" : "#F7F8FA",
                    }}
                  >
                    <Text style={{ fontSize: Typography.base, color: isDark ? "rgba(255,255,255,0.3)" : c.textMuted }}>
                      {authUser?.phone || phone || t("common.notSet")}
                    </Text>
                  </View>
                </View>
                <NeoInput label={t("profile.emergencyContactName")} value={form.emergency_contact_name || ""} onChangeText={(val) => setForm({ ...form, emergency_contact_name: val })} placeholder={t("profile.placeholderContactName")} />
                <NeoInput label={t("profile.emergencyContactPhone")} value={form.emergency_contact_phone || ""} onChangeText={(val) => setForm({ ...form, emergency_contact_phone: val })} placeholder={t("profile.placeholderContactPhone")} keyboardType="phone-pad" />
                <NeoInput label={t("profile.city")} value={form.city || ""} onChangeText={(val) => setForm({ ...form, city: val })} placeholder={t("profile.placeholderCity")} />
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <ProfileField label={t("profile.phone")} value={authUser?.phone || phone} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.emergencyContact")} value={emergency_contact_name} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.emergencyPhone")} value={emergency_contact_phone} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
                <ProfileField label={t("profile.city")} value={city} colors={c} notSetLabel={t("common.notSet")} isDark={isDark} />
              </View>
            )}
          </SectionCard>

          {/* App Preferences */}
          <SectionCard
            title={t("profile.appPrefs")}
            icon="settings-outline"
            iconColor="#FBBF24"
            isDark={isDark}
            colors={c}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>
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
            <View
              style={{
                height: 1,
                backgroundColor: isDark ? "#1A1A1A" : c.border,
                marginVertical: 12,
              }}
            />
            <NeoDropdown
              label={t("profile.language")}
              value={currentLanguageLabel}
              options={LANGUAGE_OPTIONS.map((o) => o.label)}
              onSelect={handleLanguageSelect}
            />
          </SectionCard>

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

function StatPill({
  label,
  value,
  isDark,
  color,
}: {
  label: string;
  value: string;
  isDark: boolean;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: R.lg,
        backgroundColor: isDark ? "#111111" : "#F7F8FA",
        borderWidth: 1,
        borderColor: isDark ? "#1E1E1E" : "#E8ECF2",
      }}
    >
      <Text style={{ fontSize: Typography.base + 2, fontWeight: "700", color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.3)" : "#A0AABA", marginTop: 2, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}

function ProfileField({
  label,
  value,
  colors,
  notSetLabel,
  isDark,
}: {
  label: string;
  value: string | null | undefined;
  colors: typeof Colors.light;
  notSetLabel: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 40,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: isDark ? "#0D0D0D" : "#F7F8FA",
        borderRadius: R.md,
        borderWidth: 1,
        borderColor: isDark ? "#1A1A1A" : colors.border,
      }}
    >
      <Text style={{ fontSize: Typography.sm, color: isDark ? "rgba(255,255,255,0.4)" : colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: Typography.sm, fontWeight: "600", color: value ? colors.textPrimary : (isDark ? "rgba(255,255,255,0.2)" : colors.textMuted), flex: 1, textAlign: "right" }}>
        {value || notSetLabel}
      </Text>
    </View>
  );
}
