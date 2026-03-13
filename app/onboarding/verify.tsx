import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { NeoCard } from "@/components/ui/NeoCard";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyOtp, signInWithOtp, loading } = useAuthStore();
  const { checkOnboardingStatus } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!phone) return;
      setError(null);

      const { error: verifyError } = await verifyOtp(phone, code);

      if (verifyError) {
        setError(verifyError);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      const isOnboarded = await checkOnboardingStatus();
      if (isOnboarded) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/onboarding/welcome");
      }
    },
    [phone, verifyOtp, checkOnboardingStatus, router]
  );

  const handleChangeText = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];

    if (text.length > 1) {
      const digits = text.split("").slice(0, OTP_LENGTH - index);
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      const code = newOtp.join("");
      if (code.length === OTP_LENGTH && newOtp.every((d) => d !== "")) {
        handleVerify(code);
      }
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newOtp.join("");
    if (code.length === OTP_LENGTH && newOtp.every((d) => d !== "")) {
      handleVerify(code);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(""));
    await signInWithOtp(phone);
    setResendTimer(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="self-start mb-6 min-w-[56px] min-h-[56px] items-center justify-center
              rounded-xl border-[1px] border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-surface-dark shadow-sm"
          >
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark">
              ← Back
            </Text>
          </Pressable>

          <NeoCard className="mb-8">
            <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-2">
              Enter Verification Code
            </Text>
            <Text className="text-[18px] text-gray-600 dark:text-gray-400 mb-8">
              We sent a 6-digit code to{"\n"}
              <Text className="font-bold text-navy dark:text-navy-dark">
                {phone}
              </Text>
            </Text>

            <View className="flex-row justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  className={`
                    flex-1 min-h-[64px] text-center text-[28px] font-bold
                    rounded-xl border-[1px] ${error ? "border-error bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-700"}
                    bg-surface dark:bg-surface-dark
                    text-navy dark:text-navy-dark
                  `}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error && (
              <Text className="text-[18px] text-error font-medium text-center mb-4">
                {error}
              </Text>
            )}

            {loading && (
              <Text className="text-[18px] text-primary font-medium text-center mb-4">
                Verifying...
              </Text>
            )}
          </NeoCard>

          <View className="items-center">
            {resendTimer > 0 ? (
              <Text className="text-[18px] text-gray-500 dark:text-gray-400">
                Resend code in{" "}
                <Text className="font-bold text-navy dark:text-navy-dark">
                  {resendTimer}s
                </Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend} className="min-h-[56px] justify-center px-6">
                <Text className="text-[20px] font-bold text-primary underline">
                  Resend Code
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
