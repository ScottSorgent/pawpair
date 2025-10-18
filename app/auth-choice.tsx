import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function AuthChoice() {
  const router = useRouter();

  const handleEmailAuth = () => {
    router.push('/sign-in');
  };

  const handleApple = () => {
    console.log('Apple sign-in (not implemented)');
  };

  const handleGoogle = () => {
    console.log('Google sign-in (not implemented)');
  };

  const handleStaffSignIn = () => {
    router.push('/staff-sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to PawPair</Text>
          <Text style={styles.subtitle}>
            Find your perfect pet companion and make a difference in their life
          </Text>
        </View>

        <View style={styles.illustration}>
          <Text style={styles.emoji}>🐾</Text>
        </View>

        <View style={styles.buttonsSection}>
          <Button
            title="Continue with Email"
            onPress={handleEmailAuth}
            style={styles.button}
          />

          <TouchableOpacity style={styles.socialButton} onPress={handleApple}>
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogle}>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStaffSignIn} style={styles.linkContainer}>
            <Text style={styles.linkText}>I'm shelter staff</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
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
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 120,
  },
  buttonsSection: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
  socialButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  socialButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
});
