import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: ResolvedTheme;
  isDark: boolean;
  setPreference: (value: ThemePreference) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "theme-preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          mounted &&
          (stored === "light" || stored === "dark" || stored === "system")
        ) {
          setPreferenceState(stored);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const colorScheme: ResolvedTheme =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  useEffect(() => {
    if (!hydrated) return;

    setColorScheme(preference === "system" ? "system" : preference);
    void SystemUI.setBackgroundColorAsync(
      colorScheme === "dark" ? "#020617" : "#f8fafc",
    );
  }, [preference, colorScheme, hydrated, setColorScheme]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    void AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setPreference]);

  const value = useMemo(
    () => ({
      preference,
      colorScheme,
      isDark: colorScheme === "dark",
      setPreference,
      toggleTheme,
    }),
    [preference, colorScheme, setPreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
