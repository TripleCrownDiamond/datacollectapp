import type { Config } from 'tailwindcss';
import { colors, radius, spacing, fontSize, shadows } from '@terracollect/shared';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary.light,
          foreground: colors.primaryForeground.light,
          dark: colors.primary.dark,
          'dark-foreground': colors.primaryForeground.dark,
        },
        surface: {
          DEFAULT: colors.surface.light,
          dark: colors.surface.dark,
        },
        muted: {
          DEFAULT: colors.muted.light,
          dark: colors.muted.dark,
        },
        border: {
          DEFAULT: colors.border.light,
          dark: colors.border.dark,
        },
        success: {
          DEFAULT: colors.success.light,
          dark: colors.success.dark,
        },
        warning: {
          DEFAULT: colors.warning.light,
          dark: colors.warning.dark,
        },
        danger: {
          DEFAULT: colors.danger.light,
          dark: colors.danger.dark,
        },
        info: {
          DEFAULT: colors.info.light,
          dark: colors.info.dark,
        },
        background: {
          DEFAULT: colors.background.light,
          dark: colors.background.dark,
        },
        foreground: {
          DEFAULT: colors.foreground.light,
          dark: colors.foreground.dark,
        },
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
      },
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([k, v]) => [k, `${v}px`]),
      ),
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([k, v]) => [k, [`${v}px`, { lineHeight: `${v * 1.4}px` }]]),
      ),
      boxShadow: shadows,
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
