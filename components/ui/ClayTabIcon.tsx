import { ClayTheme } from '@/theme/claymorph';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ClayTabIconProps {
  icon: React.ComponentType<LucideProps>;
  color: string;
  focused: boolean;
  size?: number;
}

export function ClayTabIcon({ icon: IconComponent, color, focused, size = 24 }: ClayTabIconProps) {
  return (
    <View style={[
      styles.container,
      focused ? styles.focused : styles.unfocused
    ]}>
      <IconComponent
        size={size}
        color={focused ? ClayTheme.colors.primary : color}
        strokeWidth={focused ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ClayTheme.borderRadius.large,
    marginTop: 2,
  },
  focused: {
    backgroundColor: ClayTheme.colors.surface,
    ...ClayTheme.shadows.clay,
    transform: [{ scale: 1.05 }],
  },
  unfocused: {
    backgroundColor: 'transparent',
  },
});
