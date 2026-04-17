import { Modal, View, Text, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { Typography, R, S } from "@/constants/typography";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#0F0F0F" : c.surface,
            borderRadius: R.xl,
            padding: S.xl,
            borderWidth: 1,
            borderColor: isDark ? "#1A1A1A" : c.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.5,
            shadowRadius: 32,
            elevation: 20,
          }}
        >
          {/* Accent line */}
          <View style={{ width: 32, height: 3, borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
            <LinearGradient
              colors={destructive ? ["#F87171", "#EF4444"] : ["#3DD6A3", "#A594F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>

          <Text
            style={{
              fontSize: Typography.md,
              fontWeight: "700",
              color: c.textPrimary,
              marginBottom: 10,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: Typography.base,
              color: c.textSecondary,
              marginBottom: 24,
              lineHeight: 26,
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                minHeight: 52,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: R.lg,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                borderWidth: 1,
                borderColor: isDark ? "#222" : c.border,
              }}
            >
              <Text
                style={{
                  fontSize: Typography.base,
                  fontWeight: "600",
                  color: c.textSecondary,
                }}
              >
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: R.lg,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={destructive ? ["#F87171", "#EF4444"] : ["#3DD6A3", "#A594F9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: Typography.base,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  {confirmText}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
