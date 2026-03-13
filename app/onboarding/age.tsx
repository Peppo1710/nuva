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
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

const MIN_AGE = 40;
const MAX_AGE = 100;
const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);
const ITEM_HEIGHT = 64;
const VISIBLE_ITEMS = 5;

export default function AgeScreen() {
  const router = useRouter();
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
        className={`h-[64px] items-center justify-center ${
          isSelected ? "bg-primary/10" : ""
        }`}
      >
        <Text
          className={`font-bold ${
            isSelected
              ? "text-[32px] text-primary"
              : "text-[22px] text-gray-400 dark:text-gray-500"
          }`}
        >
          {item}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-1 px-6 pt-6 pb-8">
        <Pressable
          onPress={() => router.back()}
          className="self-start mb-6 min-w-[56px] min-h-[56px] items-center justify-center
            rounded-xl border-[1px] border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-surface-dark shadow-sm"
        >
          <Text className="text-[18px] font-bold text-navy dark:text-navy-dark">
            ← Back
          </Text>
        </Pressable>

        <ProgressBar currentStep={2} totalSteps={3} />

        <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-3">
          How old are you?
        </Text>
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mb-8">
          This helps us personalize your experience.
        </Text>

        <View className="flex-1 items-center justify-center">
          <View className="w-full">
            <View
              className="rounded-3xl border-[1px] border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark overflow-hidden w-full shadow-soft"
              style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
            >
              <View
                className="absolute top-0 left-0 right-0 h-[128px] z-10 bg-white/70 dark:bg-background-dark/70"
                pointerEvents="none"
              />

              <View
                className="absolute left-4 right-4 z-10 border-t-2 border-b-2 border-primary"
                style={{
                  top: ITEM_HEIGHT * 2,
                  height: ITEM_HEIGHT,
                }}
                pointerEvents="none"
              />

              <View
                className="absolute bottom-0 left-0 right-0 h-[128px] z-10 bg-white/70 dark:bg-background-dark/70"
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

          <Text className="text-[20px] font-bold text-navy dark:text-navy-dark mt-6">
            {selectedAge} years old
          </Text>
        </View>

        <NeoButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
