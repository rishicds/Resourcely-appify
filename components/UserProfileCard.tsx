import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/lib/auth';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface UserProfileCardProps {
  user: User;
  onEdit?: () => void;
  showEditButton?: boolean;
  compact?: boolean;
}

export function UserProfileCard({ 
  user, 
  onEdit, 
  showEditButton = false, 
  compact = false 
}: UserProfileCardProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={{
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 12,
      padding: compact ? 16 : 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: compact ? 12 : 16,
      }}>
        <View style={{ flex: 1 }}>
          <ThemedText type={compact ? "subtitle" : "defaultSemiBold"} style={{ 
            fontSize: compact ? 16 : 18,
            marginBottom: 4,
          }}>
            {user.name || 'Unknown User'}
          </ThemedText>
          {!compact && (
            <ThemedText style={{ 
              fontSize: 14, 
              opacity: 0.7,
              marginBottom: 8,
            }}>
              {user.email}
            </ThemedText>
          )}
          
          {/* Availability Status */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: user.isAvailable ? '#22c55e' : '#ef4444',
              marginRight: 6,
            }} />
            <ThemedText style={{ 
              fontSize: compact ? 12 : 14,
              fontWeight: '500',
            }}>
              {user.isAvailable ? 'Available' : 'Not Available'}
            </ThemedText>
          </View>
        </View>

        {showEditButton && onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].tint + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <IconSymbol 
              name="pencil" 
              size={16} 
              color={Colors[colorScheme ?? 'light'].tint} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Skills and Tools */}
      {!compact && (user.skills?.length || user.tools?.length) ? (
        <View>
          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <IconSymbol 
                  name="star.fill" 
                  size={14} 
                  color={Colors[colorScheme ?? 'light'].tint}
                  style={{ marginRight: 6 }}
                />
                <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
                  Skills
                </ThemedText>
              </View>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
              }}>
                {user.skills.slice(0, 3).map((skill, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: Colors[colorScheme ?? 'light'].tint + '15',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                    }}
                  >
                    <ThemedText style={{
                      fontSize: 12,
                      color: Colors[colorScheme ?? 'light'].tint,
                      fontWeight: '500',
                    }}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
                {user.skills.length > 3 && (
                  <View style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].text + '10',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}>
                    <ThemedText style={{
                      fontSize: 12,
                      opacity: 0.7,
                      fontWeight: '500',
                    }}>
                      +{user.skills.length - 3} more
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tools */}
          {user.tools && user.tools.length > 0 && (
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <IconSymbol 
                  name="wrench.and.screwdriver.fill" 
                  size={14} 
                  color={Colors[colorScheme ?? 'light'].tint}
                  style={{ marginRight: 6 }}
                />
                <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
                  Tools
                </ThemedText>
              </View>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
              }}>
                {user.tools.slice(0, 3).map((tool, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: Colors[colorScheme ?? 'light'].tint + '15',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                    }}
                  >
                    <ThemedText style={{
                      fontSize: 12,
                      color: Colors[colorScheme ?? 'light'].tint,
                      fontWeight: '500',
                    }}>
                      {tool}
                    </ThemedText>
                  </View>
                ))}
                {user.tools.length > 3 && (
                  <View style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].text + '10',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}>
                    <ThemedText style={{
                      fontSize: 12,
                      opacity: 0.7,
                      fontWeight: '500',
                    }}>
                      +{user.tools.length - 3} more
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      ) : compact && (
        <View style={{
          flexDirection: 'row',
          gap: 4,
        }}>
          {user.skills && user.skills.length > 0 && (
            <View style={{
              backgroundColor: Colors[colorScheme ?? 'light'].tint + '15',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
            }}>
              <ThemedText style={{
                fontSize: 11,
                color: Colors[colorScheme ?? 'light'].tint,
                fontWeight: '500',
              }}>
                {user.skills.length} skill{user.skills.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          )}
          {user.tools && user.tools.length > 0 && (
            <View style={{
              backgroundColor: Colors[colorScheme ?? 'light'].tint + '15',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
            }}>
              <ThemedText style={{
                fontSize: 11,
                color: Colors[colorScheme ?? 'light'].tint,
                fontWeight: '500',
              }}>
                {user.tools.length} tool{user.tools.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
