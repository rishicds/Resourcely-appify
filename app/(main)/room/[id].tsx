import { BroadcastModal, RequestModal } from '@/components/room/RoomModals';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Broadcast, createBroadcast, getRoomBroadcasts } from '@/lib/broadcasts';
import { acceptRequest, createRequest, getRoomRequests, Request } from '@/lib/requests';
import { getRoomById } from '@/lib/rooms';
import { getAvailableRoomUsers, searchUsers, User } from '@/lib/search';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Copy, MessageSquare, Search, Trophy, Zap } from 'lucide-react-native';
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'leaderboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading room...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDashboard = () => (
    <>
      {/* Active Broadcasts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Broadcasts</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowBroadcastModal(true)}
          >
            <Text style={styles.addButtonText}>Broadcast</Text>
          </TouchableOpacity>
        </View>
        {broadcasts.map(broadcast => (
          <View key={broadcast.$id} style={[styles.broadcastCard, { backgroundColor: colors.background }]}>
            <View style={styles.broadcastHeader}>
              <View style={[
                styles.broadcastType,
                { backgroundColor: broadcast.type === 'help' ? '#FF6B6B20' : '#4ECDC420' }
              ]}>
                <Text style={[
                  styles.broadcastTypeText,
                  { color: broadcast.type === 'help' ? '#FF6B6B' : '#4ECDC4' }
                ]}>
                  {broadcast.type}
                </Text>
              </View>
              <Text style={[styles.broadcastTime, { color: colors.tabIconDefault }]}>
                {broadcast.timePosted}
              </Text>
            </View>
            <Text style={[styles.broadcastTitle, { color: colors.text }]}>{broadcast.title}</Text>
            <Text style={[styles.broadcastDescription, { color: colors.tabIconDefault }]}>
              {broadcast.description}
            </Text>
            <View style={styles.broadcastFooter}>
              <Text style={[styles.broadcastAuthor, { color: colors.tabIconDefault }]}>
                by User {broadcast.authorId.substring(0, 8)}
              </Text>
              <Text style={[styles.broadcastResponses, { color: colors.tint }]}>
                {broadcast.responses} responses
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Search/Filter Members */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Room Members</Text>
        <View style={styles.searchContainer}>
          <Icon name={Search} size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search members by name, skills, or tools..."
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                handleSearch(text);
              } else {
                loadRoomData(); // Reset to original data
              }
            }}
          />
        </View>
        
        {/* Highlighted Members */}
        {filteredMembers.map(member => (
          <View key={member.$id} style={[styles.memberCard, { backgroundColor: colors.background }]}>
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                <View style={styles.memberStatus}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: member.isAvailable ? '#4ECDC4' : colors.tabIconDefault }
                  ]} />
                  <Text style={[styles.statusText, { color: colors.tabIconDefault }]}>
                    {member.isAvailable ? 'Available' : 'Busy'} • {formatTimeAgo(member.lastActive)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.helpScore, { color: colors.tint }]}>
                {member.helpScore} pts
              </Text>
            </View>
            
            <View style={styles.memberTags}>
              <Text style={[styles.tagLabel, { color: colors.tabIconDefault }]}>Skills:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {member.skills.map((skill, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.tint }]}>{skill}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.memberTags}>
              <Text style={[styles.tagLabel, { color: colors.tabIconDefault }]}>Tools:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {member.tools.map((tool, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tabIconDefault + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.tabIconDefault }]}>{tool}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderRequests = () => (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Help Requests</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.addButtonText}>Request Help</Text>
          </TouchableOpacity>
        </View>
        {requests.map(request => (
          <View key={request.$id} style={[styles.requestCard, { backgroundColor: colors.background }]}>
            <View style={styles.requestHeader}>
              <View style={[
                styles.requestStatus,
                { 
                  backgroundColor: request.status === 'pending' ? '#FFB84D20' : 
                                  request.status === 'accepted' ? '#4ECDC420' : '#FF6B6B20'
                }
              ]}>
                <Text style={[
                  styles.requestStatusText,
                  { 
                    color: request.status === 'pending' ? '#FFB84D' : 
                           request.status === 'accepted' ? '#4ECDC4' : '#FF6B6B'
                  }
                ]}>
                  {request.status}
                </Text>
              </View>
              <Text style={[styles.requestTime, { color: colors.tabIconDefault }]}>
                {formatTimeAgo(request.createdAt)}
              </Text>
            </View>
            
            <Text style={[styles.requestTitle, { color: colors.text }]}>{request.title}</Text>
            <Text style={[styles.requestDescription, { color: colors.tabIconDefault }]}>
              {request.description}
            </Text>
            
            <View style={styles.requestSkills}>
              {request.skillsNeeded.map((skill: string, index: number) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.tint }]}>{skill}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.requestFooter}>
              <Text style={[styles.requestRequester, { color: colors.tabIconDefault }]}>
                by User {request.requesterId.substring(0, 8)}
              </Text>
              {request.helperId && (
                <Text style={[styles.requestHelper, { color: colors.tint }]}>
                  helping: User {request.helperId.substring(0, 8)}
                </Text>
              )}
            </View>
            
            {request.status === 'pending' && request.requesterId !== user?.$id && (
              <TouchableOpacity 
                style={[styles.acceptButton, { backgroundColor: colors.tint }]}
                onPress={() => handleAcceptRequest(request.$id)}
              >
                <Text style={styles.acceptButtonText}>Accept Request</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </>
  );

  const renderLeaderboard = () => (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Help Leaderboard</Text>
        {members
          .sort((a, b) => b.helpScore - a.helpScore)
          .map((member, index) => (
            <View key={member.$id} style={[styles.leaderboardCard, { backgroundColor: colors.background }]}>
              <View style={styles.leaderboardRank}>
                <Text style={[styles.rankNumber, { color: colors.tint }]}>#{index + 1}</Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={[styles.leaderboardName, { color: colors.text }]}>{member.name}</Text>
                <Text style={[styles.leaderboardScore, { color: colors.tint }]}>
                  {member.helpScore} help points
                </Text>
              </View>
              <Icon name={Trophy} size={24} color={index < 3 ? '#FFD700' : colors.tabIconDefault} />
            </View>
          ))}
      </View>
    </>
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

  const handleCopyRoomCode = async () => {
    if (!id) return;
    
    try {
      await Clipboard.setStringAsync(id as string);
      setCopiedRoomCode(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedRoomCode(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying room code:', error);
      Alert.alert('Error', 'Failed to copy room code');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name={ArrowLeft} size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{roomData?.name || 'Loading...'}</Text>
          <View style={styles.roomCodeContainer}>
            <Text style={[styles.roomCodeLabel, { color: colors.tabIconDefault }]}>Room Code: </Text>
            <Text style={[styles.roomCodeText, { color: colors.tint }]}>{id || 'Loading...'}</Text>
            <TouchableOpacity 
              onPress={handleCopyRoomCode}
              style={[styles.copyButton, { backgroundColor: copiedRoomCode ? colors.tint + '20' : 'transparent' }]}
              disabled={!id}
            >
              <Icon 
                name={copiedRoomCode ? Check : Copy} 
                size={16} 
                color={copiedRoomCode ? colors.tint : colors.tabIconDefault} 
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
            {roomData?.memberCount || 0} members
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Icon 
            name={Zap} 
            size={20} 
            color={activeTab === 'dashboard' ? colors.tint : colors.tabIconDefault} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'dashboard' ? colors.tint : colors.tabIconDefault }
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
            color={activeTab === 'requests' ? colors.tint : colors.tabIconDefault} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'requests' ? colors.tint : colors.tabIconDefault }
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
            color={activeTab === 'leaderboard' ? colors.tint : colors.tabIconDefault} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'leaderboard' ? colors.tint : colors.tabIconDefault }
          ]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  roomCodeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomCodeText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  copyButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  broadcastCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  broadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  broadcastType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  broadcastTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  broadcastTime: {
    fontSize: 12,
  },
  broadcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  broadcastDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  broadcastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  broadcastAuthor: {
    fontSize: 12,
  },
  broadcastResponses: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  helpScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
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
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requestStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  requestTime: {
    fontSize: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestRequester: {
    fontSize: 12,
  },
  requestHelper: {
    fontSize: 12,
    fontWeight: '500',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leaderboardRank: {
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  leaderboardScore: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
