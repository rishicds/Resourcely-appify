import { Icon, Props as IconProps } from '@/components/ui/icon';
import React from 'react';
import { Text, View } from 'react-native';

interface SafeIconProps extends IconProps {
  fallbackText?: string;
}

interface SafeIconState {
  hasError: boolean;
}

class SafeIcon extends React.Component<SafeIconProps, SafeIconState> {
  constructor(props: SafeIconProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SafeIconState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('SafeIcon caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { size = 24, color, fallbackText = '●' } = this.props;
      return (
        <View
          style={{
            width: typeof size === 'number' ? size : 24,
            height: typeof size === 'number' ? size : 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: (color as string) || '#666',
              fontSize: (typeof size === 'number' ? size : 24) * 0.8,
              fontWeight: 'bold',
            }}
          >
            {fallbackText}
          </Text>
        </View>
      );
    }

    return <Icon {...this.props} />;
  }
}

export default SafeIcon;
