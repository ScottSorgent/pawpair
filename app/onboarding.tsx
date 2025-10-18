import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { OnboardingCarousel } from '@/components/OnboardingCarousel';
import { PermissionExplainer } from '@/components/PermissionExplainer';
import { Button } from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function Onboarding() {
  const router = useRouter();
  const [showPermissionExplainer, setShowPermissionExplainer] = useState(false);

  const handleGetStarted = () => {
    setShowPermissionExplainer(true);
  };

  const handlePermissionContinue = () => {
    setShowPermissionExplainer(false);
    router.push('/auth-choice');
  };

  const handleLearnMore = () => {
    router.push('/about');
  };

  return (
    <LinearGradient
      colors={['#E8F5F5', '#D0E9E9', '#B8DEDE']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/PawPair App icon copy.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>PawPair</Text>
            <Text style={styles.tagline}>Connect with your perfect pet match</Text>
          </View>

          <OnboardingCarousel />

          <View style={styles.buttons}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.primaryButton}
            />
            <Button
              title="Learn More"
              variant="ghost"
              onPress={handleLearnMore}
              style={styles.secondaryButton}
            />
          </View>
        </View>

        <PermissionExplainer
          visible={showPermissionExplainer}
          onClose={() => setShowPermissionExplainer(false)}
          onContinue={handlePermissionContinue}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    paddingTop: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondaryDark,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  buttons: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    width: '100%',
  },
});
