import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { ArrowLeft, MapPin, Calendar, Clock, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { pets } from '@/services/pets';
import { shelters } from '@/services/shelters';
import { booking } from '@/services/booking';
import { useStore } from '@/store/useStore';
import { Pet, Shelter } from '@/types';

export default function BookingConfirm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useStore((state) => state.user);

  const petId = params.petId as string;
  const shelterId = params.shelterId as string;
  const dateStr = params.date as string;
  const timeSlot = decodeURIComponent(params.timeSlot as string);

  const [pet, setPet] = useState<Pet | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [agreedToId, setAgreedToId] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const selectedDate = new Date(dateStr);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const petData = await pets.get(petId);
      setPet(petData);

      const shelterData = await shelters.get(shelterId);
      setShelter(shelterData);
    } catch (error) {
      console.error('Failed to load details:', error);
      showToast('Failed to load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!agreedToId) {
      showToast('Please confirm you will bring valid photo ID', 'warning');
      return;
    }

    if (!user) {
      showToast('User not found', 'error');
      return;
    }

    setConfirming(true);
    try {
      const newBooking = await booking.create(
        petId,
        user.id,
        selectedDate,
        timeSlot,
        shelterId
      );

      router.replace(`/booking-success?bookingId=${newBooking.id}&petName=${pet?.name || 'pet'}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
      showToast('Failed to confirm booking', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!pet || !shelter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load booking details</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Summary</Text>

          <View style={styles.petCard}>
            <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed || 'Mixed Breed'}</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Calendar size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate()}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{timeSlot}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{shelter.name}</Text>
                <Text style={styles.detailSubtext}>
                  {shelter.address}, {shelter.city}, {shelter.state}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Information</Text>

          <View style={styles.infoBox}>
            <AlertCircle size={20} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Please arrive 5-10 minutes early for your visit. This will give you time to check in and complete any necessary paperwork.
              </Text>
            </View>
          </View>

          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>What to Bring</Text>
            <Text style={styles.requirementItem}>• Valid photo ID (required)</Text>
            <Text style={styles.requirementItem}>• Proof of address</Text>
            <Text style={styles.requirementItem}>• List of questions for shelter staff</Text>
          </View>

          <TouchableOpacity
            style={styles.safetyNote}
            onPress={() => router.push('/safety-policies')}
            activeOpacity={0.7}
          >
            <ShieldCheck size={20} color={colors.success} />
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety Reminder</Text>
              <Text style={styles.safetyText}>
                Verify photo ID on pickup; confirm leash/car restraint; log return time.
              </Text>
              <Text style={styles.safetyLink}>View full Safety & Policies →</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreedToId(!agreedToId)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToId && styles.checkboxChecked]}>
              {agreedToId && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that I will bring a valid photo ID to my visit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={confirming ? 'Confirming...' : 'Confirm Booking'}
          onPress={handleConfirmBooking}
          loading={confirming}
          disabled={!agreedToId || confirming}
        />
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    ...typography.h2,
    color: colors.text,
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
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  petInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  petBreed: {
    ...typography.body,
    color: colors.primary,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  detailSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.info + '30',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  requirementsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  requirementItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  safetyNote: {
    flexDirection: 'row',
    backgroundColor: colors.success + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success + '30',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  safetyLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  spacer: {
    height: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
