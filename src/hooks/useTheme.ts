import { useColorScheme } from 'react-native';
import { colors, ColorScheme, ThemeMode } from '../theme/colors';
import { useStore } from '../store';

export function useTheme(): { colors: ColorScheme; mode: ThemeMode; isDark: boolean } {
  const systemColorScheme = useColorScheme();
  const themeMode = useStore((state) => state.themeMode);

  const mode: ThemeMode = themeMode === 'system'
    ? (systemColorScheme ?? 'light')
    : themeMode;

  return {
    colors: colors[mode],
    mode,
    isDark: mode === 'dark',
  };
}
