export type ThemeMode = 'light' | 'dark';

export type AppColors = {
  bg: string;
  bgElevated: string;
  bgMuted: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  leaf: string;
  leafSoft: string;
  leafDeep: string;
  border: string;
  danger: string;
  card: string;
  overlay: string;
  tabBar: string;
  success: string;
};

export const darkColors: AppColors = {
  bg: '#07110d',
  bgElevated: '#0f1c16',
  bgMuted: '#13241c',
  ink: '#e8eeea',
  inkMuted: '#9aada2',
  inkFaint: '#6b7c72',
  leaf: '#25d366',
  leafSoft: '#4ade80',
  leafDeep: '#16a34a',
  border: 'rgba(255,255,255,0.10)',
  danger: '#f87171',
  card: 'rgba(255,255,255,0.045)',
  overlay: 'rgba(5,12,9,0.78)',
  tabBar: '#0a1612',
  success: '#86efb0',
};

export const lightColors: AppColors = {
  bg: '#f4f7f5',
  bgElevated: '#ffffff',
  bgMuted: '#e8f0eb',
  ink: '#0f1c16',
  inkMuted: '#3d4a42',
  inkFaint: '#6b7c72',
  leaf: '#16a34a',
  leafSoft: '#25d366',
  leafDeep: '#15803d',
  border: 'rgba(15,28,22,0.10)',
  danger: '#dc2626',
  card: '#ffffff',
  overlay: 'rgba(7,17,13,0.45)',
  tabBar: '#ffffff',
  success: '#15803d',
};

export function colorsFor(mode: ThemeMode): AppColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
