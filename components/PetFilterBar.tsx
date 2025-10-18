import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/constants/theme';
import { Species, PetAvailability, PetFilters } from '@/services/staff';
import { Search, X } from 'lucide-react-native';

interface PetFilterBarProps {
  filters: PetFilters;
  onFiltersChange: (filters: PetFilters) => void;
}

export function PetFilterBar({ filters, onFiltersChange }: PetFilterBarProps) {
  const speciesOptions: Species[] = ['Dog', 'Cat', 'Other'];
  const availabilityOptions: (PetAvailability | 'All')[] = ['All', 'AVAILABLE', 'HOLD', 'ADOPTED'];

  const handleSpeciesToggle = (species: Species) => {
    onFiltersChange({
      ...filters,
      species: filters.species === species ? undefined : species,
    });
  };

  const handleAvailabilityToggle = (availability: PetAvailability | 'All') => {
    onFiltersChange({
      ...filters,
      availability: availability === 'All' ? undefined : availability,
    });
  };

  const getAvailabilityLabel = (availability: PetAvailability | 'All') => {
    if (availability === 'All') return 'All';
    if (availability === 'AVAILABLE') return 'Available';
    if (availability === 'HOLD') return 'Hold';
    if (availability === 'ADOPTED') return 'Adopted';
    return availability;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pets by name or breed..."
          placeholderTextColor={colors.textSecondary}
          value={filters.search || ''}
          onChangeText={(text) => onFiltersChange({ ...filters, search: text || undefined })}
        />
        {filters.search && (
          <TouchableOpacity onPress={() => onFiltersChange({ ...filters, search: undefined })}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Species</Text>
        <View style={styles.chipRow}>
          {speciesOptions.map((species) => (
            <TouchableOpacity
              key={species}
              style={[
                styles.chip,
                filters.species === species && styles.chipActive,
              ]}
              onPress={() => handleSpeciesToggle(species)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.species === species && styles.chipTextActive,
                ]}
              >
                {species}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Availability</Text>
        <View style={styles.chipRow}>
          {availabilityOptions.map((availability) => (
            <TouchableOpacity
              key={availability}
              style={[
                styles.chip,
                (availability === 'All' ? !filters.availability : filters.availability === availability) &&
                  styles.chipActive,
              ]}
              onPress={() => handleAvailabilityToggle(availability)}
            >
              <Text
                style={[
                  styles.chipText,
                  (availability === 'All' ? !filters.availability : filters.availability === availability) &&
                    styles.chipTextActive,
                ]}
              >
                {getAvailabilityLabel(availability)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.surface,
  },
});
