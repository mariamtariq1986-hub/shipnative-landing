import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  EMPTY_PROFILE,
  EMPTY_STATS,
  EMPTY_TEAM,
  type BizId,
  type BusinessProfile,
  type FavoriteItem,
  type HistoryItem,
  type IntentId,
  type StatsState,
  type TeamState,
  type ToneId,
} from '../lib/constants';
import {
  addFavorite,
  clearHistory,
  getArabic,
  getBiz,
  getFavorites,
  getHistory,
  getProfile,
  getRecentIntents,
  getStats,
  getTeam,
  getThemePref,
  getTone,
  isOnboardingDone,
  isPro,
  pushRecentIntent,
  remainingGens,
  removeFavorite,
  saveProfile,
  saveTeam,
  setArabic as persistArabic,
  setBiz as persistBiz,
  setOnboardingDone,
  setPro,
  setThemePref,
  setTone as persistTone,
} from '../lib/storage';
import { colorsFor, type AppColors, type ThemeMode } from '../lib/theme';

type ReplylyContextValue = {
  ready: boolean;
  onboardingDone: boolean;
  completeOnboarding: () => Promise<void>;
  themeMode: ThemeMode;
  themePref: ThemeMode | 'system';
  setThemePreference: (m: ThemeMode | 'system') => Promise<void>;
  colors: AppColors;
  pro: boolean;
  unlockPro: () => Promise<void>;
  remaining: number;
  refreshUsage: () => Promise<void>;
  biz: BizId;
  setBiz: (b: BizId) => Promise<void>;
  tone: ToneId;
  setTone: (t: ToneId) => Promise<void>;
  arabic: boolean;
  setArabic: (v: boolean) => Promise<void>;
  profile: BusinessProfile;
  updateProfile: (p: BusinessProfile) => Promise<void>;
  team: TeamState;
  updateTeam: (t: TeamState) => Promise<void>;
  history: HistoryItem[];
  reloadHistory: () => Promise<void>;
  wipeHistory: () => Promise<void>;
  favorites: FavoriteItem[];
  pinFavorite: (text: string, label?: string) => Promise<void>;
  unpinFavorite: (id: string) => Promise<void>;
  stats: StatsState;
  reloadStats: () => Promise<void>;
  recentIntents: IntentId[];
  rememberIntent: (id: IntentId) => Promise<void>;
};

const ReplylyContext = createContext<ReplylyContextValue | null>(null);

export function ReplylyProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [themePref, setThemePrefState] = useState<ThemeMode | 'system'>('system');
  const [pro, setProState] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [biz, setBizState] = useState<BizId>('salon');
  const [tone, setToneState] = useState<ToneId>('friendly');
  const [arabic, setArabicState] = useState(false);
  const [profile, setProfileState] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [team, setTeamState] = useState<TeamState>(EMPTY_TEAM);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [stats, setStats] = useState<StatsState>(EMPTY_STATS);
  const [recentIntents, setRecentIntents] = useState<IntentId[]>([]);

  const themeMode: ThemeMode =
    themePref === 'system' ? (system === 'light' ? 'light' : 'dark') : themePref;
  const colors = useMemo(() => colorsFor(themeMode), [themeMode]);

  const bootstrap = useCallback(async () => {
    const [
      done,
      theme,
      proVal,
      left,
      bizVal,
      toneVal,
      arabicVal,
      profileVal,
      teamVal,
      historyVal,
      favVal,
      statsVal,
      recentVal,
    ] = await Promise.all([
      isOnboardingDone(),
      getThemePref(),
      isPro(),
      remainingGens(),
      getBiz(),
      getTone(),
      getArabic(),
      getProfile(),
      getTeam(),
      getHistory(),
      getFavorites(),
      getStats(),
      getRecentIntents(),
    ]);
    setOnboardingDoneState(done);
    setThemePrefState(theme);
    setProState(proVal);
    setRemaining(left);
    setBizState(bizVal);
    setToneState(toneVal);
    setArabicState(arabicVal);
    setProfileState(profileVal);
    setTeamState(teamVal);
    setHistory(historyVal);
    setFavorites(favVal);
    setStats(statsVal);
    setRecentIntents(recentVal);
    setReady(true);
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const value = useMemo<ReplylyContextValue>(
    () => ({
      ready,
      onboardingDone,
      completeOnboarding: async () => {
        await setOnboardingDone();
        setOnboardingDoneState(true);
      },
      themeMode,
      themePref,
      setThemePreference: async (m) => {
        await setThemePref(m);
        setThemePrefState(m);
      },
      colors,
      pro,
      unlockPro: async () => {
        await setPro(true);
        setProState(true);
        setRemaining(Number.POSITIVE_INFINITY);
      },
      remaining,
      refreshUsage: async () => {
        setRemaining(await remainingGens());
        setProState(await isPro());
      },
      biz,
      setBiz: async (b) => {
        await persistBiz(b);
        setBizState(b);
      },
      tone,
      setTone: async (t) => {
        await persistTone(t);
        setToneState(t);
      },
      arabic,
      setArabic: async (v) => {
        await persistArabic(v);
        setArabicState(v);
      },
      profile,
      updateProfile: async (p) => {
        await saveProfile(p);
        setProfileState(p);
      },
      team,
      updateTeam: async (t) => {
        await saveTeam(t);
        setTeamState(t);
      },
      history,
      reloadHistory: async () => setHistory(await getHistory()),
      wipeHistory: async () => {
        await clearHistory();
        setHistory([]);
      },
      favorites,
      pinFavorite: async (text, label) => {
        setFavorites(await addFavorite(text, label));
      },
      unpinFavorite: async (id) => {
        setFavorites(await removeFavorite(id));
      },
      stats,
      reloadStats: async () => setStats(await getStats()),
      recentIntents,
      rememberIntent: async (id) => {
        setRecentIntents(await pushRecentIntent(id));
      },
    }),
    [
      ready,
      onboardingDone,
      themeMode,
      themePref,
      colors,
      pro,
      remaining,
      biz,
      tone,
      arabic,
      profile,
      team,
      history,
      favorites,
      stats,
      recentIntents,
    ],
  );

  return <ReplylyContext.Provider value={value}>{children}</ReplylyContext.Provider>;
}

export function useReplyly(): ReplylyContextValue {
  const ctx = useContext(ReplylyContext);
  if (!ctx) throw new Error('useReplyly must be used within ReplylyProvider');
  return ctx;
}
