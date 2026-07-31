import { router } from "expo-router";
import {
  Bot,
  ChartNoAxesCombined,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const stats = [
  { label: "Prompts today", value: "12", hint: "+3 vs yesterday" },
  { label: "Tokens used", value: "48.2k", hint: "Within free tier" },
  { label: "Saved drafts", value: "7", hint: "Ready to reuse" },
];

const actions = [
  {
    title: "Open AI Assistant",
    subtitle: "Chat, stream, and iterate on ideas",
    href: "/(tabs)/ai-assistant" as const,
    icon: Bot,
  },
  {
    title: "Upgrade plan",
    subtitle: "Unlock higher limits & priority models",
    href: "/(tabs)/paywall" as const,
    icon: Zap,
  },
];

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Creator";

  return (
    <Screen>
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Dashboard
          </Text>
          <Text className="mt-2 text-3xl font-bold text-slateink-900 dark:text-white">
            Welcome back, {name}
          </Text>
          <Text className="mt-2 text-base text-slateink-500 dark:text-slateink-400">
            Your AI workspace is ready. Pick up where you left off.
          </Text>
        </View>
        <Pressable
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
          className="h-11 w-11 items-center justify-center rounded-2xl border border-slateink-200 bg-white dark:border-slateink-700 dark:bg-slateink-900"
        >
          {isDark ? (
            <Sun size={20} color="#f8fafc" />
          ) : (
            <Moon size={20} color="#0f172a" />
          )}
        </Pressable>
      </View>

      <View className="mb-5 overflow-hidden rounded-3xl bg-slateink-900 p-5 dark:bg-brand-950">
        <View className="mb-3 flex-row items-center gap-2">
          <Sparkles size={18} color="#2dd4bf" />
          <Text className="text-sm font-semibold text-brand-300">
            Daily pulse
          </Text>
        </View>
        <Text className="text-xl font-semibold text-white">
          Ship faster with a focused AI loop
        </Text>
        <Text className="mt-2 text-sm leading-5 text-slateink-300">
          Draft, refine, and monetize from one starter kit built for Expo
          production apps.
        </Text>
      </View>

      <View className="mb-6 flex-row gap-3">
        {stats.map((stat) => (
          <View
            key={stat.label}
            className="flex-1 rounded-3xl border border-slateink-200 bg-white p-4 dark:border-slateink-800 dark:bg-slateink-900"
          >
            <ChartNoAxesCombined size={18} color="#14b8a6" />
            <Text className="mt-3 text-2xl font-bold text-slateink-900 dark:text-white">
              {stat.value}
            </Text>
            <Text className="mt-1 text-xs font-medium text-slateink-500 dark:text-slateink-400">
              {stat.label}
            </Text>
            <Text className="mt-2 text-[11px] text-brand-600 dark:text-brand-400">
              {stat.hint}
            </Text>
          </View>
        ))}
      </View>

      <Text className="mb-3 text-lg font-semibold text-slateink-900 dark:text-white">
        Quick actions
      </Text>
      <View className="gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.href)}
              className="flex-row items-center gap-4 rounded-3xl border border-slateink-200 bg-white p-4 active:opacity-90 dark:border-slateink-800 dark:bg-slateink-900"
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                <Icon size={22} color="#14b8a6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slateink-900 dark:text-white">
                  {action.title}
                </Text>
                <Text className="mt-1 text-sm text-slateink-500 dark:text-slateink-400">
                  {action.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => void signOut()} className="mt-8 items-center py-3">
        <Text className="text-sm font-medium text-slateink-400">Sign out</Text>
      </Pressable>
    </Screen>
  );
}
