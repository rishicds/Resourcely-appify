import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.tabIconDefault + '30' }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Request to Borrow</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={[styles.submitButton, { color: colors.tint }]}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>What do you need to borrow? *</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30' 
              }]}
              placeholder="e.g., JavaScript textbook, Arduino kit, 3D printer..."
              placeholderTextColor={colors.tabIconDefault}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: category === cat.value ? colors.tint + '20' : colors.background,
                      borderColor: category === cat.value ? colors.tint : colors.tabIconDefault + '30',
                    }
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: category === cat.value ? colors.tint : colors.text }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30' 
              }]}
              placeholder="Describe what you need it for, how long you'll need it, any specific requirements..."
              placeholderTextColor={colors.tabIconDefault}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
              {description.length}/500
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Expected Return Date (Optional)</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '30' 
              }]}
              placeholder="e.g., Next Friday, End of semester, 2 weeks..."
              placeholderTextColor={colors.tabIconDefault}
              value={expectedReturnDate}
              onChangeText={setExpectedReturnDate}
              maxLength={50}
            />
          </View>

          <View style={styles.helpText}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>Tips for better responses:</Text>
            <Text style={[styles.helpItem, { color: colors.tabIconDefault }]}>
              • Be specific about what you need
            </Text>
            <Text style={[styles.helpItem, { color: colors.tabIconDefault }]}>
              • Mention the purpose/project you&apos;ll use it for
            </Text>
            <Text style={[styles.helpItem, { color: colors.tabIconDefault }]}>
              • Include expected return timeframe
            </Text>
            <Text style={[styles.helpItem, { color: colors.tabIconDefault }]}>
              • Be respectful and offer to take good care of the item
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helpText: {
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});
