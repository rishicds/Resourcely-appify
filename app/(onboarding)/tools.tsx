import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREDEFINED_TOOLS = [
  'VS Code', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Canva',
  'Notion', 'Slack', 'Discord', 'Zoom', 'Teams', 'GitHub', 'GitLab',
  'Jira', 'Trello', 'Asana', 'Monday.com', 'ClickUp', 'Linear',
  'Docker', 'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify',
  'Postman', 'Insomnia', 'Chrome DevTools', 'Firebase', 'Supabase',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma', 'TypeORM'
];

export default function ToolsOnboardingScreen() {
  const params = useLocalSearchParams();
  const skills = params.skills ? JSON.parse(params.skills as string) : [];
  
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const addCustomTool = () => {
    if (customTool.trim() && !selectedTools.includes(customTool.trim())) {
      setSelectedTools(prev => [...prev, customTool.trim()]);
      setCustomTool('');
    }
  };

  const removeTool = (tool: string) => {
    setSelectedTools(prev => prev.filter(t => t !== tool));
  };

  const handleNext = () => {
    if (selectedTools.length === 0) {
      Alert.alert('Select Tools', 'Please select at least one tool to continue');
      return;
    }
    
    // Pass both skills and tools to next screen
    router.push({
      pathname: '/(onboarding)/availability' as any,
      params: { 
        skills: JSON.stringify(skills),
        tools: JSON.stringify(selectedTools)
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What tools do you use?</Text>
            <Text style={styles.subtitle}>
              Select the tools and resources you&apos;re familiar with. This helps match you with relevant projects.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Tools</Text>
            <View style={styles.toolsGrid}>
              {PREDEFINED_TOOLS.map((tool) => (
                <TouchableOpacity
                  key={tool}
                  style={[
                    styles.toolChip,
                    selectedTools.includes(tool) && styles.toolChipSelected
                  ]}
                  onPress={() => toggleTool(tool)}
                >
                  <Text style={[
                    styles.toolChipText,
                    selectedTools.includes(tool) && styles.toolChipTextSelected
                  ]}>
                    {tool}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Custom Tool</Text>
            <View style={styles.customToolContainer}>
              <TextInput
                style={styles.input}
                value={customTool}
                onChangeText={setCustomTool}
                placeholder="Enter a tool or resource..."
                onSubmitEditing={addCustomTool}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addCustomTool}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedTools.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Selected Tools ({selectedTools.length})</Text>
              <View style={styles.selectedToolsContainer}>
                {selectedTools.map((tool) => (
                  <View key={tool} style={styles.selectedToolChip}>
                    <Text style={styles.selectedToolText}>{tool}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTool(tool)}
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
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.nextButton, selectedTools.length === 0 && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={selectedTools.length === 0}
          >
            <Text style={styles.nextButtonText}>
              Next: Availability
            </Text>
          </TouchableOpacity>
        </View>
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  toolChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  toolChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  toolChipTextSelected: {
    color: '#fff',
  },
  customToolContainer: {
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
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedToolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedToolChip: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedToolText: {
    fontSize: 14,
    color: '#065f46',
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
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#10b981',
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
