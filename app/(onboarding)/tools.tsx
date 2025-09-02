import { ClayTheme, clayMorphStyles } from '@/theme/claymorph';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOOL_CATEGORIES = {
  'Development Tools': [
    'VS Code', 'IntelliJ IDEA', 'Eclipse', 'Sublime Text', 'Atom',
    'Vim', 'Emacs', 'WebStorm', 'PyCharm', 'Android Studio',
    'Xcode', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
    'Docker', 'Kubernetes', 'Jenkins', 'Travis CI', 'CircleCI'
  ],
  'Design & Creative Tools': [
    'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD',
    'Sketch', 'Canva', 'Adobe InDesign', 'Adobe After Effects',
    'Adobe Premiere Pro', 'Final Cut Pro', 'Blender', 'AutoCAD',
    'SketchUp', 'Procreate', 'Affinity Designer', 'Framer'
  ],
  'Communication & Collaboration': [
    'Slack', 'Discord', 'Microsoft Teams', 'Zoom', 'Google Meet',
    'Skype', 'Notion', 'Confluence', 'SharePoint', 'Miro',
    'Mural', 'Whimsical', 'Loom', 'Calendly', 'Doodle'
  ],
  'Project Management': [
    'Jira', 'Trello', 'Asana', 'Monday.com', 'ClickUp', 'Linear',
    'Basecamp', 'Wrike', 'Smartsheet', 'Airtable', 'Todoist',
    'Microsoft Project', 'Gantt charts', 'Scrum boards', 'Kanban'
  ],
  'Cloud & Infrastructure': [
    'AWS', 'Google Cloud', 'Microsoft Azure', 'Vercel', 'Netlify',
    'Heroku', 'DigitalOcean', 'Linode', 'Cloudflare', 'Firebase',
    'Supabase', 'MongoDB Atlas', 'Railway', 'Render'
  ],
  'API & Testing Tools': [
    'Postman', 'Insomnia', 'Thunder Client', 'Swagger', 'Curl',
    'Jest', 'Cypress', 'Selenium', 'Playwright', 'TestCafe',
    'Mocha', 'Chai', 'Enzyme', 'React Testing Library'
  ],
  'Database & Analytics': [
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
    'Elasticsearch', 'Neo4j', 'Cassandra', 'DynamoDB',
    'Google Analytics', 'Mixpanel', 'Amplitude', 'Hotjar'
  ],
  'Business & Productivity': [
    'Microsoft Office', 'Google Workspace', 'Excel', 'PowerPoint',
    'Word', 'Sheets', 'Docs', 'Slides', 'Evernote', 'OneNote',
    'HubSpot', 'Salesforce', 'Zendesk', 'Intercom', 'Mailchimp'
  ]
};

export default function ToolsOnboardingScreen() {
  const params = useLocalSearchParams();
  const skills = params.skills ? JSON.parse(params.skills as string) : [];
  
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Development Tools']);
  const animationRef = useRef<LottieView>(null);

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
    <LinearGradient
      colors={ClayTheme.colors.gradient.clay}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.animationContainer}>
                <LottieView
                  ref={animationRef}
                  source={require('@/assets/lottie/skills.json')}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              </View>
              <Text style={styles.title}>What tools do you use?</Text>
              <Text style={styles.subtitle}>
                Select the tools and resources you&apos;re familiar with. This helps match you with relevant projects.
              </Text>
            </View>

            {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity
                  style={[styles.categoryHeader, clayMorphStyles.button]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <Text style={styles.categoryCount}>
                    ({tools.filter(tool => selectedTools.includes(tool)).length}/{tools.length})
                  </Text>
                </TouchableOpacity>

                {expandedCategories.includes(category) && (
                  <View style={styles.toolsGrid}>
                    {tools.map((tool) => (
                      <TouchableOpacity
                        key={tool}
                        style={[
                          styles.toolChip,
                          clayMorphStyles.chip,
                          selectedTools.includes(tool) && [styles.toolChipSelected, clayMorphStyles.chipSelected]
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
                )}
              </View>
            ))}

            <View style={[styles.section, clayMorphStyles.card]}>
              <Text style={styles.sectionTitle}>Add Custom Tool</Text>
              <View style={styles.customToolContainer}>
                <TextInput
                  style={[styles.input, clayMorphStyles.input]}
                  value={customTool}
                  onChangeText={setCustomTool}
                  placeholder="Enter a tool..."
                  placeholderTextColor={ClayTheme.colors.text.light}
                  onSubmitEditing={addCustomTool}
                />
                <TouchableOpacity 
                  style={[styles.addButton, clayMorphStyles.button]}
                  onPress={addCustomTool}
                >
                  <LinearGradient
                    colors={ClayTheme.colors.gradient.accent}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {selectedTools.length > 0 && (
              <View style={[styles.section, clayMorphStyles.card]}>
                <Text style={styles.sectionTitle}>Your Selected Tools ({selectedTools.length})</Text>
                <View style={styles.selectedToolsContainer}>
                  {selectedTools.map((tool) => (
                    <View key={tool} style={[styles.selectedToolChip, clayMorphStyles.chip]}>
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
              style={[styles.backButton, clayMorphStyles.button]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                clayMorphStyles.button,
                selectedTools.length === 0 && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={selectedTools.length === 0}
            >
              <LinearGradient
                colors={selectedTools.length > 0 ? ClayTheme.colors.gradient.primary : ['#9ca3af', '#9ca3af'] as const}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  Next: Availability
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
    alignItems: 'center',
  },
  animationContainer: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ClayTheme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: ClayTheme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  categoryCount: {
    fontSize: 14,
    color: ClayTheme.colors.text.secondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  toolChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: ClayTheme.borderRadius.large,
    margin: 2,
  },
  toolChipSelected: {
    transform: [{ scale: 0.98 }],
  },
  toolChipText: {
    fontSize: 14,
    color: ClayTheme.colors.text.primary,
    fontWeight: '500',
  },
  toolChipTextSelected: {
    color: '#fff',
  },
  customToolContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
  },
  addButton: {
    borderRadius: ClayTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedToolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedToolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedToolText: {
    fontSize: 14,
    color: ClayTheme.colors.accent,
    fontWeight: '500',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    ...ClayTheme.shadows.clay,
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
    padding: 24,
    backgroundColor: 'transparent',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: ClayTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: ClayTheme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    borderRadius: ClayTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
