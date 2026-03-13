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
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { NeoCard } from "@/components/ui/NeoCard";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={{
              alignSelf: "flex-start",
              marginBottom: 24,
              minWidth: 56,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: R.md,
              borderWidth: 0.5,
              borderColor: c.border,
              paddingHorizontal: 16,
              backgroundColor: c.surface,
            }}
          >
            <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary }}>
              ← Back
            </Text>
          </Pressable>

          <NeoCard style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 8 }}>
              Enter Verification Code
            </Text>
            <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginBottom: 32 }}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ fontWeight: "700", color: c.textPrimary }}>
                {phone}
              </Text>
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 24 }}>
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
                  style={{
                    flex: 1,
                    minHeight: 64,
                    textAlign: "center",
                    fontSize: Typography.xl,
                    fontWeight: "700",
                    borderRadius: R.md,
                    borderWidth: 1,
                    borderColor: error ? c.danger : c.border,
                    backgroundColor: c.surface,
                    color: c.textPrimary,
                  }}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error && (
              <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500", textAlign: "center", marginBottom: 16 }}>
                {error}
              </Text>
            )}

            {loading && (
              <Text style={{ fontSize: Typography.base, color: c.navy, fontWeight: "500", textAlign: "center", marginBottom: 16 }}>
                Verifying...
              </Text>
            )}
          </NeoCard>

          <View style={{ alignItems: "center" }}>
            {resendTimer > 0 ? (
              <Text style={{ fontSize: Typography.base, color: c.textSecondary }}>
                Resend code in{" "}
                <Text style={{ fontWeight: "700", color: c.textPrimary }}>
                  {resendTimer}s
                </Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend} style={{ minHeight: 56, justifyContent: "center", paddingHorizontal: 24 }}>
                <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.navy, textDecorationLine: "underline" }}>
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
