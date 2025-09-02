import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Ensure splash screen shows for at least 2 seconds for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  useEffect(() => {
    console.log('Splash useEffect triggered:', { 
      isLoading, 
      isAuthenticated, 
      user: user?.name, 
      hasCompletedOnboarding: user?.hasCompletedOnboarding,
      minTimeElapsed 
    });
    
    // Only redirect after auth loading is complete AND minimum time has elapsed
    if (!isLoading && minTimeElapsed) {
      const redirectWithDelay = () => {
        if (!isAuthenticated) {
          // Not authenticated, go to login
          console.log('Redirecting to login');
          router.replace('/(auth)/register' as any);
        } else if (user && !user.hasCompletedOnboarding) {
          // Authenticated but hasn't completed onboarding
          console.log('Redirecting to onboarding');
          router.replace('/(onboarding)/skills' as any);
        } else {
          // Authenticated and onboarded, go to main app
          console.log('Redirecting to main app');
          router.replace('/(main)' as any);
        }
      };

      // Small delay for smoother transition
      setTimeout(redirectWithDelay, 500);
    }
  }, [isLoading, isAuthenticated, user, minTimeElapsed]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Resourcely</Text>
          <Text style={styles.subtitle}>Connect, Share, Grow</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Spinner 
            size="default" 
            variant="default" 
            color="#e0e7ff"
            showLabel={false}
          />
          <Text style={styles.loadingText}>
            {isLoading ? 'Checking authentication...' : 'Getting ready...'}
          </Text>
        </View>
      </Animated.View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
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
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 16,
    textAlign: 'center',
  },
});