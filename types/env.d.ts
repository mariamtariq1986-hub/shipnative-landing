declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_GEMINI_API_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?: string;
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?: string;
    EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?: string;
  }
}

export {};
