import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { PetCard } from '@/components/PetCard';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Heart, Grid, List } from 'lucide-react-native';
import { pets as petsService } from '@/services/pets';
import { useStore } from '@/store/useStore';
import { Pet } from '@/types';

type ViewMode = 'grid' | 'list';

export default function SavedPets() {
  const router = useRouter();
  const favoritePetIds = useStore((state) => state.favoritePetIds);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadFavoritePets();
  }, [favoritePetIds]);

  const loadFavoritePets = async () => {
    setLoading(true);
    setError(null);
    try {
      const allPets = await petsService.list();
      const favorites = allPets.filter((pet) => favoritePetIds.includes(pet.id));
      setFavoritePets(favorites);
      setIsOffline(false);
    } catch (error: any) {
      console.error('Failed to load favorite pets:', error);
      const errorMessage = error.message || 'Failed to load saved pets';
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('offline')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePetPress = (petId: string) => {
    router.push(`/pet-detail?petId=${petId}`);
  };

  const handleRemoveFavorite = (petId: string) => {
    toggleFavorite(petId);
  };

  const renderGridItem = ({ item }: { item: Pet }) => (
    <View style={styles.gridItem}>
      <PetCard pet={item} onPress={() => handlePetPress(item.id)} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Heart size={20} color={colors.error} fill={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderListItem = ({ item }: { item: Pet }) => (
    <View style={styles.listItem}>
      <TouchableOpacity
        style={styles.listItemContent}
        onPress={() => handlePetPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <Text style={styles.listItemDetails}>
            {item.breed} • {item.age} yrs • {item.sex || 'Unknown'}
          </Text>
          <Text style={styles.listItemLocation}>Shelter</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.listFavoriteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Heart size={24} color={colors.error} fill={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner visible={isOffline} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Pets</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid
              size={20}
              color={viewMode === 'grid' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List
              size={20}
              color={viewMode === 'list' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon={Heart}
          title="Unable to Load Saved Pets"
          message={error}
          actionLabel="Retry"
          onAction={loadFavoritePets}
        />
      ) : favoritePets.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Saved Pets Yet"
          message="When you find pets you love, tap the heart icon to save them here."
          actionLabel="Browse Pets"
          onAction={() => router.push('/home')}
        />
      ) : (
        <FlatList
          data={favoritePets}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.list}
          columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  viewButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  viewButtonActive: {
    backgroundColor: colors.primary + '10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemInfo: {
    gap: spacing.xs,
  },
  listItemName: {
    ...typography.h3,
    color: colors.text,
  },
  listItemDetails: {
    ...typography.body,
    color: colors.textSecondary,
  },
  listItemLocation: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  listFavoriteButton: {
    padding: spacing.sm,
  },
});
