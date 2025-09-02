import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  getPublicRooms,
  isUserMemberOfRoom,
  joinRoom,
  joinRoomByCode,
  Room
} from '@/lib/rooms';
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
  },
  joinSection: {
    marginVertical: 20,
  },
  joinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  joinToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
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
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  roomCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomAction: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roomActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ExploreScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
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
          { backgroundColor: colors.tint }
        ]}
        onPress={() => handleJoinRoom(room)}
      >
        <Text style={[
          styles.roomActionText,
          { color: colors.background }
        ]}>
          Join Room
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Rooms</Text>
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Rooms</Text>
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
              style={[styles.searchInput, { 
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30',
                color: colors.text,
                paddingLeft: 44,
              }]}
              placeholder="Search rooms by name, description, skills, or tools..."
              placeholderTextColor={colors.tabIconDefault}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icon 
              name={Search} 
              size={20} 
              color={colors.tabIconDefault}
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

        {/* Discover Rooms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery ? `Search Results (${filteredRooms.length})` : 'Discover Rooms'}
          </Text>
          {filteredRooms.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.tabIconDefault + '10' }]}>
              <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
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
