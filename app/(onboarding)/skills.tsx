import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'React Native', 'Node.js', 'Python',
  'Java', 'Swift', 'Kotlin', 'Flutter', 'Vue.js', 'Angular', 'PHP',
  'Ruby', 'Go', 'Rust', 'C++', 'C#', 'HTML/CSS', 'UI/UX Design',
  'Graphic Design', 'Photography', 'Video Editing', 'Writing', 'Marketing',
  'Project Management', 'Data Analysis', 'Machine Learning', 'DevOps',
  'Cybersecurity'
];

export default function SkillsOnboardingScreen() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Select Skills', 'Please select at least one skill to continue');
      return;
    }
    
    // Pass skills to next screen and navigate
    router.push({
      pathname: '/(onboarding)/tools' as any,
      params: { skills: JSON.stringify(selectedSkills) }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What are your skills?</Text>
            <Text style={styles.subtitle}>
              Select the skills you have or add your own. This helps others find you for collaboration.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Skills</Text>
            <View style={styles.skillsGrid}>
              {PREDEFINED_SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    selectedSkills.includes(skill) && styles.skillChipSelected
                  ]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[
                    styles.skillChipText,
                    selectedSkills.includes(skill) && styles.skillChipTextSelected
                  ]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Custom Skill</Text>
            <View style={styles.customSkillContainer}>
              <TextInput
                style={styles.input}
                value={customSkill}
                onChangeText={setCustomSkill}
                placeholder="Enter a skill..."
                onSubmitEditing={addCustomSkill}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addCustomSkill}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedSkills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Selected Skills ({selectedSkills.length})</Text>
              <View style={styles.selectedSkillsContainer}>
                {selectedSkills.map((skill) => (
                  <View key={skill} style={styles.selectedSkillChip}>
                    <Text style={styles.selectedSkillText}>{skill}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeSkill(skill)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedSkills.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedSkills.length === 0}
        >
          <Text style={styles.nextButtonText}>
            Next: Tools & Resources
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  skillChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  skillChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  skillChipTextSelected: {
    color: '#fff',
  },
  customSkillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSkillChip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedSkillText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
