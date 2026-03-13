import { Modal, View, Text, Pressable } from "react-native";

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
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center px-6">
        <View
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft"
        >
          <Text className="text-[24px] font-bold text-navy dark:text-navy-dark mb-3">
            {title}
          </Text>
          <Text className="text-[18px] text-gray-600 dark:text-gray-400 mb-6 leading-[26px]">
            {message}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 min-h-[56px] items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <Text className="text-[18px] font-bold text-navy dark:text-navy-dark">
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 min-h-[56px] items-center justify-center rounded-xl ${
                destructive ? "bg-error" : "bg-primary"
              }`}
            >
              <Text className="text-[18px] font-bold text-white">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
