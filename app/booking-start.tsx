import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react-native';
import { pets } from '@/services/pets';
import { shelters } from '@/services/shelters';
import { Pet, Shelter } from '@/types';

export default function BookingStart() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const petId = params.petId as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [petId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const petData = await pets.get(petId);
      setPet(petData);

      const shelterData = await shelters.get(petData.shelterId);
      setShelter(shelterData);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (pet && shelter) {
      router.push(`/booking-calendar?petId=${petId}&shelterId=${shelter.id}`);
    }
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
        <Text style={styles.headerTitle}>Book a Visit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet {pet.name}</Text>
          <View style={styles.petCard}>
            <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed || 'Mixed Breed'}</Text>
              <Text style={styles.petDetails}>
                {pet.age} {pet.age === 1 ? 'year' : 'years'} old • {pet.size}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Location</Text>
          <View style={styles.shelterCard}>
            <Text style={styles.shelterName}>{shelter.name}</Text>

            <View style={styles.shelterDetail}>
              <MapPin size={18} color={colors.primary} />
              <View style={styles.shelterDetailText}>
                <Text style={styles.addressText}>{shelter.address}</Text>
                <Text style={styles.addressText}>
                  {shelter.city}, {shelter.state} {shelter.zipCode}
                </Text>
              </View>
            </View>

            <View style={styles.shelterDetail}>
              <Phone size={18} color={colors.textSecondary} />
              <Text style={styles.detailText}>{shelter.phone}</Text>
            </View>

            <View style={styles.shelterDetail}>
              <Clock size={18} color={colors.textSecondary} />
              <View style={styles.shelterDetailText}>
                <Text style={styles.detailText}>Operating Hours</Text>
                <Text style={styles.hoursText}>
                  Mon-Fri: {shelter.operatingHours.monday || 'Varies'}
                </Text>
                <Text style={styles.hoursText}>
                  Sat-Sun: {shelter.operatingHours.saturday || 'Varies'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What to Expect</Text>
          <Text style={styles.infoText}>
            During your visit, you'll have the opportunity to meet {pet.name}, ask questions, and learn more about their personality and needs. Our staff will be there to help and answer any questions you have.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Please Bring</Text>
          <Text style={styles.infoText}>• Valid photo ID</Text>
          <Text style={styles.infoText}>• Proof of address</Text>
          <Text style={styles.infoText}>• Questions about {pet.name}</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Choose Date & Time" onPress={handleContinue} />
      </View>
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
    marginBottom: spacing.xs,
  },
  petDetails: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  shelterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  shelterName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shelterDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  shelterDetailText: {
    flex: 1,
  },
  addressText: {
    ...typography.body,
    color: colors.text,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
  },
  hoursText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
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
