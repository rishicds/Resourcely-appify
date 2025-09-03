import { default as Icon } from '@/components/SafeIcon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  getUserRooms,
  isUserMemberOfRoom,
  joinRoom,
  joinRoomByCode,
  Room
} from '@/lib/rooms';
import { clayMorphStyles, ClayTheme } from '@/theme/claymorph';
import { router, useFocusEffect } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronDown, ChevronUp, Hash, LogOut, Plus, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClayTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ClayTheme.colors.surface,
    ...ClayTheme.shadows.clay,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...clayMorphStyles.button,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: ClayTheme.colors.text.secondary,
  },
  joinSection: {
    marginVertical: 20,
  },
  joinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
    ...clayMorphStyles.button,
    ...ClayTheme.shadows.claySubtle,
  },
  joinToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: ClayTheme.colors.text.primary,
  },
  joinInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  joinInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    // backgroundColor removed to avoid duplicate property
    ...clayMorphStyles.input,
    color: ClayTheme.colors.text.primary,
    ...ClayTheme.shadows.clayInset,
  },
  joinButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    ...clayMorphStyles.button,
    backgroundColor: ClayTheme.colors.primary,
    justifyContent: 'center',
    ...ClayTheme.shadows.clay,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    ...clayMorphStyles.card,
    ...ClayTheme.shadows.clayInset,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  roomCard: {
    ...clayMorphStyles.card,
    marginBottom: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  roomDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  roomDetails: {
    marginBottom: 16,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: ClayTheme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ClayTheme.colors.surface,
    backgroundColor: ClayTheme.colors.clay.medium,
    ...ClayTheme.shadows.claySubtle,
  },
  remainingAvatar: {
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: ClayTheme.borderRadius.medium,
    marginRight: 8,
    backgroundColor: ClayTheme.colors.clay.medium,
    ...ClayTheme.shadows.claySubtle,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomAction: {
    paddingVertical: 14,
    alignItems: 'center',
    ...clayMorphStyles.button,
    ...ClayTheme.shadows.claySubtle,
  },
  roomActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function RoomsMainScreen() {
  const { signOut, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [userRooms, setUserRooms] = useState<Room[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle sign out with navigation
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug user state
  console.log('RoomsMainScreen render - User:', user ? `${user.name} (${user.$id})` : 'null');
  console.log('RoomsMainScreen render - UserRooms count:', userRooms.length);
  console.log('RoomsMainScreen render - Loading:', loading);

  const loadRooms = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping room loading');
      setLoading(false);
      return;
    }

    console.log('Loading rooms for user:', user.$id, user.name);
    try {
      setLoading(true);
      console.log('Calling getUserRooms...');
      const userRoomsData = await getUserRooms(user.$id);
      console.log('getUserRooms returned:', userRoomsData);
      console.log('Number of rooms:', userRoomsData.length);
      console.log('Room details:', userRoomsData.map(r => ({ id: r.$id, name: r.name })));
      
      setUserRooms(userRoomsData);
      console.log('Updated userRooms state');
    } catch (error) {
      console.error('Failed to load rooms:', error);
      Alert.alert('Error', `Failed to load rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('useEffect triggered - calling loadRooms');
    loadRooms();
  }, [loadRooms]);

  // Debug effect to track user and userRooms changes
  useEffect(() => {
    console.log('User changed:', user ? `${user.name} (${user.$id})` : 'null');
  }, [user]);

  useEffect(() => {
    console.log('UserRooms changed:', userRooms.length, userRooms.map(r => r.name));
  }, [userRooms]);

  // Automatically refresh when the screen is focused (user accesses this page)
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - refreshing rooms data');
      loadRooms();
    }, [loadRooms])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = () => {
    router.push('/create-room' as any);
  };

  const handleJoinRoom = async (room: Room) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a room');
      return;
    }

    try {
      // Check if user is already a member
      const isMember = await isUserMemberOfRoom(room.$id, user.$id);
      
      if (isMember) {
        // Enter room
        Alert.alert('Enter Room', `Entering ${room.name}...`);
        router.push(`/(main)/room/${room.$id}` as any);
      } else {
        // Join room
        await joinRoom(room.$id, user.$id);
        Alert.alert('Success', `Joined ${room.name}!`);
        await loadRooms(); // Refresh rooms list
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      Alert.alert('Error', 'Failed to join room');
    }
  };

  const handleJoinWithCode = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a room');
      return;
    }

    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    try {
      const room = await joinRoomByCode(joinCode.trim(), user.$id);
      Alert.alert('Success', `Joined ${room.name} successfully!`);
      setJoinCode('');
      setShowJoinInput(false);
      await loadRooms();
    } catch (error) {
      console.error('Failed to join with code:', error);
      Alert.alert('Error', 'Invalid room code or you are already a member');
    }
  };

  const renderMemberAvatars = (memberCount: number) => {
    // Generate placeholder avatars based on member count
    const visibleCount = Math.min(memberCount, 3);
    const remainingCount = Math.max(0, memberCount - 3);

    return (
      <View style={styles.avatarsContainer}>
        {Array.from({ length: visibleCount }, (_, index) => (
          <View
            key={index}
            style={[
              styles.avatar,
              { 
                backgroundColor: colors.tint,
                marginLeft: index > 0 ? -8 : 0,
                zIndex: visibleCount - index,
              }
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {String.fromCharCode(65 + index)}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.avatar, styles.remainingAvatar, { backgroundColor: colors.tabIconDefault }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const isRoomJoined = (room: Room): boolean => {
    return userRooms.some(userRoom => userRoom.$id === room.$id);
  };

  const renderRoomCard = (room: Room) => (
    <View key={room.$id} style={[styles.roomCard, { backgroundColor: colors.background }]}>
      <View style={styles.roomHeader}>
        <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
        <Text style={[styles.memberCount, { color: colors.tabIconDefault }]}>
          {room.memberCount} members
        </Text>
      </View>

      <Text style={[styles.roomDescription, { color: colors.tabIconDefault }]}>
        {room.description}
      </Text>

      <View style={styles.roomDetails}>
        {renderMemberAvatars(room.memberCount)}

        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...room.tools, ...room.skills].slice(0, 4).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.roomAction,
          {
            backgroundColor: isRoomJoined(room) ? colors.tint : colors.tint + '20',
          }
        ]}
        onPress={() => handleJoinRoom(room)}
      >
        <Text style={[
          styles.roomActionText,
          { color: isRoomJoined(room) ? colors.background : colors.tint }
        ]}>
          {isRoomJoined(room) ? 'Enter Room' : 'Join Room'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Rooms</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.tint }]}
              onPress={handleCreateRoom}
            >
              <Icon name={Plus} size={20} color={colors.background} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.tabIconDefault + '20' }]}
              onPress={handleSignOut}
            >
              <Icon name={LogOut} size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
            Loading rooms... {user ? `for ${user.name}` : '(no user)'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Rooms</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.tabIconDefault + '20' }]}
              onPress={handleSignOut}
            >
              <Icon name={LogOut} size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
            Please log in to view your rooms
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rooms</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.tint }]}
            onPress={handleCreateRoom}
          >
            <Icon name={Plus} size={20} color={colors.background} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.tabIconDefault + '20' }]}
            onPress={handleSignOut}
          >
            <Icon name={LogOut} size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Group Lottie Animation */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <LottieView
            source={require('@/assets/lottie/group.json')}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        </View>
        {/* Join Room Section */}
        <View style={styles.joinSection}>
          <TouchableOpacity
            style={[styles.joinToggle, { backgroundColor: colors.tint + '10' }]}
            onPress={() => setShowJoinInput(!showJoinInput)}
          >
            <Icon name={Hash} size={20} color={colors.tint} />
            <Text style={[styles.joinToggleText, { color: colors.tint }]}>
              Join with Room Code
            </Text>
            <Icon 
              name={showJoinInput ? ChevronUp : ChevronDown} 
              size={16} 
              color={colors.tint} 
            />
          </TouchableOpacity>

          {showJoinInput && (
            <View style={styles.joinInputContainer}>
              <TextInput
                style={[styles.joinInput, { 
                  backgroundColor: colors.background,
                  borderColor: colors.tabIconDefault + '30',
                  color: colors.text 
                }]}
                placeholder="Enter room code"
                placeholderTextColor={colors.tabIconDefault}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: colors.tint }]}
                onPress={handleJoinWithCode}
              >
                <Text style={[styles.joinButtonText, { color: colors.background }]}>
                  Join
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Your Rooms */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Your Rooms ({userRooms.length})</Text>
            <TouchableOpacity
              onPress={loadRooms}
              style={[styles.headerButton, { backgroundColor: colors.tint + '20' }]}
            >
              <Text style={[{ color: colors.tint, fontSize: 12, fontWeight: '600' }]}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {userRooms.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.tabIconDefault + '10' }]}>
              <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
                You haven&apos;t joined any rooms yet. Create one or join with a room code!
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.tabIconDefault, fontSize: 12, marginTop: 8 }]}>
                DEBUG: User={user?.name || 'null'}, Loading={loading.toString()}
              </Text>
            </View>
          ) : (
            <>
              
              {userRooms.map(renderRoomCard)}
            </>
          )}
        </View>

        {/* Discover Rooms Button */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Discover New Rooms</Text>
          <TouchableOpacity
            style={[
              styles.roomAction,
              {
                backgroundColor: colors.tint + '10',
                borderWidth: 2,
                borderColor: colors.tint,
                borderStyle: 'dashed',
                paddingVertical: 20,
              }
            ]}
            onPress={() => router.push('/(tabs)/explore' as any)}
          >
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Icon name={Search} size={24} color={colors.tint} />
              <Text style={[
                styles.roomActionText,
                { color: colors.tint }
              ]}>
                Explore Public Rooms
              </Text>
              <Text style={[
                styles.emptyStateText,
                { color: colors.tabIconDefault, fontSize: 14 }
              ]}>
                Find and join rooms based on your interests
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}