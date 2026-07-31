import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_SESSION_KEY = "demo-auth-session";

function createDemoUser(email: string): User {
  const now = new Date().toISOString();
  return {
    id: `demo-${email}`,
    app_metadata: {},
    user_metadata: { full_name: email.split("@")[0] },
    aud: "authenticated",
    created_at: now,
    email,
    role: "authenticated",
  } as User;
}

function createDemoSession(email: string): Session {
  return {
    access_token: "demo-access-token",
    refresh_token: "demo-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: createDemoUser(email),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (mounted) setSession(data.session);
        } else {
          const { default: AsyncStorage } = await import(
            "@react-native-async-storage/async-storage"
          );
          const stored = await AsyncStorage.getItem(DEMO_SESSION_KEY);
          if (mounted && stored) {
            setSession(JSON.parse(stored) as Session);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      return { error: "Email and password are required." };
    }

    if (!isSupabaseConfigured) {
      if (password.length < 6) {
        return { error: "Password must be at least 6 characters." };
      }
      const demoSession = createDemoSession(trimmed);
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
      setSession(demoSession);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });

    if (error) return { error: error.message };
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      return { error: "Email and password are required." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    if (!isSupabaseConfigured) {
      const demoSession = createDemoSession(trimmed);
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
      setSession(demoSession);
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email: trimmed,
      password,
    });

    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.removeItem(DEMO_SESSION_KEY);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
