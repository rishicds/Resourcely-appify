import { default as Icon } from '@/components/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import {
    getPublicRooms,
    isUserMemberOfRoom,
    joinRoom,
    joinRoomByCode,
    Room
} from '@/lib/rooms';
import { clayMorphStyles, ClayTheme } from '@/theme/claymorph';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Hash, Search } from 'lucide-react-native';
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
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: ClayTheme.borderRadius.medium,
    gap: 8,
    backgroundColor: ClayTheme.colors.surface,
    ...ClayTheme.shadows.clay,
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
    ...clayMorphStyles.input,
    flex: 1,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
  },
  joinButton: {
    ...clayMorphStyles.button,
    backgroundColor: ClayTheme.colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    ...clayMorphStyles.input,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: ClayTheme.colors.text.primary,
  },
  emptyState: {
    ...clayMorphStyles.container,
    alignItems: 'center',
    backgroundColor: ClayTheme.colors.clay.light,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: ClayTheme.colors.text.secondary,
  },
  roomCard: {
    ...clayMorphStyles.card,
    backgroundColor: ClayTheme.colors.surface,
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
    color: ClayTheme.colors.text.primary,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
    color: ClayTheme.colors.text.secondary,
  },
  roomDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: ClayTheme.colors.text.secondary,
  },
  roomDetails: {
    marginBottom: 16,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ClayTheme.colors.surface,
    backgroundColor: ClayTheme.colors.clay.medium,
  },
  remainingAvatar: {
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    ...clayMorphStyles.chip,
    marginRight: 6,
    backgroundColor: ClayTheme.colors.clay.light,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: ClayTheme.colors.text.secondary,
  },
  roomAction: {
    ...clayMorphStyles.button,
    backgroundColor: ClayTheme.colors.primary,
    alignItems: 'center',
  },
  roomActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default function ExploreScreen() {
  const { user } = useAuth();
  
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const publicRoomsData = await getPublicRooms(user.$id);
      setPublicRooms(publicRoomsData);
      setFilteredRooms(publicRoomsData);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(publicRooms);
    } else {
      const filtered = publicRooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase())) ||
        room.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, publicRooms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
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
                backgroundColor: ClayTheme.colors.primary,
                marginLeft: index > 0 ? -8 : 0,
                zIndex: visibleCount - index,
              }
            ]}
          >
            <Text style={[styles.avatarText, { color: '#ffffff' }]}>
              {String.fromCharCode(65 + index)}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.avatar, styles.remainingAvatar, { backgroundColor: ClayTheme.colors.text.light }]}>
            <Text style={[styles.avatarText, { color: '#ffffff' }]}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderRoomCard = (room: Room) => (
    <View key={room.$id} style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.memberCount}>
          {room.memberCount} members
        </Text>
      </View>

      <Text style={styles.roomDescription}>
        {room.description}
      </Text>

      <View style={styles.roomDetails}>
        {renderMemberAvatars(room.memberCount)}

        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...room.tools, ...room.skills].slice(0, 4).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        style={styles.roomAction}
        onPress={() => handleJoinRoom(room)}
      >
        <Text style={styles.roomActionText}>
          Join Room
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Rooms</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Rooms</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.searchInput, { paddingLeft: 44 }]}
              placeholder="Search rooms by name, description, skills, or tools..."
              placeholderTextColor={ClayTheme.colors.text.light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icon 
              name={Search} 
              size={20} 
              color={ClayTheme.colors.text.light}
              style={{
                position: 'absolute',
                left: 14,
                top: 14,
              }}
            />
          </View>
        </View>

        {/* Join Room Section */}
        <View style={styles.joinSection}>
          <TouchableOpacity
            style={styles.joinToggle}
            onPress={() => setShowJoinInput(!showJoinInput)}
          >
            <Icon name={Hash} size={20} color={ClayTheme.colors.primary} />
            <Text style={styles.joinToggleText}>
              Join with Room Code
            </Text>
            <Icon 
              name={showJoinInput ? ChevronUp : ChevronDown} 
              size={16} 
              color={ClayTheme.colors.primary} 
            />
          </TouchableOpacity>

          {showJoinInput && (
            <View style={styles.joinInputContainer}>
              <TextInput
                style={styles.joinInput}
                placeholder="Enter room code"
                placeholderTextColor={ClayTheme.colors.text.light}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinWithCode}
              >
                <Text style={styles.joinButtonText}>
                  Join
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Discover Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredRooms.length})` : 'Discover Rooms'}
          </Text>
          {filteredRooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? `No rooms found matching "${searchQuery}". Try different keywords.`
                  : 'No public rooms available to join at the moment.'
                }
              </Text>
            </View>
          ) : (
            filteredRooms.map(renderRoomCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
