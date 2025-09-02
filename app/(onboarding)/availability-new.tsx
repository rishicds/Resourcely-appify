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
  const { completeOnboarding } = useAuth();
  const animationRef = useRef<LottieView>(null);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      await completeOnboarding({
        skills,
        tools,
        isAvailable,
      });
      
      // Navigate to main app
      router.replace('/explore' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
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
});
