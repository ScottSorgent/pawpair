import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Tag } from '@/components/Tag';
import { Toast } from '@/components/Toast';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useStore } from '@/store/useStore';

interface ProfileData {
  homeType: string;
  hoursAtHome: string;
  activityLevel: string;
  preferredPetEnergy: string;
  hasChildren: boolean;
  hasOtherPets: boolean;
  distanceRange: number;
  allergies: string[];
}

export default function ProfileReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, message: '', type: 'info' });

  const user = useStore((state) => state.user);
  const setProfile = useStore((state) => state.setProfile);

  useEffect(() => {
    if (params.data && typeof params.data === 'string') {
      try {
        const data = JSON.parse(params.data);
        setProfileData(data);
      } catch (error) {
        console.error('Failed to parse profile data:', error);
        router.back();
      }
    }
  }, [params.data]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleSave = async () => {
    if (!profileData || !user) return;

    setLoading(true);
    try {
      const newProfile = {
        userId: user.id,
        preferences: {},
        lifestyle: {
          homeType: profileData.homeType,
          hoursAtHome: profileData.hoursAtHome,
          activityLevel: profileData.activityLevel,
          preferredPetEnergy: profileData.preferredPetEnergy,
          hasChildren: profileData.hasChildren,
          hasOtherPets: profileData.hasOtherPets,
          distanceRange: profileData.distanceRange,
          allergies: profileData.allergies,
        },
      };

      setProfile(newProfile);
      showToast('Profile saved successfully!', 'success');

      setTimeout(() => {
        router.replace('/background-check-intro');
      }, 1000);
    } catch (error) {
      showToast('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Review Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color={colors.success} />
          </View>
          <Text style={styles.title}>Looking Great!</Text>
          <Text style={styles.subtitle}>
            Review your preferences and we'll find your perfect match
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Type</Text>
          <View style={styles.chipContainer}>
            <Tag label={profileData.homeType} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours at Home</Text>
          <View style={styles.chipContainer}>
            <Tag label={profileData.hoursAtHome} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.chipContainer}>
            <Tag label={profileData.activityLevel} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Pet Energy</Text>
          <View style={styles.chipContainer}>
            <Tag label={profileData.preferredPetEnergy} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household</Text>
          <View style={styles.chipContainer}>
            <Tag label={profileData.hasChildren ? 'Has Children' : 'No Children'} selected />
            <Tag label={profileData.hasOtherPets ? 'Has Other Pets' : 'No Other Pets'} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Range</Text>
          <View style={styles.chipContainer}>
            <Tag label={`${profileData.distanceRange} miles`} selected />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.chipContainer}>
            {profileData.allergies.length === 0 ? (
              <Tag label="None" selected />
            ) : (
              profileData.allergies.map((allergy) => (
                <Tag key={allergy} label={allergy} selected />
              ))
            )}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save & See Matches"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
        />
      </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
