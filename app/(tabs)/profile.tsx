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
import { useProfileStore, UserProfile } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoDropdown } from "@/components/ui/NeoDropdown";
import { NeoToggle } from "@/components/ui/NeoToggle";

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
}: {
  username: string | null;
  onPress?: () => void;
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
      className="w-[120px] h-[120px] rounded-full border-[1px] border-gray-200 dark:border-gray-800 bg-primary items-center justify-center self-center shadow-soft"
    >
      <Text className="text-[40px] font-bold text-white">{initials}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
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
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-4">
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[28px] font-bold text-navy dark:text-navy-dark">
              Profile
            </Text>
            {!editing && (
              <Pressable
                onPress={startEditing}
                className="min-h-[44px] min-w-[100px] rounded-full border-[1px] border-primary dark:border-primary-dark bg-primary/10 items-center justify-center px-4"
              >
                <Text className="text-[16px] font-bold text-primary dark:text-primary-dark">
                  Edit
                </Text>
              </Pressable>
            )}
          </View>

          <Avatar username={username} />
          <Text className="text-[20px] font-bold text-navy dark:text-navy-dark text-center mt-3 mb-1">
            {username || "Your Name"}
          </Text>
          <Text className="text-[18px] text-gray-500 dark:text-gray-400 text-center mb-6">
            {authUser?.phone || phone || ""}
          </Text>

          {saveError && (
            <View className="mb-4 p-4 border-2 border-error bg-error/10">
              <Text className="text-[18px] text-error font-medium">
                {saveError}
              </Text>
            </View>
          )}

          <NeoCard className="mb-6">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark mb-4">
              Personal Information
            </Text>

            {editing ? (
              <View className="gap-4">
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
              <View className="gap-3">
                <ProfileField label="Full Name" value={username} />
                <ProfileField label="Age" value={age?.toString()} />
                <ProfileField label="Gender" value={gender} />
                <ProfileField label="Blood Group" value={blood_group} />
                <ProfileField
                  label="Weight"
                  value={weight_kg ? `${weight_kg} kg` : null}
                />
                <ProfileField
                  label="Height"
                  value={height_cm ? `${height_cm} cm` : null}
                />
              </View>
            )}
          </NeoCard>

          <NeoCard className="mb-6">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark mb-4">
              Contact Information
            </Text>

            {editing ? (
              <View className="gap-4">
                <View>
                  <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mb-2">
                    Phone Number
                  </Text>
                  <View className="min-h-[56px] w-full px-4 justify-center border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    <Text className="text-[18px] text-gray-500 dark:text-gray-400">
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
              <View className="gap-3">
                <ProfileField
                  label="Phone Number"
                  value={authUser?.phone || phone}
                />
                <ProfileField
                  label="Emergency Contact"
                  value={emergency_contact_name}
                />
                <ProfileField
                  label="Emergency Phone"
                  value={emergency_contact_phone}
                />
                <ProfileField label="City" value={city} />
              </View>
            )}
          </NeoCard>

          <NeoCard className="mb-6">
            <Text className="text-[22px] font-bold text-navy dark:text-navy-dark mb-4">
              App Preferences
            </Text>
            <View className="flex-row items-center justify-between min-h-[56px]">
              <Text className="text-[18px] text-navy dark:text-navy-dark">
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
            <View className="gap-3 mb-4">
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
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View className="flex-row justify-between items-center min-h-[44px]">
      <Text className="text-[18px] text-gray-500 dark:text-gray-400 flex-1">
        {label}
      </Text>
      <Text className="text-[18px] font-medium text-navy dark:text-navy-dark flex-1 text-right">
        {value || "Not set"}
      </Text>
    </View>
  );
}
