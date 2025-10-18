import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { Star, Check, X, HelpCircle, Camera, Award } from 'lucide-react-native';
import { feedback } from '@/services/feedback';
import { booking } from '@/services/booking';
import { Booking, Feedback } from '@/types';

const TEMPERAMENT_OPTIONS = [
  { id: 'calm', label: 'Calm', description: 'Relaxed and laid-back' },
  { id: 'medium', label: 'Medium', description: 'Balanced energy' },
  { id: 'high', label: 'High', description: 'Very energetic' },
];

const COMPATIBILITY_OPTIONS = [
  { id: 'yes', label: 'Yes', icon: Check, color: colors.success },
  { id: 'no', label: 'No', icon: X, color: colors.error },
  { id: 'unknown', label: 'Unknown', icon: HelpCircle, color: colors.textSecondary },
];

export default function PostVisitFeedback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const [rating, setRating] = useState(0);
  const [temperament, setTemperament] = useState<'calm' | 'medium' | 'high' | ''>('');
  const [leashBehavior, setLeashBehavior] = useState('');
  const [houseManners, setHouseManners] = useState('');
  const [goodWithKids, setGoodWithKids] = useState<'yes' | 'no' | 'unknown' | ''>('');
  const [goodWithDogs, setGoodWithDogs] = useState<'yes' | 'no' | 'unknown' | ''>('');
  const [goodWithCats, setGoodWithCats] = useState<'yes' | 'no' | 'unknown' | ''>('');
  const [notes, setNotes] = useState('');
  const [wouldAdopt, setWouldAdopt] = useState<boolean | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await booking.get(bookingId);
      setBookingData(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
      showToast('Failed to load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    showToast('Photo upload coming soon', 'info');
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Please provide a rating', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const feedbackData: Feedback = {
        bookingId,
        rating,
        temperament: temperament || undefined,
        leashBehavior: leashBehavior || undefined,
        houseManners: houseManners || undefined,
        goodWithKids: goodWithKids || undefined,
        goodWithDogs: goodWithDogs || undefined,
        goodWithCats: goodWithCats || undefined,
        notes: notes || undefined,
        wouldAdopt: wouldAdopt ?? undefined,
      };

      const result = await feedback.submit(bookingId, feedbackData);

      if (result.success) {
        if (result.pointsEarned) {
          setPointsEarned(result.pointsEarned);
          setShowSuccessModal(true);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showToast('Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/home');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visit Feedback</Text>
        <Text style={styles.headerSubtitle}>Help us improve matches for everyone</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Experience</Text>
          <Text style={styles.sectionSubtitle}>How was your visit?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star
                  size={40}
                  color={star <= rating ? colors.warning : colors.border}
                  fill={star <= rating ? colors.warning : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperament</Text>
          <Text style={styles.sectionSubtitle}>What was their energy level?</Text>
          <View style={styles.optionsGrid}>
            {TEMPERAMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  temperament === option.id && styles.optionCardSelected,
                ]}
                onPress={() => setTemperament(option.id as any)}
              >
                <Text style={[
                  styles.optionLabel,
                  temperament === option.id && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behavior Observations</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Leash Behavior</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Pulled a bit, walked nicely, etc."
              placeholderTextColor={colors.textSecondary}
              value={leashBehavior}
              onChangeText={setLeashBehavior}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>House Manners</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Well-behaved, jumped on furniture, etc."
              placeholderTextColor={colors.textSecondary}
              value={houseManners}
              onChangeText={setHouseManners}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatibility</Text>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityLabel}>Good with kids?</Text>
            <View style={styles.compatibilityOptions}>
              {COMPATIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.compatibilityButton,
                      goodWithKids === option.id && styles.compatibilityButtonSelected,
                    ]}
                    onPress={() => setGoodWithKids(option.id as any)}
                  >
                    <Icon
                      size={20}
                      color={goodWithKids === option.id ? option.color : colors.textSecondary}
                    />
                    <Text style={[
                      styles.compatibilityText,
                      goodWithKids === option.id && { color: option.color },
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityLabel}>Good with dogs?</Text>
            <View style={styles.compatibilityOptions}>
              {COMPATIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.compatibilityButton,
                      goodWithDogs === option.id && styles.compatibilityButtonSelected,
                    ]}
                    onPress={() => setGoodWithDogs(option.id as any)}
                  >
                    <Icon
                      size={20}
                      color={goodWithDogs === option.id ? option.color : colors.textSecondary}
                    />
                    <Text style={[
                      styles.compatibilityText,
                      goodWithDogs === option.id && { color: option.color },
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityLabel}>Good with cats?</Text>
            <View style={styles.compatibilityOptions}>
              {COMPATIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.compatibilityButton,
                      goodWithCats === option.id && styles.compatibilityButtonSelected,
                    ]}
                    onPress={() => setGoodWithCats(option.id as any)}
                  >
                    <Icon
                      size={20}
                      color={goodWithCats === option.id ? option.color : colors.textSecondary}
                    />
                    <Text style={[
                      styles.compatibilityText,
                      goodWithCats === option.id && { color: option.color },
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share any other observations about your visit..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{notes.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoUpload} onPress={handlePhotoUpload}>
            <Camera size={32} color={colors.textSecondary} />
            <Text style={styles.photoUploadText}>Add a photo from your visit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Interest</Text>
          <View style={styles.adoptionButtons}>
            <TouchableOpacity
              style={[
                styles.adoptionButton,
                wouldAdopt === true && styles.adoptionButtonSelected,
              ]}
              onPress={() => setWouldAdopt(true)}
            >
              <Text style={[
                styles.adoptionButtonText,
                wouldAdopt === true && styles.adoptionButtonTextSelected,
              ]}>
                Interested in Adopting
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.adoptionButton,
                wouldAdopt === false && styles.adoptionButtonSelected,
              ]}
              onPress={() => setWouldAdopt(false)}
            >
              <Text style={[
                styles.adoptionButtonText,
                wouldAdopt === false && styles.adoptionButtonTextSelected,
              ]}>
                Not Right Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={submitting ? 'Submitting...' : 'Submit Feedback'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={rating === 0 || submitting}
        />
      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Award size={64} color={colors.warning} />
            </View>
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successMessage}>
              Your feedback helps improve matches for everyone
            </Text>
            <View style={styles.pointsCard}>
              <Text style={styles.pointsLabel}>You Earned</Text>
              <Text style={styles.pointsValue}>+{pointsEarned} Points</Text>
            </View>
            <Button title="Done" onPress={handleSuccessClose} />
          </View>
        </View>
      </Modal>

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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  starButton: {
    padding: spacing.sm,
  },
  optionsGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  compatibilitySection: {
    marginBottom: spacing.lg,
  },
  compatibilityLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  compatibilityOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compatibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compatibilityButtonSelected: {
    borderWidth: 2,
  },
  compatibilityText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  photoUpload: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  photoUploadText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  adoptionButtons: {
    gap: spacing.sm,
  },
  adoptionButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  adoptionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  adoptionButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  adoptionButtonTextSelected: {
    color: colors.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    ...typography.h1,
    color: colors.text,
  },
  successMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pointsCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  pointsLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pointsValue: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
  },
});
