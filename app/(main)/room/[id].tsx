import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageSquare, Search, Trophy, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RoomMember {
  id: string;
  name: string;
  skills: string[];
  tools: string[];
  helpScore: number;
  isAvailable: boolean;
  lastActive: string;
}

interface ActiveBroadcast {
  id: string;
  title: string;
  type: 'help' | 'collaboration' | 'announcement';
  author: {
    id: string;
    name: string;
  };
  description: string;
  timePosted: string;
  responses: number;
}

interface PendingRequest {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'returned';
  requester: {
    id: string;
    name: string;
  };
  helper?: {
    id: string;
    name: string;
  };
  description: string;
  skillsNeeded: string[];
  createdAt: string;
}

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'leaderboard'>('dashboard');

  // Mock data
  const roomData = {
    id: id as string,
    name: 'React Developers',
    description: 'A room for React developers to collaborate and share knowledge',
    memberCount: 24,
  };

  const mockMembers: RoomMember[] = [
    {
      id: '1',
      name: 'John Doe',
      skills: ['React', 'TypeScript', 'Node.js'],
      tools: ['VS Code', 'Git', 'Docker'],
      helpScore: 145,
      isAvailable: true,
      lastActive: '2 min ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      skills: ['React', 'Redux', 'JavaScript'],
      tools: ['WebStorm', 'Git', 'Webpack'],
      helpScore: 132,
      isAvailable: true,
      lastActive: '5 min ago',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      skills: ['React Native', 'iOS', 'Android'],
      tools: ['Xcode', 'Android Studio', 'React DevTools'],
      helpScore: 98,
      isAvailable: false,
      lastActive: '1 hour ago',
    },
  ];

  const mockBroadcasts: ActiveBroadcast[] = [
    {
      id: '1',
      title: 'Need help with React hooks optimization',
      type: 'help',
      author: { id: '4', name: 'Sarah Wilson' },
      description: 'Struggling with useCallback and useMemo best practices',
      timePosted: '5 min ago',
      responses: 3,
    },
    {
      id: '2',
      title: 'Starting a new e-commerce project',
      type: 'collaboration',
      author: { id: '5', name: 'Tom Brown' },
      description: 'Looking for collaborators on a React/Node.js e-commerce platform',
      timePosted: '1 hour ago',
      responses: 7,
    },
  ];

  const mockRequests: PendingRequest[] = [
    {
      id: '1',
      title: 'Help with Redux state management',
      status: 'pending',
      requester: { id: '6', name: 'Alex Chen' },
      description: 'Need guidance on complex state management patterns',
      skillsNeeded: ['Redux', 'React'],
      createdAt: '30 min ago',
    },
    {
      id: '2',
      title: 'Code review for authentication system',
      status: 'accepted',
      requester: { id: '7', name: 'Lisa Davis' },
      helper: { id: '1', name: 'John Doe' },
      description: 'Built JWT authentication, need security review',
      skillsNeeded: ['Security', 'Node.js', 'JWT'],
      createdAt: '2 hours ago',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
    member.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Active Broadcasts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Broadcasts</Text>
        {mockBroadcasts.map(broadcast => (
          <View key={broadcast.id} style={[styles.broadcastCard, { backgroundColor: colors.background }]}>
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
                by {broadcast.author.name}
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
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Highlighted Members */}
        {filteredMembers.map(member => (
          <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.background }]}>
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                <View style={styles.memberStatus}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: member.isAvailable ? '#4ECDC4' : colors.tabIconDefault }
                  ]} />
                  <Text style={[styles.statusText, { color: colors.tabIconDefault }]}>
                    {member.isAvailable ? 'Available' : 'Busy'} • {member.lastActive}
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
    </ScrollView>
  );

  const renderRequests = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Room Requests</Text>
        {mockRequests.map(request => (
          <View key={request.id} style={[styles.requestCard, { backgroundColor: colors.background }]}>
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
                {request.createdAt}
              </Text>
            </View>
            
            <Text style={[styles.requestTitle, { color: colors.text }]}>{request.title}</Text>
            <Text style={[styles.requestDescription, { color: colors.tabIconDefault }]}>
              {request.description}
            </Text>
            
            <View style={styles.requestSkills}>
              {request.skillsNeeded.map((skill, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.tint }]}>{skill}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.requestFooter}>
              <Text style={[styles.requestRequester, { color: colors.tabIconDefault }]}>
                by {request.requester.name}
              </Text>
              {request.helper && (
                <Text style={[styles.requestHelper, { color: colors.tint }]}>
                  helping: {request.helper.name}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Room Leaderboard</Text>
        {mockMembers
          .sort((a, b) => b.helpScore - a.helpScore)
          .map((member, index) => (
            <View key={member.id} style={[styles.leaderboardCard, { backgroundColor: colors.background }]}>
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
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name={ArrowLeft} size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{roomData.name}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
            {roomData.memberCount} members
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
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </RefreshControl>
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
});
