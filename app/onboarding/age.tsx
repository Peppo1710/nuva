import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  type ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

const MIN_AGE = 40;
const MAX_AGE = 100;
const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);
const ITEM_HEIGHT = 64;
const VISIBLE_ITEMS = 5;

export default function AgeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { age, setProfile } = useProfileStore();
  const [selectedAge, setSelectedAge] = useState(age ?? 65);
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledInitial = useRef(false);

  const initialIndex = selectedAge - MIN_AGE;

  useEffect(() => {
    if (!hasScrolledInitial.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialIndex * ITEM_HEIGHT,
          animated: false,
        });
        hasScrolledInitial.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialIndex]);

  const handleContinue = () => {
    setProfile({ age: selectedAge });
    router.push("/onboarding/goal");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const middleIndex = Math.floor(viewableItems.length / 2);
        const middleItem = viewableItems[middleIndex];
        if (middleItem?.item != null) {
          setSelectedAge(middleItem.item as number);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderAgeItem = ({ item }: { item: number }) => {
    const isSelected = item === selectedAge;
    return (
      <View
        style={{
          height: ITEM_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSelected
            ? (colorScheme === "dark" ? "rgba(58,81,160,0.12)" : "rgba(26,39,68,0.06)")
            : "transparent",
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: isSelected ? 32 : 22,
            color: isSelected ? c.navy : c.textMuted,
          }}
        >
          {item}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
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

        <ProgressBar currentStep={2} totalSteps={3} />

        <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
          How old are you?
        </Text>
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginBottom: 32 }}>
          This helps us personalize your experience.
        </Text>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: "100%" }}>
            <View
              style={{
                borderRadius: R.xl,
                borderWidth: 0.5,
                borderColor: c.border,
                backgroundColor: c.surface,
                overflow: "hidden",
                width: "100%",
                height: ITEM_HEIGHT * VISIBLE_ITEMS,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 128,
                  zIndex: 10,
                  backgroundColor: colorScheme === "dark"
                    ? "rgba(13,19,33,0.7)"
                    : "rgba(247,248,250,0.7)",
                }}
                pointerEvents="none"
              />

              <View
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  zIndex: 10,
                  borderTopWidth: 2,
                  borderBottomWidth: 2,
                  borderColor: c.navy,
                  top: ITEM_HEIGHT * 2,
                  height: ITEM_HEIGHT,
                }}
                pointerEvents="none"
              />

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 128,
                  zIndex: 10,
                  backgroundColor: colorScheme === "dark"
                    ? "rgba(13,19,33,0.7)"
                    : "rgba(247,248,250,0.7)",
                }}
                pointerEvents="none"
              />

              <FlatList
                ref={flatListRef}
                data={AGES}
                keyExtractor={(item) => item.toString()}
                renderItem={renderAgeItem}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={{
                  paddingTop: ITEM_HEIGHT * 2,
                  paddingBottom: ITEM_HEIGHT * 2,
                }}
              />
            </View>
          </View>

          <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, marginTop: 24 }}>
            {selectedAge} years old
          </Text>
        </View>

        <NeoButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
