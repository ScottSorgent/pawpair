import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from './Button';
import { Tag } from './Tag';
import { X, MapPin } from 'lucide-react-native';

export interface FilterOptions {
  species: string[];
  age: string[];
  size: string[];
  gender: string[];
  energy: string[];
  kidFriendly: boolean | null;
  distance: number;
  location: string;
  organization: string | null;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterOptions;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

export function FilterModal({ visible, filters, onClose, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const speciesOptions = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Horse', 'Barnyard'];
  const ageOptions = [
    { label: 'Baby', value: 'baby' },
    { label: 'Young', value: 'young' },
    { label: 'Adult', value: 'adult' },
    { label: 'Senior', value: 'senior' },
  ];
  const sizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xlarge' },
  ];
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];
  const energyOptions = ['Low', 'Moderate', 'High'];
  const distanceOptions = [5, 10, 25, 50, 100];

  const toggleSpecies = (species: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      species: prev.species.includes(species)
        ? prev.species.filter((s) => s !== species)
        : [...prev.species, species],
    }));
  };

  const toggleAge = (age: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      age: prev.age.includes(age) ? prev.age.filter((a) => a !== age) : [...prev.age, age],
    }));
  };

  const toggleSize = (size: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      size: prev.size.includes(size) ? prev.size.filter((s) => s !== size) : [...prev.size, size],
    }));
  };

  const toggleGender = (gender: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
    }));
  };

  const toggleEnergy = (energy: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      energy: prev.energy.includes(energy)
        ? prev.energy.filter((e) => e !== energy)
        : [...prev.energy, energy],
    }));
  };

  const toggleKidFriendly = () => {
    setLocalFilters((prev) => ({
      ...prev,
      kidFriendly: prev.kidFriendly === true ? null : true,
    }));
  };

  const setDistance = (distance: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      distance,
    }));
  };

  const setLocation = (location: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      species: [],
      age: [],
      size: [],
      gender: [],
      energy: [],
      kidFriendly: null,
      distance: 25,
      location: filters.location,
      organization: null,
    };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationInput}>
                <MapPin size={18} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={localFilters.location}
                  onChangeText={setLocation}
                  placeholder="City, ZIP, or coordinates"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <Text style={styles.helperText}>
                e.g., "New York, NY", "94103", or "37.7749,-122.4194"
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Species</Text>
              <Text style={styles.sectionSubtitle}>Petfinder API filter</Text>
              <View style={styles.optionGrid}>
                {speciesOptions.map((species) => (
                  <Tag
                    key={species}
                    label={species}
                    selected={localFilters.species.includes(species)}
                    onPress={() => toggleSpecies(species)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Age</Text>
              <Text style={styles.sectionSubtitle}>Petfinder API filter</Text>
              <View style={styles.optionGrid}>
                {ageOptions.map((age) => (
                  <Tag
                    key={age.value}
                    label={age.label}
                    selected={localFilters.age.includes(age.value)}
                    onPress={() => toggleAge(age.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <Text style={styles.sectionSubtitle}>Petfinder API filter</Text>
              <View style={styles.optionGrid}>
                {sizeOptions.map((size) => (
                  <Tag
                    key={size.value}
                    label={size.label}
                    selected={localFilters.size.includes(size.value)}
                    onPress={() => toggleSize(size.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <Text style={styles.sectionSubtitle}>Petfinder API filter</Text>
              <View style={styles.optionGrid}>
                {genderOptions.map((gender) => (
                  <Tag
                    key={gender.value}
                    label={gender.label}
                    selected={localFilters.gender.includes(gender.value)}
                    onPress={() => toggleGender(gender.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance</Text>
              <Text style={styles.sectionSubtitle}>Petfinder API filter (miles)</Text>
              <View style={styles.optionGrid}>
                {distanceOptions.map((distance) => (
                  <Tag
                    key={distance}
                    label={`${distance} mi`}
                    selected={localFilters.distance === distance}
                    onPress={() => setDistance(distance)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Energy Level</Text>
              <Text style={styles.sectionSubtitle}>Client-side filter (applied after API results)</Text>
              <View style={styles.optionGrid}>
                {energyOptions.map((energy) => (
                  <Tag
                    key={energy}
                    label={energy}
                    selected={localFilters.energy.includes(energy)}
                    onPress={() => toggleEnergy(energy)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Good with Kids</Text>
              <Text style={styles.sectionSubtitle}>Client-side filter (applied after API results)</Text>
              <View style={styles.optionGrid}>
                <Tag
                  label="Kid-Friendly"
                  selected={localFilters.kidFriendly === true}
                  onPress={toggleKidFriendly}
                />
              </View>
            </View>

            {localFilters.organization && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Organization</Text>
                <Text style={styles.sectionSubtitle}>Petfinder API filter (from Shelter Map)</Text>
                <View style={styles.organizationBadge}>
                  <Text style={styles.organizationText}>Filtering by: {localFilters.organization}</Text>
                  <TouchableOpacity onPress={() => setLocalFilters({ ...localFilters, organization: null })}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Button title="Apply Filters" onPress={handleApply} style={styles.applyButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  organizationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  organizationText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  spacer: {
    height: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
  },
});
