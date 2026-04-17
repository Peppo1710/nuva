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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        stiffness: 300,
        damping: 14,
        useNativeDriver: true,
      }).start();
      Animated.spring(dotScale, {
        toValue: 1,
        stiffness: 300,
        damping: 14,
        useNativeDriver: true,
      }).start();
    } else {
      dotScale.setValue(0);
    }
  }, [focused]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={icon}
          size={24}
          color={focused ? activeColor : inactiveColor}
        />
      </Animated.View>
      <Animated.View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: activeColor,
          marginTop: 4,
          transform: [{ scale: dotScale }],
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const activeColor = isDark ? c.violet : c.navy;
  const inactiveColor = c.textMuted;
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginBottom: 2,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          height: 60 + insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: c.border,
          backgroundColor: c.surface,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 2,
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
            />
          ),
        }}
      />
    </Tabs>
  );
}
