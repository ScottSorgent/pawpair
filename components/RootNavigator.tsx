import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useStore } from '@/store/useStore';

export function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inStaffTabsGroup = segments[0] === '(staff-tabs)';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/onboarding');
      }
    } else if (user.role === 'staff') {
      if (!inStaffTabsGroup && segments[0] !== 'pet-detail' && segments[0] !== 'chat-thread') {
        router.replace('/(staff-tabs)');
      }
    } else {
      if (!profile) {
        if (segments[0] !== 'profile-setup-intro' && segments[0] !== 'profile-setup-form' && segments[0] !== 'profile-review' && segments[0] !== 'background-check') {
          router.replace('/profile-setup-intro');
        }
      } else {
        if (!inTabsGroup && segments[0] !== 'pet-detail' && segments[0] !== 'booking-start' && segments[0] !== 'booking-calendar' && segments[0] !== 'booking-confirm' && segments[0] !== 'booking-success' && segments[0] !== 'chat-thread' && segments[0] !== 'post-visit-feedback' && segments[0] !== 'rewards' && segments[0] !== 'shelter-map') {
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, profile, segments]);

  return null;
}
