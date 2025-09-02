import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface BroadcastModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, type: 'help' | 'collaboration' | 'announcement') => void;
}

export function BroadcastModal({ visible, onClose, onSubmit }: BroadcastModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'help' | 'collaboration' | 'announcement'>('help');

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onSubmit(title.trim(), description.trim(), type);
      setTitle('');
      setDescription('');
      setType('help');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.tabIconDefault + '20' }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.tabIconDefault }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create Broadcast</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!title.trim() || !description.trim()}>
            <Text style={[
              styles.submitButton,
              { 
                color: title.trim() && description.trim() ? colors.tint : colors.tabIconDefault,
                opacity: title.trim() && description.trim() ? 1 : 0.5
              }
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Type</Text>
            <View style={styles.typeSelector}>
              {(['help', 'collaboration', 'announcement'] as const).map((typeOption) => (
                <TouchableOpacity
                  key={typeOption}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === typeOption ? colors.tint : colors.background,
                      borderColor: colors.tint,
                    },
                  ]}
                  onPress={() => setType(typeOption)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === typeOption ? 'white' : colors.tint },
                    ]}
                  >
                    {typeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault + '30',
                color: colors.text 
              }]}
              placeholder="Enter a clear, descriptive title"
              placeholderTextColor={colors.tabIconDefault}
              value={title}
              onChangeText={setTitle}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault + '30',
                color: colors.text 
              }]}
              placeholder="Provide more details about what you need or what you're offering"
              placeholderTextColor={colors.tabIconDefault}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, skillsNeeded: string[]) => void;
}

export function RequestModal({ visible, onClose, onSubmit }: RequestModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      const skills = skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      onSubmit(title.trim(), description.trim(), skills);
      setTitle('');
      setDescription('');
      setSkillsInput('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.tabIconDefault + '20' }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.tabIconDefault }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Request Help</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!title.trim() || !description.trim()}>
            <Text style={[
              styles.submitButton,
              { 
                color: title.trim() && description.trim() ? colors.tint : colors.tabIconDefault,
                opacity: title.trim() && description.trim() ? 1 : 0.5
              }
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault + '30',
                color: colors.text 
              }]}
              placeholder="What do you need help with?"
              placeholderTextColor={colors.tabIconDefault}
              value={title}
              onChangeText={setTitle}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault + '30',
                color: colors.text 
              }]}
              placeholder="Describe your problem in detail. What have you tried? What specific help do you need?"
              placeholderTextColor={colors.tabIconDefault}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Skills Needed (optional)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault + '30',
                color: colors.text 
              }]}
              placeholder="React, TypeScript, Node.js (comma separated)"
              placeholderTextColor={colors.tabIconDefault}
              value={skillsInput}
              onChangeText={setSkillsInput}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
