import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ClayTabIcon } from '@/components/ui/ClayTabIcon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { ClayTheme } from '@/theme/claymorph';
import { HelpCircle, Home, Search, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ClayTheme.colors.primary,
        tabBarInactiveTintColor: ClayTheme.colors.text.light,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: ClayTheme.colors.surface,
            borderTopWidth: 0,
            ...ClayTheme.shadows.clay,
          },
          default: {
            backgroundColor: ClayTheme.colors.surface,
            borderTopWidth: 0,
            elevation: 12,
            shadowColor: ClayTheme.colors.clay.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Rooms',
          tabBarIcon: ({ color, focused }) => <ClayTabIcon icon={Home} color={color} focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <ClayTabIcon icon={Search} color={color} focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <ClayTabIcon icon={User} color={color} focused={focused} size={24} />,
        }}
      />
      <Tabs.Screen
        name="how-to-use"
        options={{
          title: 'FAQ',
          tabBarIcon: ({ color, focused }) => <ClayTabIcon icon={HelpCircle} color={color} focused={focused} size={24} />,
        }}
      />
    </Tabs>
  );
}
