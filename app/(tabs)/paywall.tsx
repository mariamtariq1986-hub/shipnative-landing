import { Check, Crown, RotateCcw } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

type Plan = "monthly" | "annual";

const FEATURES = [
  "Unlimited AI conversations",
  "Priority Gemini model access",
  "Saved prompt library sync",
  "Early access to new agents",
  "Email support within 24h",
];

export default function PaywallScreen() {
  const [plan, setPlan] = useState<Plan>("annual");
  const [purchasing, setPurchasing] = useState(false);

  const pricing = useMemo(
    () =>
      plan === "monthly"
        ? { price: "$9.99", period: "/mo", savings: null }
        : { price: "$79.99", period: "/yr", savings: "Save ~33%" },
    [plan],
  );

  const onUpgrade = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      Alert.alert(
        "Upgrade ready",
        `Selected ${plan === "monthly" ? "Monthly ($9.99/mo)" : "Annual ($79.99/yr)"}. Wire expo-in-app-purchases or RevenueCat when you are ready for production IAP.`,
      );
    }, 650);
  };

  const onRestore = () => {
    Alert.alert(
      "Restore purchases",
      "No active subscription found on this device. Connect a real IAP provider to restore entitlements.",
    );
  };

  return (
    <Screen>
      <View className="mb-6 items-center pt-2">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/15">
          <Crown size={30} color="#14b8a6" />
        </View>
        <Text className="text-3xl font-bold text-slateink-900 dark:text-white">
          Go Premium
        </Text>
        <Text className="mt-2 text-center text-base text-slateink-500 dark:text-slateink-400">
          Unlock the full AI workspace with higher limits and priority access.
        </Text>
      </View>

      <View className="mb-5 flex-row rounded-2xl border border-slateink-200 bg-slateink-100 p-1 dark:border-slateink-800 dark:bg-slateink-900">
        {(["monthly", "annual"] as const).map((option) => {
          const active = plan === option;
          return (
            <Pressable
              key={option}
              onPress={() => setPlan(option)}
              className={`flex-1 items-center rounded-xl py-3 ${
                active ? "bg-white dark:bg-slateink-800" : ""
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active
                    ? "text-slateink-900 dark:text-white"
                    : "text-slateink-500"
                }`}
              >
                {option === "monthly" ? "Monthly" : "Annual"}
              </Text>
              {option === "annual" ? (
                <Text className="mt-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                  Best value
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View className="mb-5 rounded-3xl border border-brand-500/40 bg-white p-5 dark:border-brand-500/30 dark:bg-slateink-900">
        <View className="flex-row items-end gap-1">
          <Text className="text-4xl font-bold text-slateink-900 dark:text-white">
            {pricing.price}
          </Text>
          <Text className="mb-1 text-base text-slateink-500 dark:text-slateink-400">
            {pricing.period}
          </Text>
        </View>
        {pricing.savings ? (
          <Text className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            {pricing.savings} vs paying monthly
          </Text>
        ) : (
          <Text className="mt-2 text-sm text-slateink-500 dark:text-slateink-400">
            Flexible month-to-month billing
          </Text>
        )}

        <View className="mt-5 gap-3">
          {FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-center gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-500/15">
                <Check size={16} color="#14b8a6" />
              </View>
              <Text className="flex-1 text-[15px] text-slateink-700 dark:text-slateink-200">
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        label="Upgrade Now"
        onPress={onUpgrade}
        loading={purchasing}
        className="mb-3"
      />
      <Button
        label="Restore Purchases"
        variant="ghost"
        onPress={onRestore}
        className="flex-row"
      />

      <View className="mt-2 flex-row items-center justify-center gap-2">
        <RotateCcw size={14} color="#94a3b8" />
        <Text className="text-xs text-slateink-400">
          Cancel anytime. Local stub until IAP is wired.
        </Text>
      </View>
    </Screen>
  );
}
