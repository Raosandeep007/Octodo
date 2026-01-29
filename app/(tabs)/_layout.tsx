import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useTheme } from '../../src/hooks';

export default function TabLayout() {
  const { colors } = useTheme();

  const SettingsButton = () => (
    <Pressable
      onPress={() => router.push('/settings')}
      style={{ marginRight: 16 }}
      hitSlop={8}
    >
      <Ionicons name="settings-outline" size={24} color={colors.text} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => <SettingsButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Todos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title: 'All Issues',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ size }) => (
            <Ionicons name="add-circle" size={size + 8} color={colors.primary} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
