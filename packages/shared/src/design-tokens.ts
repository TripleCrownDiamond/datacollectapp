// ── Colors (shared between web Tailwind and mobile RN) ──
export const colors = {
  primary: { light: '#0F766E', dark: '#2DD4BF' },
  primaryForeground: { light: '#FFFFFF', dark: '#042F2E' },
  background: { light: '#FFFFFF', dark: '#0B1220' },
  surface: { light: '#F8FAFC', dark: '#111827' },
  foreground: { light: '#0F172A', dark: '#E5E7EB' },
  muted: { light: '#64748B', dark: '#94A3B8' },
  border: { light: '#E2E8F0', dark: '#1F2937' },
  success: { light: '#15803D', dark: '#4ADE80' },
  warning: { light: '#B45309', dark: '#FBBF24' },
  danger: { light: '#B91C1C', dark: '#F87171' },
  info: { light: '#1D4ED8', dark: '#60A5FA' },
} as const;

export type ColorToken = keyof typeof colors;

// ── Spacing grid (multiples of 4) ──
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpacingToken = keyof typeof spacing;

// ── Border radius ──
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

// ── Typography scale ──
export const fontSize = {
  caption: 12,
  bodySm: 14,
  body: 16,
  h4: 18,
  h3: 20,
  h2: 24,
  h1: 30,
} as const;

// ── Breakpoints ──
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ── Shadows ──
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
} as const;
