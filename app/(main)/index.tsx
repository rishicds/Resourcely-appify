import { default as Icon } from '@/components/SafeIcon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Hash, LogOut, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

interface Room {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  tools: string[];
  skills: string[];
  isJoined: boolean;
  createdAt: string;
}

export default function RoomsMainScreen() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  // Handle sign out with navigation
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Move mock data to useMemo to avoid dependencies issues
  const mockRooms: Room[] = useMemo(() => [
    {
      id: '1',
      name: 'React Developers',
      description: 'A room for React developers to collaborate and share knowledge',
      memberCount: 24,
      members: [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Mike Johnson' },
      ],
      tools: ['React', 'TypeScript', 'Node.js'],
      skills: ['Frontend', 'JavaScript', 'Web Development'],
      isJoined: true,
      createdAt: '2025-01-15',
    },
    {
      id: '2',
      name: 'UI/UX Design Hub',
      description: 'Creative space for designers to collaborate on projects',
      memberCount: 18,
      members: [
        { id: '4', name: 'Sarah Wilson' },
        { id: '5', name: 'Tom Brown' },
      ],
      tools: ['Figma', 'Adobe XD', 'Sketch'],
      skills: ['UI Design', 'UX Research', 'Prototyping'],
      isJoined: false,
      createdAt: '2025-01-10',
    },
    {
      id: '3',
      name: 'Mobile App Builders',
      description: 'Building amazing mobile experiences together',
      memberCount: 31,
      members: [
        { id: '6', name: 'Alex Chen' },
        { id: '7', name: 'Lisa Davis' },
        { id: '8', name: 'Ryan Garcia' },
      ],
      tools: ['React Native', 'Flutter', 'Swift'],
      skills: ['Mobile Development', 'iOS', 'Android'],
      isJoined: true,
      createdAt: '2025-01-05',
    },
  ], []);

  const loadRooms = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setRooms(mockRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    }
  }, [mockRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = () => {
    // Navigate to create room screen
    Alert.alert('Create Room', 'Create room functionality coming soon!');
  };

  const handleJoinRoom = async (room: Room) => {
    if (room.isJoined) {
      // Enter room
      Alert.alert('Enter Room', `Entering ${room.name}...`);
      // TODO: Uncomment when room page is ready
      // router.push(`/(main)/room/${room.id}` as any);
    } else {
      // Join room
      try {
        // TODO: Implement join room API
        Alert.alert('Success', `Joined ${room.name}!`);
        // Update local state
        setRooms(prev => prev.map(r => 
          r.id === room.id ? { ...r, isJoined: true } : r
        ));
      } catch (error) {
        console.error('Failed to join room:', error);
        Alert.alert('Error', 'Failed to join room');
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    try {
      // TODO: Implement join with code API
      Alert.alert('Success', 'Joined room successfully!');
      setJoinCode('');
      setShowJoinInput(false);
      await loadRooms();
    } catch (error) {
      console.error('Failed to join with code:', error);
      Alert.alert('Error', 'Invalid room code');
    }
  };

  const renderMemberAvatars = (members: Room['members']) => {
    const visibleMembers = members.slice(0, 3);
    const remainingCount = Math.max(0, members.length - 3);

    return (
      <View style={styles.avatarsContainer}>
        {visibleMembers.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.avatar,
              { 
                backgroundColor: colors.tint,
                marginLeft: index > 0 ? -8 : 0,
                zIndex: visibleMembers.length - index,
              }
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {member.name.charAt(0).toUpperCase()}
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
    <View key={room.id} style={[styles.roomCard, { backgroundColor: colors.background }]}>
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
        {renderMemberAvatars(room.members)}

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
            backgroundColor: room.isJoined ? colors.tint : colors.tint + '20',
          }
        ]}
        onPress={() => handleJoinRoom(room)}
      >
        <Text style={[
          styles.roomActionText,
          { color: room.isJoined ? colors.background : colors.tint }
        ]}>
          {room.isJoined ? 'Enter Room' : 'Join Room'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
                placeholder="Enter room code or invite link"
                placeholderTextColor={colors.tabIconDefault}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="none"
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rooms</Text>
          {rooms.filter(room => room.isJoined).map(renderRoomCard)}
        </View>

        {/* Discover Rooms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Discover Rooms</Text>
          {rooms.filter(room => !room.isJoined).map(renderRoomCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
