import { Redirect, Tabs } from "expo-router";
import { Bot, LayoutDashboard, Crown } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { session, isLoading } = useAuth();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slateink-50 dark:bg-slateink-950">
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#14b8a6",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDark ? "#020617" : "#ffffff",
          borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: "AI Assistant",
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="paywall"
        options={{
          title: "Paywall",
          tabBarIcon: ({ color, size }) => <Crown color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
