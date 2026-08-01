import { Check, Crown, RotateCcw, Sparkles } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { usePremium } from "@/context/PremiumContext";
import {
  FALLBACK_PRICES,
  isPurchasesConfigured,
  type PlanId,
} from "@/lib/purchases";

const FEATURES = [
  "Unlimited AI conversations",
  "Priority Gemini model access",
  "Saved prompt library sync",
  "Early access to new agents",
  "Email support within 24h",
];

export default function PaywallScreen() {
  const {
    isPremium,
    isLoading,
    isDemoMode,
    offerings,
    purchaseMonthly,
    purchaseAnnual,
    restore,
  } = usePremium();
  const [plan, setPlan] = useState<PlanId>("annual");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const pricing = useMemo(() => {
    const selected =
      plan === "monthly" ? offerings?.monthly : offerings?.annual;
    const price =
      selected?.priceString ??
      (plan === "monthly" ? FALLBACK_PRICES.monthly : FALLBACK_PRICES.annual);
    const period = plan === "monthly" ? "/mo" : "/yr";
    const savings = plan === "annual" ? "Save ~33%" : null;
    return { price, period, savings };
  }, [plan, offerings]);

  const onUpgrade = async () => {
    setPurchasing(true);
    try {
      const result =
        plan === "monthly" ? await purchaseMonthly() : await purchaseAnnual();

      if (result.cancelled) return;

      if (result.error) {
        Alert.alert("Upgrade unavailable", result.error);
        return;
      }

      Alert.alert(
        isDemoMode ? "Demo Premium unlocked" : "You're Premium",
        isDemoMode
          ? "Simulated purchase saved on this device. Add RevenueCat keys and a development build for real App Store / Play Billing."
          : "Thanks — your subscription is active. Enjoy unlimited AI and priority features.",
      );
    } finally {
      setPurchasing(false);
    }
  };

  const onRestore = async () => {
    setRestoring(true);
    try {
      const result = await restore();
      if (result.error) {
        Alert.alert("Restore purchases", result.error);
        return;
      }
      Alert.alert(
        "Purchases restored",
        isDemoMode
          ? "Your demo Premium status was restored from local storage."
          : "Your premium entitlement is active again.",
      );
    } finally {
      setRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator color="#14b8a6" size="large" />
          <Text className="mt-4 text-sm text-slateink-500 dark:text-slateink-400">
            Loading subscription options…
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {isDemoMode ? (
        <View className="mb-4 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3">
          <Text className="text-center text-sm font-medium text-brand-700 dark:text-brand-300">
            {isPurchasesConfigured()
              ? "Demo mode — use a development build for real IAP"
              : "Demo mode — add RevenueCat keys for real IAP"}
          </Text>
        </View>
      ) : null}

      <View className="mb-6 items-center pt-2">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/15">
          <Crown size={30} color="#14b8a6" />
        </View>
        <Text className="text-3xl font-bold text-slateink-900 dark:text-white">
          {isPremium ? "You're Premium" : "Go Premium"}
        </Text>
        <Text className="mt-2 text-center text-base text-slateink-500 dark:text-slateink-400">
          {isPremium
            ? "Unlimited AI, priority models, and early agent access are unlocked."
            : "Monetize your app with store subscriptions — monthly or annual, wired for RevenueCat."}
        </Text>
      </View>

      {isPremium ? (
        <View className="mb-5 flex-row items-center gap-3 rounded-3xl border border-brand-500/40 bg-white p-5 dark:border-brand-500/30 dark:bg-slateink-900">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15">
            <Sparkles size={22} color="#14b8a6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-slateink-900 dark:text-white">
              Premium active
            </Text>
            <Text className="mt-1 text-sm text-slateink-500 dark:text-slateink-400">
              {isDemoMode
                ? "Local demo entitlement — swap in RevenueCat for production."
                : "Managed by RevenueCat + App Store / Play Billing."}
            </Text>
          </View>
        </View>
      ) : (
        <>
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
            onPress={() => void onUpgrade()}
            loading={purchasing}
            className="mb-3"
          />
        </>
      )}

      <Button
        label="Restore Purchases"
        variant="ghost"
        onPress={() => void onRestore()}
        loading={restoring}
        className="flex-row"
      />

      <View className="mt-2 flex-row items-center justify-center gap-2">
        <RotateCcw size={14} color="#94a3b8" />
        <Text className="text-xs text-slateink-400">
          {isDemoMode
            ? "Cancel anytime. Demo purchases stay on this device."
            : "Cancel anytime in App Store or Google Play settings."}
        </Text>
      </View>
    </Screen>
  );
}
