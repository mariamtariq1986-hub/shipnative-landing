import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EMPTY_PROFILE,
  EMPTY_STATS,
  EMPTY_TEAM,
  FAVORITES_MAX,
  FREE_LIMIT,
  HISTORY_MAX,
  STORAGE_KEYS,
  type BizId,
  type BusinessProfile,
  type FavoriteItem,
  type HistoryItem,
  type IntentId,
  type StatsState,
  type TeamState,
  type ToneId,
} from './constants';
import type { ThemeMode } from './theme';

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function isPro(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.pro)) === '1';
}

export async function setPro(on: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.pro, on ? '1' : '0');
}

export async function getUsage(): Promise<{ date: string; count: number }> {
  const parsed = await getJson(STORAGE_KEYS.usage, { date: todayKey(), count: 0 });
  if (parsed.date !== todayKey()) return { date: todayKey(), count: 0 };
  return { date: parsed.date, count: Number(parsed.count) || 0 };
}

export async function setUsage(count: number): Promise<void> {
  await setJson(STORAGE_KEYS.usage, { date: todayKey(), count });
}

export async function remainingGens(): Promise<number> {
  if (await isPro()) return Number.POSITIVE_INFINITY;
  const usage = await getUsage();
  return Math.max(0, FREE_LIMIT - usage.count);
}

export async function consumeGeneration(): Promise<boolean> {
  if (await isPro()) return true;
  const usage = await getUsage();
  if (usage.count >= FREE_LIMIT) return false;
  await setUsage(usage.count + 1);
  return true;
}

export async function getProfile(): Promise<BusinessProfile> {
  const p = await getJson<Partial<BusinessProfile>>(STORAGE_KEYS.profile, {});
  return {
    name: String(p.name || '').trim(),
    type: String(p.type || '').trim(),
    services: String(p.services || '').trim(),
    hours: String(p.hours || '').trim(),
    location: String(p.location || '').trim(),
    whatsapp: String(p.whatsapp || '').trim(),
    neverSay: String(p.neverSay || '').trim(),
    alwaysSay: String(p.alwaysSay || '').trim(),
  };
}

export async function saveProfile(profile: BusinessProfile): Promise<void> {
  await setJson(STORAGE_KEYS.profile, profile);
}

export async function getTeam(): Promise<TeamState> {
  const t = await getJson<Partial<TeamState>>(STORAGE_KEYS.team, {});
  const staffRaw = Array.isArray(t.staff) ? t.staff.slice(0, 3) : ['', '', ''];
  while (staffRaw.length < 3) staffRaw.push('');
  return {
    teamName: String(t.teamName || '').trim(),
    staff: [String(staffRaw[0] || ''), String(staffRaw[1] || ''), String(staffRaw[2] || '')],
    activeStaff: Math.min(2, Math.max(0, Number(t.activeStaff) || 0)),
    lastInvite: String(t.lastInvite || ''),
  };
}

export async function saveTeam(team: TeamState): Promise<void> {
  await setJson(STORAGE_KEYS.team, team);
}

export async function getHistory(): Promise<HistoryItem[]> {
  const arr = await getJson<HistoryItem[]>(STORAGE_KEYS.history, []);
  return Array.isArray(arr) ? arr.slice(0, HISTORY_MAX) : [];
}

export async function pushHistory(replies: string[], intentLabel: string): Promise<void> {
  const prev = await getHistory();
  const stamp = Date.now();
  const entries = replies.map((text, i) => ({
    id: `${stamp}-${i}`,
    text,
    at: stamp,
    intent: intentLabel || '',
  }));
  await setJson(STORAGE_KEYS.history, entries.concat(prev).slice(0, HISTORY_MAX));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.history);
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const arr = await getJson<FavoriteItem[]>(STORAGE_KEYS.favorites, []);
  return Array.isArray(arr) ? arr.slice(0, FAVORITES_MAX) : [];
}

export async function addFavorite(text: string, label = 'Pinned'): Promise<FavoriteItem[]> {
  const prev = await getFavorites();
  if (prev.some((f) => f.text === text)) return prev;
  const next = [
    { id: `${Date.now()}`, text, label, at: Date.now() },
    ...prev,
  ].slice(0, FAVORITES_MAX);
  await setJson(STORAGE_KEYS.favorites, next);
  return next;
}

export async function removeFavorite(id: string): Promise<FavoriteItem[]> {
  const next = (await getFavorites()).filter((f) => f.id !== id);
  await setJson(STORAGE_KEYS.favorites, next);
  return next;
}

export async function getStats(): Promise<StatsState> {
  const s = await getJson<Partial<StatsState>>(STORAGE_KEYS.stats, EMPTY_STATS);
  return {
    totalGenerated: Number(s.totalGenerated) || 0,
    totalCopied: Number(s.totalCopied) || 0,
    byDay: typeof s.byDay === 'object' && s.byDay ? s.byDay : {},
  };
}

export async function bumpGenerated(count = 3): Promise<StatsState> {
  const s = await getStats();
  const day = todayKey();
  s.totalGenerated += count;
  s.byDay[day] = (s.byDay[day] || 0) + count;
  await setJson(STORAGE_KEYS.stats, s);
  return s;
}

export async function bumpCopied(): Promise<StatsState> {
  const s = await getStats();
  s.totalCopied += 1;
  await setJson(STORAGE_KEYS.stats, s);
  const copies = Number((await AsyncStorage.getItem(STORAGE_KEYS.copyCount)) || 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.copyCount, String(copies));
  return s;
}

export async function getCopyCount(): Promise<number> {
  return Number((await AsyncStorage.getItem(STORAGE_KEYS.copyCount)) || 0);
}

export async function wasRatingAsked(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.ratingAsked)) === '1';
}

export async function setRatingAsked(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ratingAsked, '1');
}

export async function isOnboardingDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.onboarding)) === '1';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboarding, '1');
}

export async function getThemePref(): Promise<ThemeMode | 'system'> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.theme);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

export async function setThemePref(mode: ThemeMode | 'system'): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.theme, mode);
}

export async function getBiz(): Promise<BizId> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.biz);
  return (v as BizId) || 'salon';
}

export async function setBiz(biz: BizId): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.biz, biz);
}

export async function getTone(): Promise<ToneId> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.tone);
  return (v as ToneId) || 'friendly';
}

export async function setTone(tone: ToneId): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.tone, tone);
}

export async function getArabic(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.arabic)) === '1';
}

export async function setArabic(on: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.arabic, on ? '1' : '0');
}

export async function getRecentIntents(): Promise<IntentId[]> {
  const arr = await getJson<string[]>(STORAGE_KEYS.recentIntents, []);
  return Array.isArray(arr) ? (arr.filter(Boolean) as IntentId[]).slice(0, 6) : [];
}

export async function pushRecentIntent(id: IntentId): Promise<IntentId[]> {
  const prev = await getRecentIntents();
  const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6);
  await setJson(STORAGE_KEYS.recentIntents, next);
  return next;
}

export async function getNotifyPref(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.notifyPref)) === '1';
}

export async function setNotifyPref(on: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.notifyPref, on ? '1' : '0');
}

export { EMPTY_PROFILE, EMPTY_TEAM };
