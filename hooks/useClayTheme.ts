import { ClayTheme, clayMorphStyles } from '@/theme/claymorph';

/**
 * Hook to provide claymorphic theme styles and colors
 * This ensures consistent claymorphic styling across the app
 */
export function useClayTheme() {
  return {
    colors: ClayTheme.colors,
    shadows: ClayTheme.shadows,
    borderRadius: ClayTheme.borderRadius,
    styles: clayMorphStyles,
  };
}

/**
 * Helper function to create claymorphic button styles
 */
export function createClayButton(variant: 'primary' | 'secondary' | 'surface' = 'primary') {
  const baseStyle = {
    ...clayMorphStyles.button,
    borderRadius: ClayTheme.borderRadius.medium,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const variants = {
    primary: {
      ...baseStyle,
      backgroundColor: ClayTheme.colors.primary,
    },
    secondary: {
      ...baseStyle,
      backgroundColor: ClayTheme.colors.secondary,
    },
    surface: {
      ...baseStyle,
      backgroundColor: ClayTheme.colors.surface,
    },
  };

  return variants[variant];
}

/**
 * Helper function to create claymorphic input styles
 */
export function createClayInput() {
  return {
    ...clayMorphStyles.input,
    color: ClayTheme.colors.text.primary,
    fontSize: 16,
  };
}

/**
 * Helper function to create claymorphic card styles
 */
export function createClayCard() {
  return {
    ...clayMorphStyles.card,
    backgroundColor: ClayTheme.colors.surface,
  };
}
