import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function Index() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/onboarding');
      } else if (user.role === 'staff') {
        router.replace('/(staff-tabs)');
      } else if (!profile) {
        router.replace('/profile-setup-intro');
      } else {
        router.replace('/(tabs)');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, profile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
});
