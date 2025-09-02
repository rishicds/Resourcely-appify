import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('Splash useEffect triggered:', { isLoading, isAuthenticated, user: user?.name, hasCompletedOnboarding: user?.hasCompletedOnboarding });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, go to login
        console.log('Redirecting to login');
        router.replace('/(auth)/login' as any);
      } else if (user && !user.hasCompletedOnboarding) {
        // Authenticated but hasn't completed onboarding
        console.log('Redirecting to onboarding');
        router.replace('/(onboarding)/skills' as any);
      } else {
        // Authenticated and onboarded, go to main app
        console.log('Redirecting to main app');
        router.replace('/(main)' as any);
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Resourcely</Text>
        <Text style={styles.subtitle}>Connect, Share, Grow</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 48,
  },
  loadingContainer: {
    marginTop: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#e0e7ff',
  },
});