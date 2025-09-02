import { BroadcastModal, RequestModal } from '@/components/room/RoomModals';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { Broadcast, createBroadcast, getRoomBroadcasts } from '@/lib/broadcasts';
import { acceptRequest, createRequest, getRoomRequests, Request } from '@/lib/requests';
import { getRoomById } from '@/lib/rooms';
import { getAvailableRoomUsers, searchUsers, User } from '@/lib/search';
import { ClayTheme } from '@/theme/claymorph';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageSquare, Search, Trophy, Zap } from 'lucide-react-native';
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

interface RoomMember extends User {
  helpScore: number;
  lastActive: string;
}

interface ActiveBroadcast extends Broadcast {
  timePosted: string;
}

interface Room {
  $id: string;
  name: string;
  description: string;
  memberCount: number;
}

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'leaderboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Real data state
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [broadcasts, setBroadcasts] = useState<ActiveBroadcast[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  
  // Modal states
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Load room data
  const loadRoomData = useCallback(async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      
      // Load room details
      const room = await getRoomById(id as string);
      setRoomData(room);
      
      // Load room members
      const roomMembers = await getAvailableRoomUsers(id as string);
      const membersWithScores = roomMembers.map(member => ({
        ...member,
        helpScore: Math.floor(Math.random() * 200) + 50, // TODO: Calculate real help score
        lastActive: member.lastActive || new Date().toISOString(),
      }));
      setMembers(membersWithScores);
      
      // Load broadcasts
      const roomBroadcasts = await getRoomBroadcasts(id as string);
      const formattedBroadcasts = roomBroadcasts.map(broadcast => ({
        ...broadcast,
        timePosted: formatTimeAgo(broadcast.createdAt),
      }));
      setBroadcasts(formattedBroadcasts);
      
      // Load requests
      const roomRequests = await getRoomRequests(id as string);
      setRequests(roomRequests);
      
    } catch (error) {
      console.error('Error loading room data:', error);
      Alert.alert('Error', 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoomData();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    if (!id) return;
    
    try {
      const searchResults = await searchUsers(query, {
        roomId: id as string,
        isAvailable: true,
      });
      
      const membersWithScores = searchResults.map(member => ({
        ...member,
        helpScore: Math.floor(Math.random() * 200) + 50,
        lastActive: member.lastActive || new Date().toISOString(),
      }));
      
      setMembers(membersWithScores);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const handleCreateBroadcast = async (title: string, description: string, type: 'help' | 'collaboration' | 'announcement') => {
    if (!user || !id) return;
    
    try {
      await createBroadcast({
        title,
        description,
        type,
        authorId: user.$id,
        roomId: id as string,
      });
      
      await loadRoomData(); // Refresh data
      setShowBroadcastModal(false);
    } catch (error) {
      console.error('Error creating broadcast:', error);
      Alert.alert('Error', 'Failed to create broadcast');
    }
  };

  const handleCreateRequest = async (title: string, description: string, skillsNeeded: string[]) => {
    if (!user || !id) return;
    
    try {
      await createRequest({
        title,
        description,
        requesterId: user.$id,
        roomId: id as string,
        skillsNeeded,
      });
      
      await loadRoomData(); // Refresh data
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to create request');
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
    member.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading room...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDashboard = () => (
    <View style={styles.content}>
      {/* Active Broadcasts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Broadcasts</Text>
          <TouchableOpacity 
            style={styles.clayButton}
            onPress={() => setShowBroadcastModal(true)}
          >
            <Text style={styles.clayButtonText}>Broadcast</Text>
          </TouchableOpacity>
        </View>
        {broadcasts.map(broadcast => (
          <View key={broadcast.$id} style={styles.clayCard}>
            <View style={styles.broadcastHeader}>
              <View style={[styles.tag, { backgroundColor: ClayTheme.colors.clay.medium }]}>
                <Text style={[styles.tagText, { color: ClayTheme.colors.text.secondary }]}>
                  {broadcast.type}
                </Text>
              </View>
              <Text style={styles.timeText}>{broadcast.timePosted}</Text>
            </View>
            <Text style={styles.cardTitle}>{broadcast.title}</Text>
            <Text style={styles.cardDescription}>{broadcast.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.authorText}>by User {broadcast.authorId.substring(0, 8)}</Text>
              <Text style={styles.responseText}>{broadcast.responses} responses</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Search Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room Members</Text>
        <View style={styles.claySearchContainer}>
          <Icon name={Search} size={20} color={ClayTheme.colors.text.light} />
          <TextInput
            style={styles.claySearchInput}
            placeholder="Search members..."
            placeholderTextColor={ClayTheme.colors.text.light}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                handleSearch(text);
              } else {
                loadRoomData();
              }
            }}
          />
        </View>
        
        {/* Members List */}
        {filteredMembers.map(member => (
          <View key={member.$id} style={styles.clayCard}>
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <Text style={styles.cardTitle}>{member.name}</Text>
                <View style={styles.memberStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: member.isAvailable ? ClayTheme.colors.accent : ClayTheme.colors.text.light }
                  ]} />
                  <Text style={styles.statusText}>
                    {member.isAvailable ? 'Available' : 'Busy'} • {formatTimeAgo(member.lastActive)}
                  </Text>
                </View>
              </View>
              <Text style={styles.scoreText}>{member.helpScore} pts</Text>
            </View>
            
            <View style={styles.tagsContainer}>
              <Text style={styles.tagLabel}>Skills:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {member.skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.tagsContainer}>
              <Text style={styles.tagLabel}>Tools:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {member.tools.map((tool, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tool}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRequests = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Help Requests</Text>
          <TouchableOpacity 
            style={styles.clayButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.clayButtonText}>Request Help</Text>
          </TouchableOpacity>
        </View>
        {requests.map(request => (
          <View key={request.$id} style={styles.clayCard}>
            <View style={styles.broadcastHeader}>
              <View style={[styles.tag, { backgroundColor: ClayTheme.colors.clay.medium }]}>
                <Text style={[styles.tagText, { color: ClayTheme.colors.text.secondary }]}>
                  {request.status}
                </Text>
              </View>
              <Text style={styles.timeText}>{formatTimeAgo(request.createdAt)}</Text>
            </View>
            
            <Text style={styles.cardTitle}>{request.title}</Text>
            <Text style={styles.cardDescription}>{request.description}</Text>
            
            <View style={styles.tagsContainer}>
              {request.skillsNeeded.map((skill: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.authorText}>by User {request.requesterId.substring(0, 8)}</Text>
              {request.helperId && (
                <Text style={styles.responseText}>helping: User {request.helperId.substring(0, 8)}</Text>
              )}
            </View>
            
            {request.status === 'pending' && request.requesterId !== user?.$id && (
              <TouchableOpacity 
                style={styles.clayButton}
                onPress={() => handleAcceptRequest(request.$id)}
              >
                <Text style={styles.clayButtonText}>Accept Request</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help Leaderboard</Text>
        {members
          .sort((a, b) => b.helpScore - a.helpScore)
          .map((member, index) => (
            <View key={member.$id} style={styles.clayCard}>
              <View style={styles.leaderboardRow}>
                <Text style={styles.rankText}>#{index + 1}</Text>
                <View style={styles.memberInfo}>
                  <Text style={styles.cardTitle}>{member.name}</Text>
                  <Text style={styles.scoreText}>{member.helpScore} help points</Text>
                </View>
                <Icon name={Trophy} size={24} color={index < 3 ? ClayTheme.colors.secondary : ClayTheme.colors.text.light} />
              </View>
            </View>
          ))}
      </View>
    </View>
  );

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      await acceptRequest(requestId, user.$id);
      await loadRoomData(); // Refresh data
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name={ArrowLeft} size={24} color={ClayTheme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{roomData?.name || 'Loading...'}</Text>
          <Text style={styles.headerSubtitle}>{roomData?.memberCount || 0} members</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Icon 
            name={Zap} 
            size={20} 
            color={activeTab === 'dashboard' ? ClayTheme.colors.primary : ClayTheme.colors.text.light} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'dashboard' ? ClayTheme.colors.primary : ClayTheme.colors.text.light }
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Icon 
            name={MessageSquare} 
            size={20} 
            color={activeTab === 'requests' ? ClayTheme.colors.primary : ClayTheme.colors.text.light} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'requests' ? ClayTheme.colors.primary : ClayTheme.colors.text.light }
          ]}>
            Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Icon 
            name={Trophy} 
            size={20} 
            color={activeTab === 'leaderboard' ? ClayTheme.colors.primary : ClayTheme.colors.text.light} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'leaderboard' ? ClayTheme.colors.primary : ClayTheme.colors.text.light }
          ]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </ScrollView>

      {/* Modals */}
      <BroadcastModal
        visible={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSubmit={handleCreateBroadcast}
      />
      
      <RequestModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleCreateRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClayTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ClayTheme.spacing.lg,
    paddingVertical: ClayTheme.spacing.md,
    backgroundColor: ClayTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ClayTheme.colors.clay.medium,
  },
  backButton: {
    marginRight: ClayTheme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    color: ClayTheme.colors.text.secondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: ClayTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ClayTheme.colors.clay.medium,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ClayTheme.spacing.md,
    gap: ClayTheme.spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: ClayTheme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: ClayTheme.spacing.lg,
  },
  section: {
    marginBottom: ClayTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: ClayTheme.spacing.md,
    color: ClayTheme.colors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ClayTheme.spacing.md,
  },
  clayCard: {
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.large,
    padding: ClayTheme.spacing.lg,
    marginBottom: ClayTheme.spacing.md,
    ...ClayTheme.shadows.claySubtle,
  },
  clayButton: {
    backgroundColor: ClayTheme.colors.primary,
    borderRadius: ClayTheme.borderRadius.medium,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.sm,
    ...ClayTheme.shadows.claySubtle,
  },
  clayButtonText: {
    color: ClayTheme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  claySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.medium,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.sm,
    marginBottom: ClayTheme.spacing.md,
    gap: ClayTheme.spacing.sm,
    ...ClayTheme.shadows.claySubtle,
  },
  claySearchInput: {
    flex: 1,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
  },
  broadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ClayTheme.spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: ClayTheme.spacing.xs,
    color: ClayTheme.colors.text.primary,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: ClayTheme.spacing.md,
    color: ClayTheme.colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: ClayTheme.colors.text.light,
  },
  authorText: {
    fontSize: 12,
    color: ClayTheme.colors.text.light,
  },
  responseText: {
    fontSize: 12,
    fontWeight: '500',
    color: ClayTheme.colors.primary,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ClayTheme.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ClayTheme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: ClayTheme.colors.text.light,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: ClayTheme.colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ClayTheme.spacing.sm,
    gap: ClayTheme.spacing.sm,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    color: ClayTheme.colors.text.light,
  },
  tag: {
    backgroundColor: ClayTheme.colors.clay.light,
    paddingHorizontal: ClayTheme.spacing.sm,
    paddingVertical: ClayTheme.spacing.xs,
    borderRadius: ClayTheme.borderRadius.small,
    marginRight: ClayTheme.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: ClayTheme.colors.text.secondary,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ClayTheme.spacing.md,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ClayTheme.colors.primary,
    minWidth: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: ClayTheme.colors.text.primary,
  },
});
