import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/constants/theme';
import { StaffPet } from '@/services/staff';
import { Card } from './Card';
import { RatingStars } from './RatingStars';

interface StaffPetCardProps {
  pet: StaffPet;
  onPress: (petId: string) => void;
}

export function StaffPetCard({ pet, onPress }: StaffPetCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return colors.available;
      case 'HOLD':
        return colors.hold;
      case 'ADOPTED':
        return colors.adopted;
      default:
        return colors.textSecondary;
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'Available';
      case 'HOLD':
        return 'On Hold';
      case 'ADOPTED':
        return 'Adopted';
      default:
        return availability;
    }
  };

  return (
    <Card style={styles.container} onPress={() => onPress(pet.petId)}>
      <Image source={{ uri: pet.photos[0] }} style={styles.photo} />
      <View style={styles.content}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.breed}>
          {pet.species} • {pet.breedMix}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: getAvailabilityColor(pet.availability) }]}>
            <Text style={styles.badgeText}>{getAvailabilityLabel(pet.availability)}</Text>
          </View>
          {pet.avgRating && (
            <View style={styles.rating}>
              <RatingStars rating={pet.avgRating} size={14} />
              <Text style={styles.ratingText}>{pet.avgRating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
    padding: 0,
  },
  photo: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  breed: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
