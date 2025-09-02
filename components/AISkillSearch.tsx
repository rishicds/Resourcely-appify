import {
  aiSkillMatch,
  AISkillMatchRequest,
  getQueryImprovementSuggestions,
  SkillMatch,
} from '@/lib/ai-skill-matching';
import { searchUsers, User } from '@/lib/search';
import { clayMorphStyles, ClayTheme } from '@/theme/claymorph';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AISkillSearchProps {
  roomId?: string;
  onUserSelect?: (user: User) => void;
  onCreateRequest?: (query: string, suggestedUsers: User[]) => void;
  maxResults?: number;
}

interface SearchResult {
  user: User;
  match: SkillMatch;
}

export default function AISkillSearch({
  roomId,
  onUserSelect,
  onCreateRequest,
  maxResults = 10,
}: AISkillSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedTools, setExtractedTools] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load all users for AI matching
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await searchUsers('', {
          isAvailable: true,
          roomId: roomId,
        });
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, [roomId]);

  const performAISearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || allUsers.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Prepare request for AI matching
      const aiRequest: AISkillMatchRequest = {
        query: searchQuery,
        userPool: allUsers.map(user => ({
          $id: user.$id,
          name: user.name,
          skills: user.skills,
          tools: user.tools,
          isAvailable: user.isAvailable,
          helpScore: user.helpScore,
          lastActive: user.lastActive,
        })),
        maxResults,
      };

      // Get AI-powered matches
      const aiResponse = await aiSkillMatch(aiRequest);

      // Map AI matches back to full user objects
      const results: SearchResult[] = aiResponse.matches
        .map(match => {
          const user = allUsers.find(u => u.$id === match.userId);
          return user ? { user, match } : null;
        })
        .filter((result): result is SearchResult => result !== null);

      setSearchResults(results);
      setExtractedSkills(aiResponse.extractedSkills);
      setExtractedTools(aiResponse.extractedTools);
      setSuggestions(aiResponse.suggestions);
      setConfidence(aiResponse.confidence);
    } catch (error) {
      console.error('Error in AI search:', error);
      // Fallback to regular search
      try {
        const fallbackResults = await searchUsers(searchQuery, {
          isAvailable: true,
          roomId: roomId,
        });
        
        const basicResults: SearchResult[] = fallbackResults.map(user => ({
          user,
          match: {
            userId: user.$id,
            name: user.name,
            relevanceScore: 0.5,
            matchingSkills: [],
            matchingTools: [],
            availability: user.isAvailable,
            helpScore: user.helpScore,
            reasoning: 'Basic search match',
          },
        }));
        
        setSearchResults(basicResults);
      } catch {
        Alert.alert('Search Error', 'Unable to search for users. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  }, [allUsers, maxResults, roomId]);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const improvements = await getQueryImprovementSuggestions(searchQuery);
      setSuggestions(improvements);
      setShowingSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);


  // Debounce logic
  // Use 'any' to support both Node and browser environments
  const debounceTimeout = useRef<any>(null);
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setShowingSuggestions(false);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      performAISearch(searchQuery);
    }, 500); // 500ms debounce
  }, [performAISearch]);

  const handleCreateRequest = () => {
    if (onCreateRequest) {
      const suggestedUsers = searchResults.slice(0, 5).map(result => result.user);
      onCreateRequest(query, suggestedUsers);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return '#E8F5E8';
    if (score >= 0.6) return '#FFF3E0';
    return '#FFEBEE';
  };

  return (
    <View style={styles.container}>
      {/* AI Header Section */}
      <View style={[styles.headerContainer, clayMorphStyles.card]}>
        <View style={styles.aiHeader}>
          <View style={styles.searchAnimationContainer}>
            {isSearching ? (
              <LottieView
                source={require('@/assets/lottie/search.json')}
                autoPlay
                loop
                style={styles.searchAnimation}
              />
            ) : (
              <View style={styles.aiIconContainer}>
                <Ionicons name="sparkles" size={24} color={ClayTheme.colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.aiHeaderText}>
            <Text style={styles.aiTitle}>AI-Powered Skill Matching</Text>
            <Text style={styles.aiSubtitle}>
              {isSearching 
                ? "AI is analyzing your request to find the perfect match..." 
                : "Describe what you need help with, and our AI will find the best teammates for you"
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, clayMorphStyles.card]}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={ClayTheme.colors.text.secondary} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Describe what you need help with... (e.g., 'I need help setting up Firebase auth')"
            placeholderTextColor={ClayTheme.colors.text.light}
            multiline
            numberOfLines={2}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={ClayTheme.colors.primary} />
          )}
        </View>

        {/* AI Insights */}
        {(extractedSkills.length > 0 || extractedTools.length > 0) && (
          <View style={styles.insightsContainer}>
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceText}>
                🤖 AI Match Confidence: {Math.round(confidence * 100)}%
              </Text>
              <View style={[styles.confidenceIndicator, { backgroundColor: getConfidenceColor(confidence) }]} />
            </View>
            
            {extractedSkills.length > 0 && (
              <View style={styles.extractedContainer}>
                <Text style={styles.extractedLabel}>🎯 AI Detected Skills:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {extractedSkills.map((skill, index) => (
                    <View key={index} style={[styles.chip, clayMorphStyles.chip]}>
                      <Text style={styles.chipText}>{skill}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {extractedTools.length > 0 && (
              <View style={styles.extractedContainer}>
                <Text style={styles.extractedLabel}>🛠️ AI Detected Tools:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {extractedTools.map((tool, index) => (
                    <View key={index} style={[styles.chip, clayMorphStyles.chip]}>
                      <Text style={styles.chipText}>{tool}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {query.trim().length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, clayMorphStyles.button]}
              onPress={() => getSuggestions(query)}
            >
              <Ionicons name="bulb-outline" size={16} color={ClayTheme.colors.text.secondary} />
              <Text style={styles.actionButtonText}>🤖 Get AI Suggestions</Text>
            </TouchableOpacity>
            
            {onCreateRequest && searchResults.length > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, clayMorphStyles.button]}
                onPress={handleCreateRequest}
              >
                <Ionicons name="add-circle-outline" size={16} color={ClayTheme.colors.primary} />
                <Text style={[styles.actionButtonText, { color: ClayTheme.colors.primary }]}>
                  Create Smart Request
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Suggestions */}
      {showingSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, clayMorphStyles.card]}>
          <Text style={styles.suggestionsTitle}>🤖✨ AI Suggestions to improve your request:</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>• {suggestion}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.closeSuggestions}
            onPress={() => setShowingSuggestions(false)}
          >
            <Text style={styles.closeSuggestionsText}>Got it, thanks AI! 👍</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {searchResults.length > 0 && (
          <View style={styles.resultsHeaderContainer}>
            <Text style={styles.resultsHeader}>
              🤖 AI-Ranked Results ({searchResults.length} teammate{searchResults.length !== 1 ? 's' : ''})
            </Text>
            <Text style={styles.resultsSubheader}>
              Ordered by relevance and skill match
            </Text>
          </View>
        )}
        
        {searchResults.map((result, index) => (
          <TouchableOpacity
            key={result.user.$id}
            style={[
              styles.resultItem,
              clayMorphStyles.card,
              { backgroundColor: getRelevanceColor(result.match.relevanceScore) }
            ]}
            onPress={() => onUserSelect?.(result.user)}
          >
            <View style={styles.resultHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{result.user.name}</Text>
                <Text style={styles.userEmail}>{result.user.email}</Text>
              </View>
              <View style={styles.relevanceScore}>
                <Text style={styles.relevanceText}>
                  {Math.round(result.match.relevanceScore * 100)}% match
                </Text>
              </View>
            </View>
            
            <Text style={styles.reasoning}>{result.match.reasoning}</Text>
            
            {(result.match.matchingSkills.length > 0 || result.match.matchingTools.length > 0) && (
              <View style={styles.matchingItems}>
                {result.match.matchingSkills.length > 0 && (
                  <View style={styles.matchingSection}>
                    <Text style={styles.matchingLabel}>Matching Skills:</Text>
                    <View style={styles.matchingChips}>
                      {result.match.matchingSkills.map((skill, idx) => (
                        <View key={idx} style={[styles.matchingChip, { backgroundColor: '#E8F5E8' }]}>
                          <Text style={styles.matchingChipText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {result.match.matchingTools.length > 0 && (
                  <View style={styles.matchingSection}>
                    <Text style={styles.matchingLabel}>Matching Tools:</Text>
                    <View style={styles.matchingChips}>
                      {result.match.matchingTools.map((tool, idx) => (
                        <View key={idx} style={[styles.matchingChip, { backgroundColor: '#E3F2FD' }]}>
                          <Text style={styles.matchingChipText}>{tool}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Ionicons 
                  name={result.user.isAvailable ? "checkmark-circle" : "time"} 
                  size={14} 
                  color={result.user.isAvailable ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={styles.statText}>
                  {result.user.isAvailable ? "Available" : "Busy"}
                </Text>
              </View>
              
              {result.user.helpScore !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.statText}>
                    {result.user.helpScore} help score
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {!isSearching && query.trim().length >= 3 && searchResults.length === 0 && (
          <View style={[styles.noResults, clayMorphStyles.card]}>
            <Ionicons name="search" size={48} color={ClayTheme.colors.text.light} />
            <Text style={styles.noResultsText}>🤖 AI could not find any matches</Text>
            <Text style={styles.noResultsSubtext}>
              Try rephrasing your request or use AI suggestions to improve your query
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
    padding: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchAnimationContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchAnimation: {
    width: 50,
    height: 50,
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ClayTheme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeaderText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ClayTheme.colors.text.primary,
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 16,
    padding: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18, // increased gap for more space
    marginBottom: 16, // more bottom margin
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  insightsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ClayTheme.colors.clay.medium,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
    fontWeight: '500',
  },
  confidenceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  extractedContainer: {
    marginBottom: 8,
  },
  extractedLabel: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: ClayTheme.colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginBottom: 16,
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
  },
  suggestionItem: {
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 13,
    color: ClayTheme.colors.text.secondary,
    lineHeight: 18,
  },
  closeSuggestions: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  closeSuggestionsText: {
    fontSize: 12,
    color: ClayTheme.colors.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeaderContainer: {
    marginBottom: 12,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
    marginBottom: 4,
  },
  resultsSubheader: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
    fontStyle: 'italic',
  },
  resultItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    marginTop: 2,
  },
  relevanceScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: ClayTheme.colors.primaryLight,
  },
  relevanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: ClayTheme.colors.primary,
  },
  reasoning: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  matchingItems: {
    marginBottom: 8,
  },
  matchingSection: {
    marginBottom: 6,
  },
  matchingLabel: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  matchingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  matchingChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchingChipText: {
    fontSize: 11,
    color: ClayTheme.colors.text.primary,
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: ClayTheme.colors.text.secondary,
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.text.secondary,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: ClayTheme.colors.text.light,
    textAlign: 'center',
    marginTop: 4,
  },
});
