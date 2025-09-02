import { ClayTheme } from '@/theme/claymorph';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface BorrowModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    expectedReturnDate?: string;
  }) => void;
}

const CATEGORIES = [
  { label: 'Books & Materials', value: 'books' },
  { label: 'Tools & Equipment', value: 'tools' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Other', value: 'other' },
];

export function BorrowModal({ visible, onClose, onSubmit }: BorrowModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for what you want to borrow.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      expectedReturnDate: expectedReturnDate || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('other');
    setExpectedReturnDate('');
    onClose();
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
          <Text style={styles.headerTitle}>Request to Borrow</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButton}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>What do you need to borrow? *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., JavaScript textbook, Arduino kit, 3D printer..."
              placeholderTextColor={ClayTheme.colors.text.light}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat.value && styles.categoryTextSelected,
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what you need it for, how long you'll need it, any specific requirements..."
              placeholderTextColor={ClayTheme.colors.text.light}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Expected Return Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Next Friday, End of semester, 2 weeks..."
              placeholderTextColor={ClayTheme.colors.text.light}
              value={expectedReturnDate}
              onChangeText={setExpectedReturnDate}
              maxLength={50}
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
    paddingVertical: ClayTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ClayTheme.colors.clay.medium,
    backgroundColor: ClayTheme.colors.surface,
  },
  cancelButton: {
    fontSize: 16,
    color: ClayTheme.colors.text.secondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: ClayTheme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: ClayTheme.spacing.lg,
  },
  section: {
    marginVertical: ClayTheme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: ClayTheme.spacing.sm,
    color: ClayTheme.colors.text.primary,
  },
  input: {
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.medium,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.md,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
    ...ClayTheme.shadows.claySubtle,
  },
  textArea: {
    backgroundColor: ClayTheme.colors.surface,
    borderRadius: ClayTheme.borderRadius.medium,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: ClayTheme.colors.text.primary,
    ...ClayTheme.shadows.claySubtle,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ClayTheme.spacing.sm,
  },
  categoryOption: {
    backgroundColor: ClayTheme.colors.surface,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.sm,
    borderRadius: ClayTheme.borderRadius.medium,
    ...ClayTheme.shadows.claySubtle,
  },
  categoryOptionSelected: {
    backgroundColor: ClayTheme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: ClayTheme.colors.text.primary,
  },
  categoryTextSelected: {
    color: ClayTheme.colors.surface,
  },
});
