import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Card } from '@/components';
import { X, ShieldCheck, Camera, Car, Clock, AlertTriangle } from 'lucide-react-native';

export default function SafetyPolicies() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety & Policies</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <ShieldCheck size={48} color={colors.primary} />
          <Text style={styles.introTitle}>Your Safety is Our Priority</Text>
          <Text style={styles.introText}>
            Please review our safety guidelines and policies to ensure a safe and positive
            experience for you, our pets, and shelter staff.
          </Text>
        </View>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={24} color={colors.info} />
            <Text style={styles.sectionTitle}>Photo ID Verification</Text>
          </View>
          <Text style={styles.sectionText}>
            All visitors must present a valid government-issued photo ID upon arrival. Staff will
            verify your identity matches your booking reservation before allowing pet interaction.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Accepted IDs: Driver's license, passport, state ID</Text>
            <Text style={styles.bullet}>• ID must not be expired</Text>
            <Text style={styles.bullet}>• Name must match booking reservation</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>Transportation Safety</Text>
          </View>
          <Text style={styles.sectionText}>
            For off-site visits, proper pet restraint is mandatory to ensure the safety of the pet
            and all passengers.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Dogs must be on a secure leash at all times</Text>
            <Text style={styles.bullet}>
              • Vehicle transport requires proper car restraint (harness, carrier, or crate)
            </Text>
            <Text style={styles.bullet}>• Never leave pets unattended in vehicles</Text>
            <Text style={styles.bullet}>• Ensure adequate ventilation and temperature control</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={colors.warning} />
            <Text style={styles.sectionTitle}>Time & Return Policy</Text>
          </View>
          <Text style={styles.sectionText}>
            Timely returns help us maintain schedules and ensure pet welfare.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>
              • Return pets at the scheduled time or notify staff of delays
            </Text>
            <Text style={styles.bullet}>• Log return time with staff member upon arrival</Text>
            <Text style={styles.bullet}>
              • Late returns without notification may affect future booking privileges
            </Text>
            <Text style={styles.bullet}>• Report any incidents or concerns immediately</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={24} color={colors.error} />
            <Text style={styles.sectionTitle}>Health & Safety Requirements</Text>
          </View>
          <Text style={styles.sectionText}>
            To protect our pets and visitors, please follow these guidelines:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>
              • Wash hands before and after pet interaction
            </Text>
            <Text style={styles.bullet}>
              • Do not visit if you are feeling ill or have been exposed to contagious illnesses
            </Text>
            <Text style={styles.bullet}>
              • Follow staff instructions regarding pet handling and behavior
            </Text>
            <Text style={styles.bullet}>
              • Report any bites, scratches, or injuries immediately
            </Text>
            <Text style={styles.bullet}>
              • Children under 12 must be supervised by an adult at all times
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Liability & Responsibilities</Text>
          </View>
          <Text style={styles.sectionText}>
            By booking a visit, you acknowledge and agree to the following:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>
              • You are responsible for the pet's safety during your visit
            </Text>
            <Text style={styles.bullet}>
              • You will follow all staff instructions and safety protocols
            </Text>
            <Text style={styles.bullet}>
              • You understand that animal behavior can be unpredictable
            </Text>
            <Text style={styles.bullet}>
              • You agree to pay for any damages or veterinary care resulting from your negligence
            </Text>
            <Text style={styles.bullet}>
              • The shelter reserves the right to deny or revoke visit privileges
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          </View>
          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Shelter Emergency Line:</Text>
              <Text style={styles.contactValue}>(555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>After Hours Support:</Text>
              <Text style={styles.contactValue}>(555) 123-4568</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Local Animal Control:</Text>
              <Text style={styles.contactValue}>(555) 123-4569</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions about our policies? Contact our staff at info@pawpair.org or call (555)
            123-4567 during business hours.
          </Text>
          <Text style={styles.footerNote}>Last updated: October 2025</Text>
        </View>
      </ScrollView>
    </View>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingLeft: 8,
  },
  contactList: {
    gap: 12,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    marginTop: 8,
    marginBottom: 32,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
