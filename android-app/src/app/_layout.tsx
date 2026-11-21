import React, { useEffect } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CycleProvider } from '@/context/CycleContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Prevent crash if called multiple times in development
});

function RootNavigationLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments as string[])[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Unauthenticated users are redirected to login
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated users are redirected to main tabs
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="cycle/setup"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="checklist/yesterday"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="score/[date]"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <AuthProvider>
          <CycleProvider>
            <RootNavigationLayout />
          </CycleProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
