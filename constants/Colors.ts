/**
 * Claymorphic UI colors - forced light theme only
 */

import { ClayTheme } from '@/theme/claymorph';

const tintColorLight = ClayTheme.colors.primary;

export const Colors = {
  light: {
    text: ClayTheme.colors.text.primary,
    background: ClayTheme.colors.background,
    tint: tintColorLight,
    icon: ClayTheme.colors.text.secondary,
    tabIconDefault: ClayTheme.colors.text.light,
    tabIconSelected: tintColorLight,
    surface: ClayTheme.colors.surface,
    clay: ClayTheme.colors.clay,
    primary: ClayTheme.colors.primary,
    secondary: ClayTheme.colors.secondary,
    accent: ClayTheme.colors.accent,
  },
  // Keep dark theme for fallback but it won't be used
  dark: {
    text: ClayTheme.colors.text.primary,
    background: ClayTheme.colors.background,
    tint: tintColorLight,
    icon: ClayTheme.colors.text.secondary,
    tabIconDefault: ClayTheme.colors.text.light,
    tabIconSelected: tintColorLight,
    surface: ClayTheme.colors.surface,
    clay: ClayTheme.colors.clay,
    primary: ClayTheme.colors.primary,
    secondary: ClayTheme.colors.secondary,
    accent: ClayTheme.colors.accent,
  },
};
