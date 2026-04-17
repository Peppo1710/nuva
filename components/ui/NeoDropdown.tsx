import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

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
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (option: string) => {
      onSelect(option);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <View style={{ width: "100%" }}>
      {label && (
        <Text
          style={{
            fontSize: Typography.base,
            fontWeight: "600",
            color: c.textPrimary,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          minHeight: 56,
          width: "100%",
          paddingHorizontal: 16,
          justifyContent: "center",
          borderRadius: R.md,
          borderWidth: 1,
          borderColor: error ? c.danger : c.border,
          backgroundColor: c.surface,
        }}
      >
        <Text
          style={{
            fontSize: Typography.base,
            color: value ? c.textPrimary : c.textMuted,
            fontWeight: value ? "500" : "400",
          }}
        >
          {value || placeholder}
        </Text>
      </Pressable>
      {error && (
        <Text
          style={{
            fontSize: Typography.sm,
            color: c.danger,
            marginTop: 4,
            fontWeight: "500",
          }}
        >
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: R.lg,
              maxHeight: 400,
              overflow: "hidden",
              padding: 8,
              borderWidth: 0.5,
              borderColor: c.border,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={{
                    minHeight: 56,
                    paddingHorizontal: 16,
                    justifyContent: "center",
                    borderBottomWidth: 0.5,
                    borderBottomColor: c.border,
                    backgroundColor:
                      item === value
                        ? colorScheme === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(26,39,68,0.06)"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: Typography.base,
                      color:
                        item === value ? c.navy : c.textPrimary,
                      fontWeight: item === value ? "700" : "400",
                    }}
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
