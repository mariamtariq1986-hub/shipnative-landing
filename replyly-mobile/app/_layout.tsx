import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts as useOutfit,
} from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReplylyProvider, useReplyly } from '../context/ReplylyContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator(): React.JSX.Element {
  const { ready, colors, themeMode } = useReplyly();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) return <></>;

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
        <Stack.Screen
          name="team"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout(): React.JSX.Element {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold, Fraunces_700Bold });
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (frauncesLoaded && outfitLoaded) {
      /* fonts ready — splash hidden after context ready */
    }
  }, [frauncesLoaded, outfitLoaded]);

  if (!frauncesLoaded || !outfitLoaded) return <></>;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReplylyProvider>
        <RootNavigator />
      </ReplylyProvider>
    </GestureHandlerRootView>
  );
}
