import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { User, Heart, Home } from 'lucide-react-native';

export default function ProfileSetupIntro() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/profile-setup-form');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Welcome to PawPair!</Text>
          <Text style={styles.subtitle}>
            Let's set up your profile to find the perfect pet match
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <User size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Your Preferences</Text>
              <Text style={styles.featureDescription}>
                Tell us about your lifestyle and what you're looking for
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Heart size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Smart Matching</Text>
              <Text style={styles.featureDescription}>
                We'll recommend pets that match your preferences
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Home size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Find Your Companion</Text>
              <Text style={styles.featureDescription}>
                Connect with local shelters and schedule visits
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Set Up My Profile"
            onPress={handleContinue}
          />
          <Button
            title="Skip for Now"
            variant="ghost"
            onPress={handleSkip}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttons: {
    gap: spacing.md,
  },
});
