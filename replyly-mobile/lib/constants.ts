export const FREE_LIMIT = 5;
export const PROMO_CODE = 'REPLYLY-PRO';
export const GUMROAD_URL = 'https://mariamtariq72.gumroad.com/l/replyly';
export const PRIVACY_URL = 'https://replyly-kappa.vercel.app/privacy';
export const HISTORY_MAX = 20;
export const FAVORITES_MAX = 30;
export const RATING_AFTER_COPIES = 5;

export const STORAGE_KEYS = {
  pro: 'replyly_pro',
  usage: 'replyly_usage',
  biz: 'replyly_biz',
  tone: 'replyly_tone',
  arabic: 'replyly_arabic',
  profile: 'replyly_profile',
  history: 'replyly_history',
  team: 'replyly_team',
  favorites: 'replyly_favorites',
  stats: 'replyly_stats',
  onboarding: 'replyly_onboarding_done',
  theme: 'replyly_theme',
  copyCount: 'replyly_copy_count',
  ratingAsked: 'replyly_rating_asked',
  notifyPref: 'replyly_notify_pref',
  recentIntents: 'replyly_recent_intents',
} as const;

export const BIZ = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'salon', label: 'Salon' },
  { id: 'realestate', label: 'Real Estate' },
  { id: 'retail', label: 'Retail' },
  { id: 'other', label: 'Other' },
] as const;

export const TONES = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'short', label: 'Short' },
] as const;

export const INTENTS = [
  { id: 'price', label: 'Price', labelAr: 'السعر' },
  { id: 'booking', label: 'Booking', labelAr: 'حجز' },
  { id: 'location', label: 'Location', labelAr: 'الموقع' },
  { id: 'hours', label: 'Hours', labelAr: 'دوام؟' },
  { id: 'complaint', label: 'Complaint', labelAr: 'شكوى' },
  { id: 'thanks', label: 'Thanks', labelAr: 'شكر' },
] as const;

export type BizId = (typeof BIZ)[number]['id'];
export type ToneId = (typeof TONES)[number]['id'];
export type IntentId = (typeof INTENTS)[number]['id'];

export type BusinessProfile = {
  name: string;
  type: string;
  services: string;
  hours: string;
  location: string;
  whatsapp: string;
  neverSay: string;
  alwaysSay: string;
};

export type TeamState = {
  teamName: string;
  staff: [string, string, string];
  activeStaff: number;
  lastInvite: string;
};

export type HistoryItem = {
  id: string;
  text: string;
  at: number;
  intent: string;
};

export type FavoriteItem = {
  id: string;
  text: string;
  label: string;
  at: number;
};

export type StatsState = {
  totalGenerated: number;
  totalCopied: number;
  byDay: Record<string, number>;
};

export const EMPTY_PROFILE: BusinessProfile = {
  name: '',
  type: '',
  services: '',
  hours: '',
  location: '',
  whatsapp: '',
  neverSay: '',
  alwaysSay: '',
};

export const EMPTY_TEAM: TeamState = {
  teamName: '',
  staff: ['', '', ''],
  activeStaff: 0,
  lastInvite: '',
};

export const EMPTY_STATS: StatsState = {
  totalGenerated: 0,
  totalCopied: 0,
  byDay: {},
};
