// ==========================================
// Themes and Wallpapers
// ==========================================

import { ThemeId, WallpaperId } from './types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    surface: string;
    surfaceLight: string;
    surfaceDark: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    colors: {
      primary: '99 102 241',
      primaryDark: '79 70 229',
      accent: '168 85 247',
      surface: '15 23 42',
      surfaceLight: '30 41 59',
      surfaceDark: '2 6 23',
      textPrimary: '248 250 252',
      textSecondary: '148 163 184',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    colors: {
      primary: '16 185 129',
      primaryDark: '5 150 105',
      accent: '52 211 153',
      surface: '6 28 21',
      surfaceLight: '17 44 34',
      surfaceDark: '2 18 13',
      textPrimary: '236 253 245',
      textSecondary: '134 197 172',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    colors: {
      primary: '251 146 60',
      primaryDark: '234 88 12',
      accent: '251 191 36',
      surface: '30 15 10',
      surfaceLight: '50 28 18',
      surfaceDark: '15 8 5',
      textPrimary: '255 247 237',
      textSecondary: '194 155 128',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    colors: {
      primary: '6 182 212',
      primaryDark: '8 145 178',
      accent: '34 211 238',
      surface: '8 20 30',
      surfaceLight: '14 35 50',
      surfaceDark: '3 10 18',
      textPrimary: '236 254 255',
      textSecondary: '125 175 192',
    },
  },
  {
    id: 'cherry',
    name: 'Cherry',
    emoji: '🌸',
    colors: {
      primary: '244 114 182',
      primaryDark: '219 39 119',
      accent: '251 113 133',
      surface: '30 10 20',
      surfaceLight: '50 18 35',
      surfaceDark: '15 5 10',
      textPrimary: '255 241 248',
      textSecondary: '194 130 160',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💜',
    colors: {
      primary: '167 139 250',
      primaryDark: '139 92 246',
      accent: '196 181 253',
      surface: '18 12 35',
      surfaceLight: '30 22 55',
      surfaceDark: '10 6 22',
      textPrimary: '245 243 255',
      textSecondary: '160 145 195',
    },
  },
];

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  emoji: string;
  className: string; // CSS class defined in globals.css
}

export const WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'default',
    name: 'Default',
    emoji: '⬛',
    className: '',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    className: 'wp-aurora',
  },
  {
    id: 'nebula',
    name: 'Nebula',
    emoji: '🔮',
    className: 'wp-nebula',
  },
  {
    id: 'grid',
    name: 'Cyber Grid',
    emoji: '🕸️',
    className: 'wp-grid',
  },
  {
    id: 'gradient-flow',
    name: 'Flow',
    emoji: '🌊',
    className: 'wp-gradient-flow',
  },
  {
    id: 'bokeh',
    name: 'Bokeh',
    emoji: '✨',
    className: 'wp-bokeh',
  },
];

export function getTheme(id: ThemeId): ThemeConfig {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function getWallpaper(id: WallpaperId): WallpaperConfig {
  return WALLPAPERS.find(w => w.id === id) || WALLPAPERS[0];
}

/**
 * Generate CSS variables string for a theme
 */
export function getThemeCSSVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-dark': theme.colors.primaryDark,
    '--color-accent': theme.colors.accent,
    '--color-surface': theme.colors.surface,
    '--color-surface-light': theme.colors.surfaceLight,
    '--color-surface-dark': theme.colors.surfaceDark,
    '--color-text-primary': theme.colors.textPrimary,
    '--color-text-secondary': theme.colors.textSecondary,
  };
}
