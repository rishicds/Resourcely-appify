import { useThemeColor } from '@/hooks/useThemeColor';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { ColorValue, Text, View } from 'react-native';

export type Props = LucideProps & {
  lightColor?: string;
  darkColor?: string;
  name: React.ComponentType<LucideProps>;
};

// Fallback component when SVG fails to render
function IconFallback({ size = 24, color }: { size?: number; color?: ColorValue }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: (color as string) || '#666',
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: Math.round(size * 0.6), fontWeight: 'bold' }}>
        ?
      </Text>
    </View>
  );
}

export function Icon({
  lightColor,
  darkColor,
  name: IconComponent,
  color,
  size = 24,
  strokeWidth = 1.8,
  ...rest
}: Props) {
  const themedColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'icon'
  );

  // Use provided color prop if available, otherwise use themed color
  const iconColor = color || (typeof themedColor === 'string' ? themedColor : '#666');

  try {
    return (
      <IconComponent
        color={iconColor}
        size={size}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        {...rest}
      />
    );
  } catch (error) {
    console.warn('Icon rendering failed, using fallback:', error);
    return <IconFallback size={typeof size === 'number' ? size : 24} color={iconColor} />;
  }
}
