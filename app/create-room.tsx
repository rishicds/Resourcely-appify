import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createRoom } from '@/lib/rooms';
import { router } from 'expo-router';
import { ArrowLeft, Hash, Lock, Unlock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateRoomScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [tools, setTools] = useState('');
  const [skills, setSkills] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a room');
      return;
    }

    if (!roomName.trim()) {
      Alert.alert('Error', 'Room name is required');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Room description is required');
      return;
    }

    setIsLoading(true);

    try {
      const toolsArray = tools
        .split(',')
        .map(tool => tool.trim())
        .filter(tool => tool.length > 0);

      const skillsArray = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const newRoom = await createRoom({
        name: roomName.trim(),
        description: description.trim(),
        tools: toolsArray,
        skills: skillsArray,
        isPublic,
        createdBy: user.$id,
      });

      Alert.alert(
        'Success!',
        `Room "${newRoom.name}" created successfully!\nJoin code: ${newRoom.joinCode}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.tabIconDefault + '20' }]}
          onPress={() => router.back()}
        >
          <Icon name={ArrowLeft} size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Room Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30',
                color: colors.text,
              },
            ]}
            placeholder="Enter room name"
            placeholderTextColor={colors.tabIconDefault}
            value={roomName}
            onChangeText={setRoomName}
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30',
                color: colors.text,
              },
            ]}
            placeholder="Describe what this room is about"
            placeholderTextColor={colors.tabIconDefault}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tools</Text>
          <Text style={[styles.helpText, { color: colors.tabIconDefault }]}>
            Separate multiple tools with commas (e.g., React, TypeScript, Node.js)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30',
                color: colors.text,
              },
            ]}
            placeholder="React, TypeScript, Node.js"
            placeholderTextColor={colors.tabIconDefault}
            value={tools}
            onChangeText={setTools}
          />
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Skills</Text>
          <Text style={[styles.helpText, { color: colors.tabIconDefault }]}>
            Separate multiple skills with commas (e.g., Frontend, Backend, UI Design)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30',
                color: colors.text,
              },
            ]}
            placeholder="Frontend, Backend, UI Design"
            placeholderTextColor={colors.tabIconDefault}
            value={skills}
            onChangeText={setSkills}
          />
        </View>

        {/* Privacy Setting */}
        <View style={styles.section}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyInfo}>
              <View style={styles.privacyTitleRow}>
                <Icon
                  name={isPublic ? Unlock : Lock}
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.label, { color: colors.text, marginLeft: 8, marginBottom: 0 }]}>
                  {isPublic ? 'Public Room' : 'Private Room'}
                </Text>
              </View>
              <Text style={[styles.helpText, { color: colors.tabIconDefault, marginTop: 4 }]}>
                {isPublic
                  ? 'Anyone can discover and join this room'
                  : 'Only people with the join code can join'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.tabIconDefault + '30', true: colors.tint + '50' }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* Join Code Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.tint + '10' }]}>
          <Icon name={Hash} size={20} color={colors.tint} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.tint }]}>Join Code</Text>
            <Text style={[styles.infoText, { color: colors.tint }]}>
              A unique join code will be generated for your room. Share it with others to let them join.
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: colors.tint,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleCreateRoom}
          disabled={isLoading}
        >
          <Text style={[styles.createButtonText, { color: colors.background }]}>
            {isLoading ? 'Creating Room...' : 'Create Room'}
          </Text>
        </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
