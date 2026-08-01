import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  checkPremiumEntitlement,
  getPlanPricing,
  identifyPurchasesUser,
  initPurchases,
  isPurchasesConfigured,
  purchasePackage,
  restorePurchases,
  type PlanId,
  type PlanPricing,
} from "@/lib/purchases";

const DEMO_PREMIUM_KEY = "demo-premium-entitlement";

type PremiumContextValue = {
  isPremium: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  offerings: { monthly: PlanPricing; annual: PlanPricing } | null;
  packages: { monthly: PlanPricing; annual: PlanPricing } | null;
  purchaseMonthly: () => Promise<{ error?: string; cancelled?: boolean }>;
  purchaseAnnual: () => Promise<{ error?: string; cancelled?: boolean }>;
  restore: () => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(
  undefined,
);

async function readDemoPremium(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(DEMO_PREMIUM_KEY);
  return stored === "true";
}

async function writeDemoPremium(value: boolean): Promise<void> {
  if (value) {
    await AsyncStorage.setItem(DEMO_PREMIUM_KEY, "true");
  } else {
    await AsyncStorage.removeItem(DEMO_PREMIUM_KEY);
  }
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isPurchasesConfigured());
  const [offerings, setOfferings] = useState<{
    monthly: PlanPricing;
    annual: PlanPricing;
  } | null>(null);

  const refresh = useCallback(async () => {
    const pricing = await getPlanPricing();
    setOfferings(pricing);

    if (isDemoMode) {
      setIsPremium(await readDemoPremium());
      return;
    }

    setIsPremium(await checkPremiumEntitlement());
  }, [isDemoMode]);

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;

    (async () => {
      setIsLoading(true);
      try {
        const ready = await initPurchases(user?.id);
        if (!mounted) return;

        setIsDemoMode(!ready);

        if (ready && user?.id) {
          await identifyPurchasesUser(user.id);
        }

        const pricing = await getPlanPricing();
        if (!mounted) return;
        setOfferings(pricing);

        if (!ready) {
          setIsPremium(await readDemoPremium());
        } else {
          setIsPremium(await checkPremiumEntitlement());
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user?.id]);

  const purchasePlan = useCallback(
    async (
      plan: PlanId,
    ): Promise<{ error?: string; cancelled?: boolean }> => {
      if (isDemoMode) {
        await writeDemoPremium(true);
        setIsPremium(true);
        return {};
      }

      const pkg =
        plan === "monthly" ? offerings?.monthly.rcPackage : offerings?.annual.rcPackage;

      if (!pkg) {
        return {
          error:
            "No store package found for this plan. Check your RevenueCat offering (default) includes monthly and annual packages.",
        };
      }

      const result = await purchasePackage(pkg);
      if (result.cancelled) return { cancelled: true };
      if (!result.success) {
        return { error: result.error ?? "Purchase failed." };
      }

      setIsPremium(result.isPremium);
      if (!result.isPremium) {
        return {
          error:
            "Purchase completed but the premium entitlement is inactive. Confirm EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID matches your RevenueCat entitlement.",
        };
      }
      return {};
    },
    [isDemoMode, offerings],
  );

  const purchaseMonthly = useCallback(
    () => purchasePlan("monthly"),
    [purchasePlan],
  );

  const purchaseAnnual = useCallback(
    () => purchasePlan("annual"),
    [purchasePlan],
  );

  const restore = useCallback(async (): Promise<{ error?: string }> => {
    if (isDemoMode) {
      const demoPremium = await readDemoPremium();
      setIsPremium(demoPremium);
      if (!demoPremium) {
        return {
          error:
            "No demo Premium flag found. Tap Upgrade Now to simulate a purchase.",
        };
      }
      return {};
    }

    const result = await restorePurchases();
    setIsPremium(result.isPremium);
    if (!result.isPremium) {
      return {
        error: result.error ?? "No active subscription found.",
      };
    }
    return {};
  }, [isDemoMode]);

  const value = useMemo(
    () => ({
      isPremium,
      isLoading,
      isDemoMode,
      offerings,
      packages: offerings,
      purchaseMonthly,
      purchaseAnnual,
      restore,
      refresh,
    }),
    [
      isPremium,
      isLoading,
      isDemoMode,
      offerings,
      purchaseMonthly,
      purchaseAnnual,
      restore,
      refresh,
    ],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return ctx;
}
