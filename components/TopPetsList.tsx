import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { RatingStars } from './RatingStars';
import { TopPet } from '@/services/staff';

interface TopPetsListProps {
  pets: TopPet[];
  title: string;
}

export function TopPetsList({ pets, title }: TopPetsListProps) {
  const maxVisits = Math.max(...pets.map((p) => p.visits));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {pets.map((pet, index) => {
          const barWidth = (pet.visits / maxVisits) * 100;
          return (
            <View key={pet.petId} style={styles.petItem}>
              <View style={styles.petHeader}>
                <View style={styles.petInfo}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Text style={styles.petName}>{pet.name}</Text>
                </View>
                <View style={styles.petStats}>
                  <Text style={styles.visits}>{pet.visits} visits</Text>
                  <RatingStars rating={pet.avgRating} size={12} />
                </View>
              </View>
              <View style={styles.barBackground}>
                <View style={[styles.bar, { width: `${barWidth}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  petItem: {
    gap: 8,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    width: 30,
  },
  petName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  petStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  visits: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  barBackground: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
