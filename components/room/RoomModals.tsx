import { ClayTheme } from '@/theme/claymorph';
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

export { BorrowModal } from './BorrowModal';

interface BroadcastModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, type: 'help' | 'collaboration' | 'announcement') => void;
}

export function BroadcastModal({ visible, onClose, onSubmit }: BroadcastModalProps) {
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Broadcast</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!title.trim() || !description.trim()}>
            <Text style={[
              styles.submitButton,
              { opacity: title.trim() && description.trim() ? 1 : 0.5 }
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              {(['help', 'collaboration', 'announcement'] as const).map((typeOption) => (
                <TouchableOpacity
                  key={typeOption}
                  style={[
                    styles.typeButton,
                    type === typeOption && styles.typeButtonSelected,
                  ]}
                  onPress={() => setType(typeOption)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    type === typeOption && styles.typeButtonTextSelected,
                  ]}>
                    {typeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a clear, descriptive title"
              placeholderTextColor={ClayTheme.colors.text.light}
              value={title}
              onChangeText={setTitle}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Provide more details about what you need or what you're offering"
              placeholderTextColor={ClayTheme.colors.text.light}
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Request Help</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!title.trim() || !description.trim()}>
            <Text style={[
              styles.submitButton,
              { opacity: title.trim() && description.trim() ? 1 : 0.5 }
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need help with?"
              placeholderTextColor={ClayTheme.colors.text.light}
              value={title}
              onChangeText={setTitle}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your problem in detail. What have you tried? What specific help do you need?"
              placeholderTextColor={ClayTheme.colors.text.light}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Skills Needed (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="React, TypeScript, Node.js (comma separated)"
              placeholderTextColor={ClayTheme.colors.text.light}
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
    backgroundColor: ClayTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ClayTheme.spacing.lg,
    paddingVertical: ClayTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ClayTheme.colors.clay.medium,
    backgroundColor: ClayTheme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: ClayTheme.colors.text.light,
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.primary,
  },
  content: {
    flex: 1,
    padding: ClayTheme.spacing.lg,
  },
  section: {
    marginBottom: ClayTheme.spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: ClayTheme.spacing.sm,
    color: ClayTheme.colors.text.primary,
  },
  input: {
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.medium,
    padding: ClayTheme.spacing.md,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
    ...ClayTheme.shadows.claySubtle,
    minHeight: 44,
  },
  textArea: {
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.medium,
    padding: ClayTheme.spacing.md,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
    ...ClayTheme.shadows.claySubtle,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: ClayTheme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: ClayTheme.spacing.md,
    paddingHorizontal: ClayTheme.spacing.sm,
    borderRadius: ClayTheme.borderRadius.medium,
    backgroundColor: ClayTheme.colors.surface,
    ...ClayTheme.shadows.claySubtle,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: ClayTheme.colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: ClayTheme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  typeButtonTextSelected: {
    color: ClayTheme.colors.surface,
  },
});
