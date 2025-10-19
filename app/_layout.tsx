import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="(staff-tabs)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />

        <Stack.Screen name="home" />
        <Stack.Screen name="my-visits" />
        <Stack.Screen name="saved-pets" />
        <Stack.Screen name="inbox" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="staff-dashboard" />
        <Stack.Screen name="staff-bookings" />
        <Stack.Screen name="staff-pets" />
        <Stack.Screen name="staff-reports" />

        <Stack.Screen
          name="onboarding"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="auth-choice"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="staff-sign-in"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="profile-setup-intro"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="profile-setup-form"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="profile-review"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="background-check"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="pet-detail"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="booking-start"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="booking-calendar"
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="booking-confirm"
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="booking-success"
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="post-visit-feedback"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen
          name="chat-thread"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="booking-detail"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="staff-pet-detail"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="shelter-map" />
        <Stack.Screen name="about" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
