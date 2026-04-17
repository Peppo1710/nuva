import { useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Animated } from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/lib/useT";

function TabIcon({
  icon,
  focused,
  activeColor,
  inactiveColor,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  isDark: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.08 : 1,
        stiffness: 300,
        damping: 18,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  const pillBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "rgba(0,0,0,0)",
      isDark ? "rgba(61,214,163,0.12)" : "rgba(26,39,68,0.08)",
    ],
  });

  return (
    <View style={{ width: 48, height: 32, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          position: "absolute",
          width: 44,
          height: 28,
          borderRadius: 14,
          backgroundColor: pillBg,
        }}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={icon}
          size={22}
          color={focused ? activeColor : inactiveColor}
        />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const activeColor = isDark ? "#3DD6A3" : c.navy;
  const inactiveColor = isDark ? "rgba(255,255,255,0.3)" : c.textMuted;
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 4,
          letterSpacing: 0.2,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          height: 60 + insets.bottom,
          borderTopWidth: 0,
          backgroundColor: isDark ? "#080808" : c.surface,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: isDark ? 0.5 : 0.08,
          shadowRadius: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "home" : "home-outline"}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "person" : "person-outline"}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medical"
        options={{
          title: t("tabs.medical"),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "medkit" : "medkit-outline"}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.chat"),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "chatbubble" : "chatbubble-outline"}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t("tabs.reminders"),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "alarm" : "alarm-outline"}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              isDark={isDark}
            />
          ),
        }}
      />
    </Tabs>
  );
}
