import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";

interface NeoDropdownProps {
  label?: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const NeoDropdown = React.memo(function NeoDropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select...",
  error,
}: NeoDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (option: string) => {
      onSelect(option);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <View className="w-full">
      {label && (
        <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mb-2">
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-[56px] w-full px-4 justify-center rounded-xl border-[1px] ${
          error ? "border-error" : "border-gray-200 dark:border-gray-700"
        } bg-white dark:bg-surface-dark`}
      >
        <Text
          className={`text-[18px] ${
            value ? "text-navy dark:text-navy-dark font-medium" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-[16px] text-error mt-1 font-medium">
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-center px-6"
          onPress={() => setOpen(false)}
        >
          <View className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft max-h-[400px] overflow-hidden p-2">
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className={`min-h-[56px] px-4 justify-center border-b border-gray-200 dark:border-gray-700 ${
                    item === value ? "bg-primary/10" : ""
                  }`}
                >
                  <Text
                    className={`text-[18px] ${
                      item === value
                        ? "font-bold text-primary"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});
