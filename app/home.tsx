import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { PetCard } from '@/components/PetCard';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { Tag } from '@/components/Tag';
import { Toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Search, Bell, SlidersHorizontal, Heart, AlertCircle, X } from 'lucide-react-native';
import { pets } from '@/services/pets';
import { Pet } from '@/types';

export default function Home() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);
  const backgroundCheckStatus = useStore((state) => state.backgroundCheckStatus);
  const setBackgroundCheckStatus = useStore((state) => state.setBackgroundCheckStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    species: [],
    age: [],
    size: [],
    gender: [],
    energy: [],
    kidFriendly: null,
    distance: 25,
    location: '',
    organization: null,
  });
  const [petList, setPetList] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showBackgroundCheckBanner, setShowBackgroundCheckBanner] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const quickFilters = [
    { label: 'Dog', value: 'dog' },
    { label: 'Cat', value: 'cat' },
    { label: 'Kid-Friendly', value: 'kid-friendly' },
    { label: 'Low-Shedding', value: 'low-shedding' },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadPets();
    setShowBackgroundCheckBanner(backgroundCheckStatus === 'required');
  }, [backgroundCheckStatus]);

  const loadPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const defaultProfile = profile || {
        userId: user?.id || '',
        preferences: {},
      };
      const recommendedPets = await pets.recommended(defaultProfile);
      setPetList(recommendedPets);
      setIsOffline(false);
    } catch (error: any) {
      console.error('Failed to load pets:', error);
      const errorMessage = error.message || 'Failed to load pets';
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('offline')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (pet: Pet): number => {
    if (!profile?.lifestyle) return 75;

    let score = 75;

    if (profile.lifestyle.preferredPetEnergy) {
      const energyMatch = pet.temperament.some(t =>
        t.toLowerCase().includes(profile.lifestyle!.preferredPetEnergy!.toLowerCase())
      );
      if (energyMatch) score += 10;
    }

    if (profile.lifestyle.hasChildren && pet.temperament.includes('gentle')) {
      score += 10;
    }

    if (profile.lifestyle.activityLevel === 'High' && pet.temperament.includes('energetic')) {
      score += 5;
    }

    return Math.min(score, 98);
  };

  const getRandomDistance = (): number => {
    return Math.floor(Math.random() * 20) + 2;
  };

  const handleQuickFilter = (value: string) => {
    setSelectedQuickFilter(selectedQuickFilter === value ? null : value);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    showToast('Filters applied', 'success');
  };

  const handlePetPress = (petId: string) => {
    router.push(`/pet-detail?id=${petId}`);
  };

  const handleSavePet = (petId: string) => {
    showToast('Saved to favorites', 'success');
  };

  const handleBookVisit = (petId: string) => {
    if (backgroundCheckStatus !== 'approved') {
      showToast('Complete your background check to book visits', 'warning');
      return;
    }
    router.push(`/booking-start?petId=${petId}`);
  };

  const handleCompleteBackgroundCheck = () => {
    router.push('/background-check-intro');
  };

  const handleDismissBanner = () => {
    setShowBackgroundCheckBanner(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner visible={isOffline} />

      {showBackgroundCheckBanner && (
        <View style={styles.backgroundCheckBanner}>
          <View style={styles.bannerContent}>
            <AlertCircle size={20} color={colors.warning} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Background Check Required</Text>
              <Text style={styles.bannerText}>
                Complete your background check to book shelter visits
              </Text>
            </View>
            <TouchableOpacity onPress={handleDismissBanner} style={styles.bannerClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={handleCompleteBackgroundCheck}
          >
            <Text style={styles.bannerButtonText}>Complete Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilters}>
          {quickFilters.map((filter) => (
            <Tag
              key={filter.value}
              label={filter.label}
              selected={selectedQuickFilter === filter.value}
              onPress={() => handleQuickFilter(filter.value)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding your perfect match...</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon={Heart}
          title="Unable to Load Pets"
          message={error}
          actionLabel="Retry"
          onAction={loadPets}
        />
      ) : petList.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matches Found"
          message="Try adjusting your filters or check back later for new pets."
          actionLabel="Clear Filters"
          onAction={() => {
            setFilters({
              species: [],
              age: [],
              size: [],
              gender: [],
              energy: [],
              kidFriendly: null,
              distance: 25,
              location: '',
              organization: null,
            });
            setSelectedQuickFilter(null);
            loadPets();
          }}
        />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {petList.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              matchScore={calculateMatchScore(pet)}
              distance={getRandomDistance()}
              onPress={() => handlePetPress(pet.id)}
              onSave={() => handleSavePet(pet.id)}
              onBookVisit={() => handleBookVisit(pet.id)}
            />
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.9}
      >
        <SlidersHorizontal size={24} color={colors.surface} />
      </TouchableOpacity>

      <FilterModal
        visible={showFilterModal}
        filters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />

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
  backgroundCheckBanner: {
    backgroundColor: colors.warning + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '30',
    padding: spacing.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bannerClose: {
    padding: spacing.xs,
  },
  bannerButton: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
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
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  quickFiltersContainer: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickFilters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
