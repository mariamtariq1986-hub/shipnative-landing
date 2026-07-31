import { Link, router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginScreen() {
  const { signIn, isConfigured } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(undefined);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <Screen contentClassName="justify-center">
      <View className="mb-10 items-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/15">
          <Sparkles size={30} color="#14b8a6" />
        </View>
        <Text className="text-3xl font-bold tracking-tight text-slateink-900 dark:text-white">
          Nexus AI
        </Text>
        <Text className="text-center text-base text-slateink-500 dark:text-slateink-400">
          Sign in to unlock your AI workspace
        </Text>
      </View>

      <View className="rounded-3xl border border-slateink-200 bg-white p-6 dark:border-slateink-800 dark:bg-slateink-900">
        <View className="gap-4">
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@company.com"
            value={email}
            onChangeText={setEmail}
            error={error && !email ? "Email is required" : undefined}
          />
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            error={error}
          />

          <Button label="Sign in" onPress={onSubmit} loading={loading} />

          {!isConfigured ? (
            <Text className="text-center text-xs text-slateink-400">
              Demo mode: any email + password (6+ chars) works until Supabase
              env vars are set.
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-1">
        <Text className="text-slateink-500 dark:text-slateink-400">
          New here?
        </Text>
        <Link href="/(auth)/register" className="text-brand-600 dark:text-brand-400">
          <Text
            className="font-semibold"
            style={{ color: isDark ? "#2dd4bf" : "#0d9488" }}
          >
            Create account
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
