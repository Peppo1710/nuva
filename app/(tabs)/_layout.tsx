import { Tabs } from "expo-router";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

function TabIcon({
  icon,
  focused,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return (
    <View
      className={`items-center justify-center w-full h-full ${
        focused ? "border-t-[3px] border-primary" : "border-t-[3px] border-transparent"
      }`}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarActiveTintColor: "#0F766E",
        tabBarInactiveTintColor: isDark ? "#A1A1AA" : "#9CA3AF",
        tabBarStyle: {
          height: 72,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={focused ? "home" : "home-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={focused ? "person" : "person-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medical"
        options={{
          title: "Medical",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={focused ? "medkit" : "medkit-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={focused ? "chatbubble" : "chatbubble-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Reminders",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={focused ? "alarm" : "alarm-outline"} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
