import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from '../src/store';
import { useTheme } from '../src/hooks';
import { githubService } from '../src/services';
import Constants from 'expo-constants';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const { config, setConfig } = useStore();

  useEffect(() => {
    // Initialize GitHub token from environment variables
    const envToken = Constants.expoConfig?.extra?.githubToken ||
                     process.env.EXPO_PUBLIC_GITHUB_TOKEN ||
                     '';

    if (envToken && !config.githubToken) {
      setConfig({ githubToken: envToken });
      githubService.setToken(envToken);
    } else if (config.githubToken) {
      githubService.setToken(config.githubToken);
    }
  }, [config.githubToken]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
