import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AvailabilityOnboardingScreen() {
  const params = useLocalSearchParams();
  const skills = params.skills ? JSON.parse(params.skills as string) : [];
  const tools = params.tools ? JSON.parse(params.tools as string) : [];
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding } = useAuth();

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Set your availability</Text>
            <Text style={styles.subtitle}>
              Let others know if you&apos;re available to help with projects or collaborations.
            </Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Your Profile Summary</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Skills ({skills.length})</Text>
              <View style={styles.tagsContainer}>
                {skills.slice(0, 5).map((skill: string) => (
                  <View key={skill} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
                {skills.length > 5 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{skills.length - 5} more</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tools ({tools.length})</Text>
              <View style={styles.tagsContainer}>
                {tools.slice(0, 5).map((tool: string) => (
                  <View key={tool} style={styles.tag}>
                    <Text style={styles.tagText}>{tool}</Text>
                  </View>
                ))}
                {tools.length > 5 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{tools.length - 5} more</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.availabilitySection}>
            <View style={styles.availabilityHeader}>
              <Text style={styles.availabilityTitle}>Available to help</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#d1d5db', true: '#34d399' }}
                thumbColor={isAvailable ? '#10b981' : '#9ca3af'}
              />
            </View>
            
            <Text style={styles.availabilityDescription}>
              {isAvailable 
                ? "You'll appear in search results and others can reach out to you for collaboration."
                : "You won't appear in search results, but you can still browse and connect with others."
              }
            </Text>
          </View>

          <View style={styles.completionSection}>
            <Text style={styles.completionTitle}>🎉 You&apos;re all set!</Text>
            <Text style={styles.completionDescription}>
              Your profile is ready. You can always update your skills, tools, and availability later in settings.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.completeButton, isLoading && styles.completeButtonDisabled]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            <Text style={styles.completeButtonText}>
              {isLoading ? 'Completing...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  summarySection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  availabilitySection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
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
    color: '#065f46',
  },
  availabilityDescription: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  completionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
