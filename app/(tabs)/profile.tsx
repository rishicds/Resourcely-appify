import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserProfileCard } from '@/components/UserProfileCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { clayMorphStyles } from '@/theme/claymorph';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
              // Navigate to login page after successful sign out
              router.replace('/(auth)/login' as any);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile' as any);
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>No user data available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <View style={[clayMorphStyles.container, { margin: 20 }]}> 
        {/* Header */}
        <View style={[clayMorphStyles.header, {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          backgroundColor: 'transparent',
          shadowColor: 'transparent',
        }]}> 
          <ThemedText type="title">Profile</ThemedText>
        </View>

        {/* Profile Info */}
        <UserProfileCard 
          user={user} 
          onEdit={handleEditProfile}
          showEditButton={true}
        />

        {/* Additional Profile Sections */}
        <View style={[clayMorphStyles.card, { marginTop: 20, marginBottom: 20 }]}> 
          <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
            Account Information
          </ThemedText>
          <View style={{ marginBottom: 12 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
              Email
            </ThemedText>
            <ThemedText style={{ fontSize: 16 }}>
              {user.email}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
              Member Since
            </ThemedText>
            <ThemedText style={{ fontSize: 16 }}>
              {new Date(user.$createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={[
            clayMorphStyles.button,
            {
              backgroundColor: '#ef4444',
              marginTop: 20,
              opacity: isSigningOut ? 0.7 : 1,
              alignItems: 'center',
            },
          ]}
        >
          <ThemedText style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
