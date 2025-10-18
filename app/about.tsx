import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import {
  ArrowLeft,
  Heart,
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Mail,
  ExternalLink,
  Info,
} from 'lucide-react-native';

export default function About() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const trustSafetyRef = useRef<View>(null);

  useEffect(() => {
    if (params.anchor === 'trust-safety' && trustSafetyRef.current) {
      setTimeout(() => {
        trustSafetyRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  }, [params.anchor]);

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@pawpair.com?subject=PawPair Support Request');
  };

  const handleOpenLink = (url: string) => {
    console.log('Opening:', url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About PawPair</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🐾</Text>
          <Text style={styles.title}>Connecting hearts, one paw at a time</Text>
          <Text style={styles.description}>
            PawPair makes pet adoption easier by helping you discover, visit, and connect with
            shelter pets that match your lifestyle.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Info size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>How PawPair Works</Text>
          </View>

          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Create Your Profile</Text>
                <Text style={styles.stepDescription}>
                  Tell us about your lifestyle, preferences, and what you're looking for in a pet
                  companion.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Discover Matches</Text>
                <Text style={styles.stepDescription}>
                  Browse pets at local shelters that match your preferences. View photos, read
                  profiles, and save favorites.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Schedule a Visit</Text>
                <Text style={styles.stepDescription}>
                  Book a time to meet pets in person at their shelter. Meet in a safe, supervised
                  environment.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Feedback</Text>
                <Text style={styles.stepDescription}>
                  After your visit, share your experience to help other potential adopters and
                  shelters improve.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View ref={trustSafetyRef} collapsable={false}>
          <Card style={styles.trustSafetyCard}>
            <View style={styles.sectionHeaderRow}>
              <Shield size={24} color={colors.success} />
              <Text style={styles.sectionTitle}>Trust & Safety</Text>
            </View>
            <Text style={styles.trustSafetyText}>
              At PawPair, the safety and well-being of animals, volunteers, and shelter staff is our
              highest priority. We've implemented comprehensive measures to ensure a trusted and secure
              environment for everyone in our community.
            </Text>

            <View style={styles.trustFeature}>
              <View style={styles.trustFeatureIcon}>
                <CheckCircle size={20} color={colors.success} />
              </View>
              <View style={styles.trustFeatureContent}>
                <Text style={styles.trustFeatureTitle}>Background Checks</Text>
                <Text style={styles.trustFeatureText}>
                  All users must complete a background check before booking shelter visits. This ensures
                  responsible individuals are interacting with vulnerable animals.
                </Text>
              </View>
            </View>

            <View style={styles.trustFeature}>
              <View style={styles.trustFeatureIcon}>
                <CheckCircle size={20} color={colors.success} />
              </View>
              <View style={styles.trustFeatureContent}>
                <Text style={styles.trustFeatureTitle}>Verified Shelters</Text>
                <Text style={styles.trustFeatureText}>
                  Every shelter partner is verified and licensed. We only work with reputable
                  organizations committed to animal welfare.
                </Text>
              </View>
            </View>

            <View style={styles.trustFeature}>
              <View style={styles.trustFeatureIcon}>
                <CheckCircle size={20} color={colors.success} />
              </View>
              <View style={styles.trustFeatureContent}>
                <Text style={styles.trustFeatureTitle}>Supervised Visits</Text>
                <Text style={styles.trustFeatureText}>
                  All shelter visits are supervised by trained staff. Pets and visitors are never left
                  alone together during initial meetings.
                </Text>
              </View>
            </View>

            <View style={styles.trustFeature}>
              <View style={styles.trustFeatureIcon}>
                <CheckCircle size={20} color={colors.success} />
              </View>
              <View style={styles.trustFeatureContent}>
                <Text style={styles.trustFeatureTitle}>Secure Data</Text>
                <Text style={styles.trustFeatureText}>
                  Your personal information is encrypted and never shared without your consent. We
                  maintain strict privacy standards.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <Card style={styles.safetyCard}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={24} color={colors.warning} />
            <Text style={styles.sectionTitle}>Safety Checklist</Text>
          </View>
          <Text style={styles.safetyIntro}>
            Please ensure you have the following before visiting a shelter:
          </Text>

          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>
              <Text style={styles.checklistBold}>Valid Photo ID</Text> - Required for all shelter
              visits
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>
              <Text style={styles.checklistBold}>Leash & Collar</Text> - If test-walking dogs,
              bring your own
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>
              <Text style={styles.checklistBold}>Transport Restraint</Text> - Carrier or seatbelt
              harness if adopting
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>
              <Text style={styles.checklistBold}>Confirmation Email</Text> - Bring your booking
              confirmation
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.checklistText}>
              <Text style={styles.checklistBold}>Background Check</Text> - Complete if required by
              shelter
            </Text>
          </View>
        </Card>

        <Card style={styles.policyCard}>
          <View style={styles.sectionHeaderRow}>
            <AlertTriangle size={24} color={colors.info} />
            <Text style={styles.sectionTitle}>Shelter Policies</Text>
          </View>
          <Text style={styles.policyText}>
            Each shelter has its own adoption policies, requirements, and procedures. Please review
            individual shelter guidelines before your visit.
          </Text>
          <View style={styles.policyList}>
            <Text style={styles.policyItem}>• Adoption fees vary by shelter and pet</Text>
            <Text style={styles.policyItem}>• Background checks may be required</Text>
            <Text style={styles.policyItem}>• Home visits may be requested for certain pets</Text>
            <Text style={styles.policyItem}>• Some pets may have specific placement requirements</Text>
            <Text style={styles.policyItem}>
              • Adoption approval is at the shelter's discretion
            </Text>
          </View>
        </Card>

        <Card style={styles.privacyCard}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
          </View>
          <Text style={styles.privacyText}>
            <Text style={styles.privacyBold}>Your privacy matters.</Text> We collect only the
            information necessary to provide our services and connect you with shelter pets.
          </Text>
          <Text style={styles.privacyText}>
            We never sell your personal information to third parties. Data is shared with partner
            shelters only to facilitate your visits and adoption inquiries.
          </Text>
          <Text style={styles.privacyText}>
            All communications are encrypted and your profile is only visible to verified shelter
            staff when you have an active booking.
          </Text>
        </Card>

        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Legal & Safety Documents</Text>

          <TouchableOpacity
            style={styles.legalLink}
            onPress={() => handleOpenLink('/terms-of-service')}
          >
            <FileText size={20} color={colors.primary} />
            <Text style={styles.legalLinkText}>Terms of Service</Text>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalLink}
            onPress={() => handleOpenLink('/privacy-policy')}
          >
            <FileText size={20} color={colors.primary} />
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalLink}
            onPress={() => handleOpenLink('/liability-waiver')}
          >
            <Shield size={20} color={colors.warning} />
            <Text style={styles.legalLinkText}>Liability Waiver</Text>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Card style={styles.contactCard}>
          <View style={styles.sectionHeaderRow}>
            <Mail size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Contact & Support</Text>
          </View>

          <Text style={styles.contactText}>
            Have questions or need assistance? We're here to help!
          </Text>

          <View style={styles.contactMethods}>
            <View style={styles.contactMethod}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <TouchableOpacity onPress={handleContactSupport}>
                <Text style={styles.contactValue}>support@pawpair.com</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactMethod}>
              <Text style={styles.contactLabel}>General Inquiries</Text>
              <Text style={styles.contactValue}>info@pawpair.com</Text>
            </View>

            <View style={styles.contactMethod}>
              <Text style={styles.contactLabel}>Shelter Partnerships</Text>
              <Text style={styles.contactValue}>partners@pawpair.com</Text>
            </View>

            <View style={styles.contactMethod}>
              <Text style={styles.contactLabel}>Response Time</Text>
              <Text style={styles.contactValue}>Within 24 hours</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Mail size={20} color={colors.white} />
            <Text style={styles.supportButtonText}>Email Support</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PawPair v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for pets and their humans</Text>
          <Text style={styles.footerCopyright}>© 2025 PawPair. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  hero: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  stepsList: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  trustSafetyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.success + '08',
    borderColor: colors.success + '20',
  },
  trustSafetyText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  trustFeature: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  trustFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  trustFeatureContent: {
    flex: 1,
  },
  trustFeatureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  trustFeatureText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  safetyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  safetyIntro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  checklistText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  checklistBold: {
    fontWeight: '600',
    color: colors.text,
  },
  policyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  policyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  policyList: {
    gap: spacing.sm,
  },
  policyItem: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 22,
  },
  privacyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  privacyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  privacyBold: {
    fontWeight: '600',
    color: colors.text,
  },
  legalSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  legalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legalLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  contactCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  contactText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  contactMethods: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  contactMethod: {
    gap: spacing.xs,
  },
  contactLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  contactValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  supportButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerCopyright: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
