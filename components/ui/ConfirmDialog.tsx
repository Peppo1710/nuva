import { Modal, View, Text, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
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
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: R.lg,
            padding: S.xl,
            borderWidth: 0.5,
            borderColor: c.border,
          }}
        >
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "700",
              color: c.textPrimary,
              marginBottom: 12,
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
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                minHeight: 56,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: R.md,
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: c.navy,
              }}
            >
              <Text
                style={{
                  fontSize: Typography.base,
                  fontWeight: "600",
                  color: c.navy,
                }}
              >
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                minHeight: 56,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: R.md,
                backgroundColor: destructive ? c.danger : c.navy,
              }}
            >
              <Text
                style={{
                  fontSize: Typography.base,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
