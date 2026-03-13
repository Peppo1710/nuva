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
import { useAuthStore } from "@/store/authStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoCard } from "@/components/ui/NeoCard";

export default function PhoneScreen() {
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
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16 pb-8 justify-between">
            <View>
              <Text className="text-[32px] font-bold text-navy dark:text-navy-dark mb-2">
                MediAssist
              </Text>
              <Text className="text-[18px] text-gray-500 dark:text-gray-400 mb-12">
                Your medication companion
              </Text>

              <NeoCard className="mb-8">
                <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-2">
                  Welcome!
                </Text>
                <Text className="text-[18px] text-gray-600 dark:text-gray-400 mb-6">
                  Enter your phone number to get started. We'll send you a
                  verification code.
                </Text>

                <View className="flex-row gap-4 mb-6 w-full">
                  <NeoInput
                    value={countryCode}
                    onChangeText={setCountryCode}
                    keyboardType="phone-pad"
                    containerClassName="flex-[0.25]"
                    className="text-center font-medium"
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
                  <Text className="text-[18px] text-error font-medium mb-4">
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
