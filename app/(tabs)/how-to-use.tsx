import { ThemedText } from '@/components/ThemedText';
import { clayMorphStyles, ClayTheme } from '@/theme/claymorph';
import LottieView from 'lottie-react-native';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HowToUse() {
  const animationRef = useRef<LottieView>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* FAQ Animation Header */}
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require('@/assets/lottie/faq.json')}
          autoPlay
          style={styles.animation}
        />
      </View>

      <View style={clayMorphStyles.card}>
        <ThemedText type="title" style={styles.heading}>
          How to Use Resourcely
        </ThemedText>
        <ThemedText style={styles.intro}>
          Resourcely is your hub for sharing, borrowing, and collaborating in themed rooms. Here&apos;s how to make the most of your experience:
        </ThemedText>
      </View>

      <View style={clayMorphStyles.cardSubtle}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🚀 Getting Started
        </ThemedText>
        <View style={styles.featureList}>
          <FeatureItem title="Create Your Profile" desc="Set up your profile with skills and tools you're familiar with. This helps match you with relevant rooms and projects." />
          <FeatureItem title="Explore Rooms" desc="Browse public rooms by topic, skill, or interest using the Explore tab." />
          <FeatureItem title="Join Communities" desc="Join rooms that align with your interests or create your own themed room." />
        </View>
      </View>

      <View style={clayMorphStyles.cardSubtle}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🏠 Room Features
        </ThemedText>
        <View style={styles.featureList}>
          <FeatureItem title="Create Rooms" desc="Start a new room with a name, description, and set of skills/tools. Rooms can be public or private." />
          <FeatureItem title="Join Rooms" desc="Join public rooms instantly or use a join code for private rooms." />
          <FeatureItem title="Real-time Chat" desc="Collaborate and communicate in real-time with all room members through the built-in chat." />
          <FeatureItem title="Borrow & Request" desc="Request resources or offer help directly within the room using the borrow system." />
          <FeatureItem title="Room Management" desc="View room info, member list, shared skills/tools, and manage settings if you're the creator." />
          <FeatureItem title="Leave or Transfer" desc="Leave rooms anytime or transfer ownership if you're the room creator." />
        </View>
      </View>

      <View style={clayMorphStyles.cardSubtle}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          💡 Pro Tips
        </ThemedText>
        <View style={styles.tips}>
          <TipItem text="Use specific keywords in the search to find rooms relevant to your skills and interests." />
          <TipItem text="Keep your profile updated with current skills and tools to get better room recommendations." />
          <TipItem text="Be active in room chats to build connections and discover collaboration opportunities." />
          <TipItem text="Create rooms for specific projects or learning goals to attract like-minded collaborators." />
          <TipItem text="Use the borrow feature to share resources and help others in your community." />
          <TipItem text="Check room details before joining to ensure it matches your interests and skill level." />
        </View>
      </View>

      <View style={clayMorphStyles.cardSubtle}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🔧 Tools & Resources
        </ThemedText>
        <View style={styles.featureList}>
          <FeatureItem title="Profile Tools" desc="Add tools and software you're proficient with to help others find you for collaboration." />
          <FeatureItem title="Skill Sharing" desc="Share your expertise and learn from others by participating in room discussions." />
          <FeatureItem title="Resource Library" desc="Access shared resources and materials within each room's community." />
          <FeatureItem title="Availability Status" desc="Set your availability to let others know when you're free to collaborate." />
        </View>
      </View>

      <View style={clayMorphStyles.cardSubtle}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🤝 Best Practices
        </ThemedText>
        <View style={styles.tips}>
          <TipItem text="Be respectful and constructive in all room interactions." />
          <TipItem text="Clearly describe your needs when requesting help or resources." />
          <TipItem text="Follow up on borrowed items and return them promptly." />
          <TipItem text="Share useful resources and knowledge with the community." />
          <TipItem text="Use appropriate room channels for different types of discussions." />
        </View>
      </View>

      
    </ScrollView>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.featureItem}>
      <ThemedText style={styles.featureBullet}>•</ThemedText>
      <View style={styles.featureContent}>
        <ThemedText type="subtitle" style={styles.featureTitle}>{title}</ThemedText>
        <ThemedText style={styles.featureDesc}>{desc}</ThemedText>
      </View>
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <ThemedText style={styles.tipBullet}>•</ThemedText>
      <ThemedText style={styles.tipText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: ClayTheme.spacing.lg,
    backgroundColor: ClayTheme.colors.clay.light,
  },
  animationContainer: {
    height: 180,
    width: 180,
    alignSelf: 'center',
    marginBottom: 24,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  heading: {
    marginBottom: ClayTheme.spacing.md,
    color: ClayTheme.colors.primary,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  intro: {
    marginBottom: ClayTheme.spacing.lg,
    color: ClayTheme.colors.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: ClayTheme.spacing.md,
    color: ClayTheme.colors.accent,
    fontSize: 20,
    fontWeight: '600',
  },
  featureList: {
    marginBottom: ClayTheme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureBullet: {
    fontSize: 20,
    color: ClayTheme.colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: ClayTheme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    color: ClayTheme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  tips: {
    marginTop: ClayTheme.spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 16,
    color: ClayTheme.colors.accent,
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    color: ClayTheme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  helpText: {
    color: ClayTheme.colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
