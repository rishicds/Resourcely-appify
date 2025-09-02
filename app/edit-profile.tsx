import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const { user, updateUser, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  
  const [name, setName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSkills(user.skills || []);
      setTools(user.tools || []);
      setIsAvailable(user.isAvailable || false);
    }
  }, [user]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await updateUser({
        name: name.trim(),
        skills,
        tools,
        isAvailable,
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          marginTop: 40,
        }}>
          <TouchableOpacity onPress={handleCancel}>
            <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText type="title">Edit Profile</ThemedText>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>
              {isSaving ? 'Saving...' : 'Save'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={{
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
            Basic Information
          </ThemedText>
          
          {/* Name */}
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ marginBottom: 8, fontWeight: '500' }}>
              Name
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={{
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].text + '30',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: Colors[colorScheme ?? 'light'].text,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
              }}
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            />
          </View>

          {/* Availability */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <ThemedText style={{ fontWeight: '500' }}>
              Available for projects
            </ThemedText>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor={isAvailable ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Skills Section */}
        <View style={{
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <IconSymbol 
              name="star.fill" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].tint}
              style={{ marginRight: 8 }}
            />
            <ThemedText type="subtitle">Skills</ThemedText>
          </View>

          {/* Add Skill Input */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 16,
            gap: 8,
          }}>
            <TextInput
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a skill"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].text + '30',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: Colors[colorScheme ?? 'light'].text,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
              }}
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity
              onPress={addSkill}
              style={{
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Skills List */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {skills.map((skill, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors[colorScheme ?? 'light'].tint + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme ?? 'light'].tint + '40',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ThemedText style={{
                  fontSize: 14,
                  color: Colors[colorScheme ?? 'light'].tint,
                  fontWeight: '500',
                }}>
                  {skill}
                </ThemedText>
                <TouchableOpacity onPress={() => removeSkill(index)}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Tools Section */}
        <View style={{
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <IconSymbol 
              name="wrench.and.screwdriver.fill" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].tint}
              style={{ marginRight: 8 }}
            />
            <ThemedText type="subtitle">Tools</ThemedText>
          </View>

          {/* Add Tool Input */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 16,
            gap: 8,
          }}>
            <TextInput
              value={newTool}
              onChangeText={setNewTool}
              placeholder="Add a tool"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].text + '30',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: Colors[colorScheme ?? 'light'].text,
                backgroundColor: Colors[colorScheme ?? 'light'].background,
              }}
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              onSubmitEditing={addTool}
            />
            <TouchableOpacity
              onPress={addTool}
              style={{
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tools List */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {tools.map((tool, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors[colorScheme ?? 'light'].tint + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme ?? 'light'].tint + '40',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ThemedText style={{
                  fontSize: 14,
                  color: Colors[colorScheme ?? 'light'].tint,
                  fontWeight: '500',
                }}>
                  {tool}
                </ThemedText>
                <TouchableOpacity onPress={() => removeTool(index)}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
