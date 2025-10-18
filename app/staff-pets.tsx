import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { staff, StaffPet, PetFilters } from '@/services/staff';
import { PetFilterBar } from '@/components/PetFilterBar';
import { StaffPetCard } from '@/components/StaffPetCard';
import { EmptyState } from '@/components/EmptyState';
import { PawPrint } from 'lucide-react-native';
import { BookingSkeleton } from '@/components/BookingSkeleton';

export default function StaffPets() {
  const router = useRouter();
  const [pets, setPets] = useState<StaffPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<PetFilters>({});

  useEffect(() => {
    loadPets();
  }, [filters]);

  const loadPets = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await staff.getPets(filters);
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    loadPets(true);
  };

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: '/staff-pet-detail',
      params: { petId },
    });
  };

  const getEmptyMessage = () => {
    if (filters.availability === 'AVAILABLE') {
      return 'No pets are currently available for visits.';
    }
    if (filters.availability === 'HOLD') {
      return 'No pets are currently on hold.';
    }
    if (filters.availability === 'ADOPTED') {
      return 'No pets have been adopted recently.';
    }
    return 'No pets found matching your filters.';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Inventory</Text>
      </View>

      <PetFilterBar filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3].map((i) => (
            <BookingSkeleton key={i} />
          ))}
        </ScrollView>
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={64} color={colors.textSecondary} />}
          title="No pets found"
          message={getEmptyMessage()}
          actionLabel="Clear Filters"
          onAction={() => setFilters({})}
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text style={styles.resultsCount}>
            {pets.length} pet{pets.length !== 1 ? 's' : ''} found
          </Text>
          <View style={styles.grid}>
            {pets.map((pet) => (
              <View key={pet.petId} style={styles.gridItem}>
                <StaffPetCard pet={pet} onPress={handlePetPress} />
              </View>
            ))}
          </View>
        </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
  },
});
