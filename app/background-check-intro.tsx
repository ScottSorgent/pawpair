import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button, Card } from '@/components';
import { Shield, Users, Heart, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { useStore } from '@/store/useStore';

export default function BackgroundCheckIntro() {
  const router = useRouter();
  const [showSkipModal, setShowSkipModal] = useState(false);
  const setBackgroundCheckStatus = useStore((state) => state.setBackgroundCheckStatus);

  const handleContinue = () => {
    router.push('/background-check');
  };

  const handleLearnMore = () => {
    router.push('/about#trust-safety');
  };

  const handleSkipAttempt = () => {
    setShowSkipModal(true);
  };

  const handleCompleteNow = () => {
    setShowSkipModal(false);
    handleContinue();
  };

  const handleSkipConfirm = () => {
    setBackgroundCheckStatus('required');
    setShowSkipModal(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Background Check Required</Text>
          <Text style={styles.subtitle}>
            Help us keep our community safe for animals, volunteers, and shelters
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why We Require This</Text>
          <Text style={styles.sectionText}>
            Background checks are an essential part of maintaining a safe and trusted environment
            for everyone involved in animal welfare. This helps us protect:
          </Text>
        </View>

        <View style={styles.reasonsContainer}>
          <Card style={styles.reasonCard}>
            <View style={styles.reasonIcon}>
              <Heart size={28} color={colors.error} />
            </View>
            <View style={styles.reasonContent}>
              <Text style={styles.reasonTitle}>Animals in Our Care</Text>
              <Text style={styles.reasonText}>
                Ensures pets are visited by individuals with a proven track record of responsible
                behavior and animal welfare.
              </Text>
            </View>
          </Card>

          <Card style={styles.reasonCard}>
            <View style={styles.reasonIcon}>
              <Users size={28} color={colors.info} />
            </View>
            <View style={styles.reasonContent}>
              <Text style={styles.reasonTitle}>Our Community Members</Text>
              <Text style={styles.reasonText}>
                Creates a safe environment for volunteers, staff, and other visitors who share
                their love for animals.
              </Text>
            </View>
          </Card>

          <Card style={styles.reasonCard}>
            <View style={styles.reasonIcon}>
              <Shield size={28} color={colors.success} />
            </View>
            <View style={styles.reasonContent}>
              <Text style={styles.reasonTitle}>Partner Shelters</Text>
              <Text style={styles.reasonText}>
                Gives shelters confidence in opening their doors, knowing all visitors have been
                properly vetted.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>Quick and secure online authorization form</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>Results typically ready within 24-48 hours</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>Your information is kept private and secure</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>One-time process valid for all shelters</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <AlertCircle size={20} color={colors.info} />
          <Text style={styles.infoText}>
            You won't be able to book shelter visits until your background check is completed and
            approved. You can still browse available pets and save favorites.
          </Text>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to Authorization Form"
          onPress={handleContinue}
          style={styles.continueButton}
        />
        <View style={styles.secondaryActions}>
          <TouchableOpacity onPress={handleLearnMore}>
            <Text style={styles.linkText}>Learn More About Trust & Safety</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkipAttempt}>
            <Text style={styles.skipText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showSkipModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AlertCircle size={32} color={colors.warning} />
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowSkipModal(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Background Check Required</Text>
            <Text style={styles.modalText}>
              You'll need to complete your background check before you can book any shelter visits.
            </Text>
            <Text style={styles.modalSubtext}>
              You can still browse pets and explore shelters, but booking visits will be
              unavailable until this step is completed.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Complete Now"
                onPress={handleCompleteNow}
                style={styles.modalPrimaryButton}
              />
              <Button
                title="Skip for Now"
                variant="outline"
                onPress={handleSkipConfirm}
                style={styles.modalSecondaryButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  reasonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  reasonCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    marginBottom: spacing.md,
  },
  secondaryActions: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  skipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warning + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalActions: {
    gap: spacing.sm,
  },
  modalPrimaryButton: {
    width: '100%',
  },
  modalSecondaryButton: {
    width: '100%',
  },
});
