import { Link, router } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterScreen() {
  const { signUp, isConfigured } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(undefined);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
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
          <UserPlus size={30} color="#14b8a6" />
        </View>
        <Text className="text-3xl font-bold tracking-tight text-slateink-900 dark:text-white">
          Create account
        </Text>
        <Text className="text-center text-base text-slateink-500 dark:text-slateink-400">
          Start building with the AI starter kit
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
          />
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Confirm password"
            secureTextEntry
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChangeText={setConfirm}
            error={error}
          />

          <Button label="Create account" onPress={onSubmit} loading={loading} />

          {!isConfigured ? (
            <Text className="text-center text-xs text-slateink-400">
              Demo mode active — configure Supabase in .env for real auth.
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-1">
        <Text className="text-slateink-500 dark:text-slateink-400">
          Already have an account?
        </Text>
        <Link href="/(auth)/login">
          <Text
            className="font-semibold"
            style={{ color: isDark ? "#2dd4bf" : "#0d9488" }}
          >
            Sign in
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
