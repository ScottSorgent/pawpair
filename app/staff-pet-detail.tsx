import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/theme';
import { staff, StaffPet, PetAvailability } from '@/services/staff';
import { ImageCarousel, RatingStars, Button, Toast, Badge } from '@/components';
import { X, Users, Dog, Cat, Zap } from 'lucide-react-native';

export default function StaffPetDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const petId = params.petId as string;

  const [pet, setPet] = useState<StaffPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<PetAvailability>('AVAILABLE');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPet();
  }, [petId]);

  const loadPet = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await staff.getPetDetail(petId);
      setPet(data);
      if (data) {
        setSelectedAvailability(data.availability);
      }
    } catch (error) {
      setToast({ message: 'Failed to load pet', type: 'error' });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    loadPet(true);
  };

  const handleSaveAvailability = async () => {
    if (!pet) return;

    const previousAvailability = pet.availability;
    setPet({ ...pet, availability: selectedAvailability });
    setToast({ message: 'Availability updated', type: 'success' });

    try {
      await staff.updatePetAvailability(pet.petId, selectedAvailability, 'staff-001');
    } catch (error) {
      setPet({ ...pet, availability: previousAvailability });
      setSelectedAvailability(previousAvailability);
      setToast({ message: 'Failed to update availability', type: 'error' });
    }
  };

  const handleAddNote = () => {
    Alert.prompt(
      'Add Quick Note',
      'Enter a note about this pet:',
      async (text) => {
        if (text && pet) {
          setToast({ message: 'Note added', type: 'success' });
          try {
            await staff.addPetNote(pet.petId, text);
          } catch (error) {
            setToast({ message: 'Failed to add note', type: 'error' });
          }
        }
      }
    );
  };

  const handleCreateBooking = () => {
    Alert.alert('Create Booking', 'This feature will open booking creation with pet pre-selected.');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ImageCarousel images={pet.photos} height={300} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Species</Text>
              <Text style={styles.infoValue}>{pet.species}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{pet.breedMix}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{pet.age}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sex</Text>
              <Text style={styles.infoValue}>{pet.sex}</Text>
            </View>
            {pet.weight && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{pet.weight}</Text>
              </View>
            )}
          </View>
          {pet.description && (
            <Text style={styles.description}>{pet.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperament Tags</Text>
          <View style={styles.tagGrid}>
            <View style={styles.tag}>
              <Zap size={16} color={colors.primary} />
              <Text style={styles.tagText}>Energy: {pet.tags.energy}</Text>
            </View>
            {pet.tags.kidFriendly && (
              <View style={styles.tag}>
                <Users size={16} color={colors.success} />
                <Text style={styles.tagText}>Kid Friendly</Text>
              </View>
            )}
            {pet.tags.dogFriendly && (
              <View style={styles.tag}>
                <Dog size={16} color={colors.success} />
                <Text style={styles.tagText}>Dog Friendly</Text>
              </View>
            )}
            {pet.tags.catFriendly && (
              <View style={styles.tag}>
                <Cat size={16} color={colors.success} />
                <Text style={styles.tagText}>Cat Friendly</Text>
              </View>
            )}
          </View>
        </View>

        {pet.recentFeedback && pet.recentFeedback.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Feedback</Text>
            {pet.recentFeedback.slice(0, 3).map((feedback, index) => (
              <View key={index} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackUser}>{feedback.userName}</Text>
                  <RatingStars rating={feedback.rating} size={14} />
                </View>
                <Text style={styles.feedbackComment}>{feedback.comment}</Text>
                <Text style={styles.feedbackDate}>
                  {new Date(feedback.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityRow}>
            {(['AVAILABLE', 'HOLD', 'ADOPTED'] as PetAvailability[]).map((availability) => (
              <TouchableOpacity
                key={availability}
                style={styles.availabilityBadge}
                onPress={() => setSelectedAvailability(availability)}
              >
                <Badge
                  text={availability === 'AVAILABLE' ? 'Available' : availability === 'HOLD' ? 'Hold' : 'Adopted'}
                  color={availability === 'AVAILABLE' ? colors.available : availability === 'HOLD' ? colors.hold : colors.adopted}
                  variant={selectedAvailability === availability ? 'solid' : 'outline'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {selectedAvailability !== pet.availability && (
            <Button
              title="Save Availability"
              onPress={handleSaveAvailability}
              variant="primary"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Add Quick Note"
              onPress={handleAddNote}
              variant="outline"
            />
            <Button
              title="Create Booking"
              onPress={handleCreateBooking}
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={true}
          onHide={() => setToast(null)}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackUser: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  feedbackComment: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  feedbackDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  availabilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  availabilityBadge: {
    flex: 0,
  },
  actionsGrid: {
    gap: 12,
  },
});
