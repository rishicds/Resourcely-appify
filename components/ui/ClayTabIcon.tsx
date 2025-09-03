import { ClayTheme } from '@/theme/claymorph';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ClayTabIconProps {
  icon: React.ComponentType<LucideProps>;
  color: string;
  focused: boolean;
  size?: number;
}

export function ClayTabIcon({ icon: IconComponent, color, focused, size = 24 }: ClayTabIconProps) {
  const renderIcon = () => {
    try {
      return (
        <IconComponent
          size={size}
          color={focused ? ClayTheme.colors.primary : color}
          strokeWidth={focused ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } catch (error) {
      console.warn('ClayTabIcon rendering failed, using fallback:', error);
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: focused ? ClayTheme.colors.primary : color,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: Math.round(size * 0.6),
              fontWeight: 'bold',
            }}
          >
            ●
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={[
      styles.container,
      focused ? styles.focused : styles.unfocused
    ]}>
      {renderIcon()}
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
