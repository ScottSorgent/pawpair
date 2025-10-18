import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Tag } from '@/components/Tag';
import { ArrowLeft } from 'lucide-react-native';

export default function ProfileSetupForm() {
  const router = useRouter();

  const [homeType, setHomeType] = useState<string>('');
  const [hoursAtHome, setHoursAtHome] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [preferredPetEnergy, setPreferredPetEnergy] = useState<string>('');
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [hasOtherPets, setHasOtherPets] = useState<boolean | null>(null);
  const [distanceRange, setDistanceRange] = useState<number>(10);
  const [allergies, setAllergies] = useState<string[]>([]);

  const homeTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Farm'];
  const hoursOptions = ['0-4 hours', '4-8 hours', '8+ hours', 'Work from home'];
  const activityLevels = ['Low', 'Moderate', 'High', 'Very High'];
  const energyLevels = ['Calm', 'Moderate', 'Energetic', 'Very Energetic'];
  const distanceOptions = [5, 10, 25, 50, 100];
  const allergyOptions = ['Dogs', 'Cats', 'Pet Dander', 'None'];

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setAllergies(['None']);
    } else {
      const filtered = allergies.filter((a) => a !== 'None');
      if (allergies.includes(allergy)) {
        setAllergies(filtered.filter((a) => a !== allergy));
      } else {
        setAllergies([...filtered, allergy]);
      }
    }
  };

  const handleContinue = () => {
    const profileData = {
      homeType,
      hoursAtHome,
      activityLevel,
      preferredPetEnergy,
      hasChildren: hasChildren ?? false,
      hasOtherPets: hasOtherPets ?? false,
      distanceRange,
      allergies: allergies.includes('None') ? [] : allergies,
    };

    router.push({
      pathname: '/profile-review',
      params: { data: JSON.stringify(profileData) },
    });
  };

  const isFormComplete = () => {
    return (
      homeType &&
      hoursAtHome &&
      activityLevel &&
      preferredPetEnergy &&
      hasChildren !== null &&
      hasOtherPets !== null &&
      allergies.length > 0
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Lifestyle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Home Type</Text>
        <View style={styles.optionGrid}>
          {homeTypes.map((type) => (
            <Tag
              key={type}
              label={type}
              selected={homeType === type}
              onPress={() => setHomeType(type)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Hours at Home per Day</Text>
        <View style={styles.optionGrid}>
          {hoursOptions.map((option) => (
            <Tag
              key={option}
              label={option}
              selected={hoursAtHome === option}
              onPress={() => setHoursAtHome(option)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Your Activity Level</Text>
        <View style={styles.optionGrid}>
          {activityLevels.map((level) => (
            <Tag
              key={level}
              label={level}
              selected={activityLevel === level}
              onPress={() => setActivityLevel(level)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preferred Pet Energy</Text>
        <View style={styles.optionGrid}>
          {energyLevels.map((level) => (
            <Tag
              key={level}
              label={level}
              selected={preferredPetEnergy === level}
              onPress={() => setPreferredPetEnergy(level)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Do you have children?</Text>
        <View style={styles.optionRow}>
          <Tag
            label="Yes"
            selected={hasChildren === true}
            onPress={() => setHasChildren(true)}
          />
          <Tag
            label="No"
            selected={hasChildren === false}
            onPress={() => setHasChildren(false)}
          />
        </View>

        <Text style={styles.sectionTitle}>Do you have other pets?</Text>
        <View style={styles.optionRow}>
          <Tag
            label="Yes"
            selected={hasOtherPets === true}
            onPress={() => setHasOtherPets(true)}
          />
          <Tag
            label="No"
            selected={hasOtherPets === false}
            onPress={() => setHasOtherPets(false)}
          />
        </View>

        <Text style={styles.sectionTitle}>Distance Range (miles)</Text>
        <View style={styles.optionGrid}>
          {distanceOptions.map((distance) => (
            <Tag
              key={distance}
              label={`${distance} mi`}
              selected={distanceRange === distance}
              onPress={() => setDistanceRange(distance)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Allergies</Text>
        <View style={styles.optionGrid}>
          {allergyOptions.map((allergy) => (
            <Tag
              key={allergy}
              label={allergy}
              selected={allergies.includes(allergy)}
              onPress={() => toggleAllergy(allergy)}
            />
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Review & Continue"
          onPress={handleContinue}
          disabled={!isFormComplete()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  spacer: {
    height: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
