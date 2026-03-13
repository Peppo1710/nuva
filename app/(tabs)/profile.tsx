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
      <Text style={{ fontSize: 40, fontWeight: "700", color: "#FFFFFF" }}>
        {initials}
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

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
    loading,
    saving,
    fetchProfile,
    saveProfile,
    setTheme,
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.navy} />
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginTop: 16 }}>
          Loading your profile...
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
              Profile
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
                  Edit
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
            {username || "Your Name"}
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
              Personal Information
            </Text>

            {editing ? (
              <View style={{ gap: 16 }}>
                <NeoInput
                  label="Full Name"
                  value={form.username || ""}
                  onChangeText={(t) => setForm({ ...form, username: t })}
                  placeholder="Your full name"
                />
                <NeoInput
                  label="Age"
                  value={form.age?.toString() || ""}
                  onChangeText={(t) =>
                    setForm({
                      ...form,
                      age: t ? parseInt(t, 10) || null : null,
                    })
                  }
                  placeholder="Your age"
                  keyboardType="number-pad"
                />
                <NeoDropdown
                  label="Gender"
                  value={form.gender || null}
                  options={GENDER_OPTIONS}
                  onSelect={(v) => setForm({ ...form, gender: v })}
                  placeholder="Select gender"
                />
                <NeoDropdown
                  label="Blood Group"
                  value={form.blood_group || null}
                  options={BLOOD_GROUP_OPTIONS}
                  onSelect={(v) => setForm({ ...form, blood_group: v })}
                  placeholder="Select blood group"
                />
                <NeoInput
                  label="Weight (kg)"
                  value={form.weight_kg?.toString() || ""}
                  onChangeText={(t) =>
                    setForm({
                      ...form,
                      weight_kg: t ? parseFloat(t) || null : null,
                    })
                  }
                  placeholder="e.g. 70"
                  keyboardType="decimal-pad"
                />
                <NeoInput
                  label="Height (cm)"
                  value={form.height_cm?.toString() || ""}
                  onChangeText={(t) =>
                    setForm({
                      ...form,
                      height_cm: t ? parseFloat(t) || null : null,
                    })
                  }
                  placeholder="e.g. 165"
                  keyboardType="decimal-pad"
                />
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <ProfileField label="Full Name" value={username} colors={c} />
                <ProfileField label="Age" value={age?.toString()} colors={c} />
                <ProfileField label="Gender" value={gender} colors={c} />
                <ProfileField label="Blood Group" value={blood_group} colors={c} />
                <ProfileField
                  label="Weight"
                  value={weight_kg ? `${weight_kg} kg` : null}
                  colors={c}
                />
                <ProfileField
                  label="Height"
                  value={height_cm ? `${height_cm} cm` : null}
                  colors={c}
                />
              </View>
            )}
          </NeoCard>

          <NeoCard style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 16 }}>
              Contact Information
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
                    Phone Number
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
                      {authUser?.phone || phone || "Not set"}
                    </Text>
                  </View>
                </View>
                <NeoInput
                  label="Emergency Contact Name"
                  value={form.emergency_contact_name || ""}
                  onChangeText={(t) =>
                    setForm({ ...form, emergency_contact_name: t })
                  }
                  placeholder="Contact person name"
                />
                <NeoInput
                  label="Emergency Contact Phone"
                  value={form.emergency_contact_phone || ""}
                  onChangeText={(t) =>
                    setForm({ ...form, emergency_contact_phone: t })
                  }
                  placeholder="Contact phone number"
                  keyboardType="phone-pad"
                />
                <NeoInput
                  label="City"
                  value={form.city || ""}
                  onChangeText={(t) => setForm({ ...form, city: t })}
                  placeholder="Your city"
                />
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <ProfileField
                  label="Phone Number"
                  value={authUser?.phone || phone}
                  colors={c}
                />
                <ProfileField
                  label="Emergency Contact"
                  value={emergency_contact_name}
                  colors={c}
                />
                <ProfileField
                  label="Emergency Phone"
                  value={emergency_contact_phone}
                  colors={c}
                />
                <ProfileField label="City" value={city} colors={c} />
              </View>
            )}
          </NeoCard>

          <NeoCard style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginBottom: 16 }}>
              App Preferences
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 }}>
              <Text style={{ fontSize: Typography.base, color: c.textPrimary }}>
                Theme
              </Text>
              <NeoToggle
                value={theme_preference === "dark"}
                onValueChange={handleThemeToggle}
                leftLabel="Light"
                rightLabel="Dark"
              />
            </View>
          </NeoCard>

          {editing && (
            <View style={{ gap: 12, marginBottom: 16 }}>
              <NeoButton
                title={saving ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                loading={saving}
                disabled={saving}
              />
              <NeoButton
                title="Cancel"
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
}: {
  label: string;
  value: string | null | undefined;
  colors: typeof Colors.light;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
      <Text style={{ fontSize: Typography.base, color: colors.textSecondary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: Typography.base, fontWeight: "500", color: colors.textPrimary, flex: 1, textAlign: "right" }}>
        {value || "Not set"}
      </Text>
    </View>
  );
}
