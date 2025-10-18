import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Pet } from '@/types';
import { Tag } from './Tag';
import { MapPin, Heart, Calendar } from 'lucide-react-native';

interface PetCardProps {
  pet: Pet;
  matchScore?: number;
  distance?: number;
  onPress?: () => void;
  onSave?: () => void;
  onBookVisit?: () => void;
}

export function PetCard({ pet, matchScore, distance, onPress, onSave, onBookVisit }: PetCardProps) {
  const getAgeLabel = (age: number) => {
    if (age === 1) return '1 year';
    if (age < 1) return `${age * 12} months`;
    return `${age} years`;
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.imageUrl }} style={styles.image} />
          {matchScore && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{matchScore}% Match</Text>
            </View>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.7}>
            <Heart size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.age}>{getAgeLabel(pet.age)}</Text>
          </View>

          <Text style={styles.breed}>
            {pet.breed} • {pet.size}
          </Text>

          <View style={styles.tags}>
            {pet.temperament.slice(0, 3).map((trait) => (
              <Tag key={trait} label={trait} variant="primary" />
            ))}
          </View>

          {distance !== undefined && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.distance}>{distance} miles away</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={onBookVisit}
        >
          <Calendar size={16} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Book Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  matchText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  age: {
    ...typography.body,
    color: colors.textSecondary,
  },
  breed: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distance: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
