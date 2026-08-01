import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

export type PlanId = "monthly" | "annual";

export type PurchaseOutcome = {
  success: boolean;
  isPremium: boolean;
  cancelled?: boolean;
  error?: string;
};

export type PlanPricing = {
  plan: PlanId;
  priceString: string;
  periodLabel: string;
  rcPackage: PurchasesPackage | null;
};

export const FALLBACK_PRICES: Record<PlanId, string> = {
  monthly: "$9.99",
  annual: "$79.99",
};

const PLACEHOLDER_KEYS = new Set([
  "",
  "your-revenuecat-ios-api-key",
  "your-revenuecat-android-api-key",
]);

let runtimeReady = false;

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** Native store IAP is only available outside Expo Go / web. */
export function canUseNativePurchases(): boolean {
  return Platform.OS !== "web" && !isExpoGo();
}

function getPlatformApiKey(): string | null {
  const key =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
      : Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
        : null;

  if (!key || PLACEHOLDER_KEYS.has(key)) return null;
  return key;
}

export function getEntitlementId(): string {
  const id = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim();
  return id && id.length > 0 ? id : "premium";
}

/** True when a non-placeholder RevenueCat API key exists for the current platform. */
export function isPurchasesConfigured(): boolean {
  return getPlatformApiKey() !== null;
}

/** True after a successful native SDK configure (false in Expo Go / web / missing keys). */
export function isPurchasesRuntimeReady(): boolean {
  return runtimeReady;
}

function customerHasPremium(info: CustomerInfo): boolean {
  const entitlement = info.entitlements.active[getEntitlementId()];
  return Boolean(entitlement?.isActive);
}

function toPurchaseError(error: unknown): PurchaseOutcome {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code ===
      PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  ) {
    return { success: false, isPremium: false, cancelled: true };
  }

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : error instanceof Error
        ? error.message
        : "Purchase failed.";

  return { success: false, isPremium: false, error: message };
}

/**
 * Configure RevenueCat. Returns true when the native SDK is ready for store IAP.
 * Missing keys, Expo Go, web, or configure failures leave the app in demo mode.
 */
export async function initPurchases(userId?: string): Promise<boolean> {
  const apiKey = getPlatformApiKey();

  if (!apiKey || !canUseNativePurchases()) {
    runtimeReady = false;
    return false;
  }

  try {
    const alreadyConfigured = await Purchases.isConfigured();

    if (!alreadyConfigured) {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.WARN);
      }
      Purchases.configure({
        apiKey,
        appUserID: userId ?? undefined,
      });
    } else if (userId) {
      await Purchases.logIn(userId);
    }

    runtimeReady = true;
    return true;
  } catch {
    runtimeReady = false;
    return false;
  }
}

/** Identify the purchaser with the Supabase (or demo) user id when logged in. */
export async function identifyPurchasesUser(userId: string): Promise<void> {
  if (!runtimeReady || !userId) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // Non-fatal — anonymous RC user continues until next successful login.
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!runtimeReady) return null;
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

/**
 * Map the current offering to monthly/annual display packages.
 * Falls back to kit display prices when offerings are empty or unavailable.
 */
export async function getPlanPricing(): Promise<{
  monthly: PlanPricing;
  annual: PlanPricing;
}> {
  const offerings = await getOfferings();
  const current = offerings?.current;

  const monthlyPkg =
    current?.monthly ??
    current?.availablePackages.find(
      (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY,
    ) ??
    null;

  const annualPkg =
    current?.annual ??
    current?.availablePackages.find(
      (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL,
    ) ??
    null;

  return {
    monthly: {
      plan: "monthly",
      priceString: monthlyPkg?.product.priceString ?? FALLBACK_PRICES.monthly,
      periodLabel: "/mo",
      rcPackage: monthlyPkg,
    },
    annual: {
      plan: "annual",
      priceString: annualPkg?.product.priceString ?? FALLBACK_PRICES.annual,
      periodLabel: "/yr",
      rcPackage: annualPkg,
    },
  };
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<PurchaseOutcome> {
  if (!runtimeReady) {
    return {
      success: false,
      isPremium: false,
      error:
        "In-app purchases require a development build with RevenueCat keys. Use demo mode Upgrade to simulate Premium.",
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return {
      success: true,
      isPremium: customerHasPremium(customerInfo),
    };
  } catch (error) {
    return toPurchaseError(error);
  }
}

export async function restorePurchases(): Promise<PurchaseOutcome> {
  if (!runtimeReady) {
    return {
      success: false,
      isPremium: false,
      error:
        "Restore requires a development build with RevenueCat. In demo mode, restore uses your local Premium flag.",
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerHasPremium(customerInfo);
    return {
      success: isPremium,
      isPremium,
      error: isPremium
        ? undefined
        : "No active subscription found for this Apple/Google account.",
    };
  } catch (error) {
    return toPurchaseError(error);
  }
}

export async function checkPremiumEntitlement(): Promise<boolean> {
  if (!runtimeReady) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return customerHasPremium(info);
  } catch {
    return false;
  }
}
