import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/authStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoCard } from "@/components/ui/NeoCard";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

export default function PhoneScreen() {
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signInWithOtp, loading } = useAuthStore();
  const router = useRouter();

  const fullPhone = `${countryCode}${phoneNumber}`;

  const handleSendOtp = async () => {
    setError(null);

    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    const { error: otpError } = await signInWithOtp(fullPhone);

    if (otpError) {
      setError(otpError);
      return;
    }

    router.push({
      pathname: "/onboarding/verify",
      params: { phone: fullPhone },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32, justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 32, fontWeight: "700", color: c.textPrimary, marginBottom: 8 }}>
                MediAssist
              </Text>
              <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginBottom: 48 }}>
                Your medication companion
              </Text>

              <NeoCard style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 8 }}>
                  Welcome!
                </Text>
                <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginBottom: 24 }}>
                  Enter your phone number to get started. We'll send you a
                  verification code.
                </Text>

                <View style={{ flexDirection: "row", gap: 16, marginBottom: 24, width: "100%" }}>
                  <NeoInput
                    value={countryCode}
                    onChangeText={setCountryCode}
                    keyboardType="phone-pad"
                    containerClassName="flex-[0.25]"
                    style={{ textAlign: "center", fontWeight: "500" }}
                    maxLength={4}
                  />
                  <NeoInput
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text.replace(/[^0-9]/g, ""));
                      setError(null);
                    }}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    containerClassName="flex-[0.75]"
                    maxLength={10}
                    autoFocus
                  />
                </View>

                {error && (
                  <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500", marginBottom: 16 }}>
                    {error}
                  </Text>
                )}
              </NeoCard>
            </View>

            <NeoButton
              title="Send Verification Code"
              onPress={handleSendOtp}
              loading={loading}
              disabled={phoneNumber.length < 10}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
