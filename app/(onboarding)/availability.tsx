import { useAuth } from '@/contexts/AuthContext';
import { ClayTheme, clayMorphStyles } from '@/theme/claymorph';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AvailabilityOnboardingScreen() {
  const params = useLocalSearchParams();
  const skills = params.skills ? JSON.parse(params.skills as string) : [];
  const tools = params.tools ? JSON.parse(params.tools as string) : [];
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { completeOnboarding } = useAuth();
  const animationRef = useRef<LottieView>(null);
  const successAnimationRef = useRef<LottieView>(null);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      // Add network connectivity check and retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await completeOnboarding({
            skills,
            tools,
            isAvailable,
          });
          break; // Success, exit retry loop
        } catch (error: any) {
          retryCount++;
          console.log(`Onboarding attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            throw error; // Re-throw after max retries
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      // Show success animation
      setIsLoading(false);
      setShowSuccess(true);
      
    } catch (error: any) {
      console.error('Failed to complete onboarding after retries:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to complete setup. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: handleComplete },
          { text: 'Skip for now', onPress: () => router.replace('/explore' as any) }
        ]
      );
      setIsLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    // Wait a bit after animation finishes then redirect
    setTimeout(() => {
      router.replace('/explore' as any);
    }, 500); // 0.5 second buffer after animation completes
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={ClayTheme.colors.gradient.clay}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.animationContainer}>
                <LottieView
                  ref={animationRef}
                  source={require('@/assets/lottie/skills.json')}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              </View>
              <Text style={styles.title}>Set your availability</Text>
              <Text style={styles.subtitle}>
                Let others know if you&apos;re available to help with projects or collaborations.
              </Text>
            </View>

            <View style={[styles.summarySection, clayMorphStyles.card]}>
              <Text style={styles.summaryTitle}>Your Profile Summary</Text>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Skills ({skills.length})</Text>
                <View style={styles.tagsContainer}>
                  {skills.slice(0, 5).map((skill: string) => (
                    <View key={skill} style={[styles.tag, clayMorphStyles.chip]}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  ))}
                  {skills.length > 5 && (
                    <View style={[styles.tag, clayMorphStyles.chip]}>
                      <Text style={styles.tagText}>+{skills.length - 5} more</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Tools ({tools.length})</Text>
                <View style={styles.tagsContainer}>
                  {tools.slice(0, 5).map((tool: string) => (
                    <View key={tool} style={[styles.tag, clayMorphStyles.chip]}>
                      <Text style={styles.tagText}>{tool}</Text>
                    </View>
                  ))}
                  {tools.length > 5 && (
                    <View style={[styles.tag, clayMorphStyles.chip]}>
                      <Text style={styles.tagText}>+{tools.length - 5} more</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.availabilitySection, clayMorphStyles.card]}>
              <View style={styles.availabilityHeader}>
                <Text style={styles.availabilityTitle}>Available to help</Text>
                <Switch
                  value={isAvailable}
                  onValueChange={setIsAvailable}
                  trackColor={{ false: ClayTheme.colors.clay.medium, true: ClayTheme.colors.accent }}
                  thumbColor={isAvailable ? '#fff' : '#fff'}
                />
              </View>
              
              <Text style={styles.availabilityDescription}>
                {isAvailable 
                  ? "You'll appear in search results and others can reach out to you for collaboration."
                  : "You won't appear in search results, but you can still browse and connect with others."
                }
              </Text>

              <View style={styles.completionSection}>
                <Text style={styles.completionTitle}>🎉 You&apos;re all set!</Text>
                <Text style={styles.completionDescription}>
                  Your profile is ready. You can always update your skills, tools, and availability later in settings.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.backButton, clayMorphStyles.button]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.completeButton, clayMorphStyles.button]}
              onPress={handleComplete}
              disabled={isLoading}
            >
              <LinearGradient
                colors={ClayTheme.colors.gradient.primary}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      
      {/* Success Animation Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <LottieView
              ref={successAnimationRef}
              source={require('@/assets/lottie/Success.json')}
              autoPlay
              loop={false}
              style={styles.successAnimation}
              onAnimationFinish={handleAnimationFinish}
            />
            <Text style={styles.successTitle}>🎉 Setup Complete!</Text>
            <Text style={styles.successMessage}>
              Welcome to Resourcely! Let&apos;s explore what&apos;s available.
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  animationContainer: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: ClayTheme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
    marginBottom: 20,
  },
  summaryItem: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: ClayTheme.colors.primary,
    fontWeight: '500',
  },
  availabilitySection: {
    marginBottom: 24,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  availabilityDescription: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  completionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: ClayTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: ClayTheme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 2,
    borderRadius: ClayTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: ClayTheme.colors.background,
    borderRadius: ClayTheme.borderRadius.large,
    padding: 32,
    margin: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  successAnimation: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: ClayTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
