import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { useTheme } from '../src/hooks';
import { githubService } from '../src/services';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { config, setConfig, themeMode, setThemeMode } = useStore();

  const [token, setToken] = useState(config.githubToken);
  const [owner, setOwner] = useState(config.owner || '');
  const [repo, setRepo] = useState(config.repo || '');
  const [isValidating, setIsValidating] = useState(false);

  const themeOptions: { value: ThemeOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  const handleSaveToken = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter a GitHub token.');
      return;
    }

    setIsValidating(true);
    try {
      githubService.setToken(token.trim());
      const user = await githubService.getCurrentUser();
      setConfig({ githubToken: token.trim() });
      Alert.alert(
        'Success',
        `Authenticated as ${user.login}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid token. Please check and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveRepo = () => {
    setConfig({ owner: owner.trim(), repo: repo.trim() });
    Alert.alert('Saved', 'Repository configuration saved.');
  };

  const handleOpenGitHubTokenPage = () => {
    Linking.openURL('https://github.com/settings/tokens/new?scopes=repo,project&description=Octodo%20App');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.themeOption,
                  themeMode === option.value && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                  { borderColor: colors.border },
                ]}
                onPress={() => setThemeMode(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={themeMode === option.value ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === option.value
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          GITHUB AUTHENTICATION
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Personal Access Token
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Create a token with 'repo' and 'project' scopes.
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            placeholderTextColor={colors.textTertiary}
            value={token}
            onChangeText={setToken}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleOpenGitHubTokenPage}
            >
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Create Token
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: isValidating ? 0.6 : 1 },
              ]}
              onPress={handleSaveToken}
              disabled={isValidating}
            >
              <Text style={styles.primaryButtonText}>
                {isValidating ? 'Validating...' : 'Save Token'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          DEFAULT REPOSITORY
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Repository for New Todos
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            New todos will be created as issues in this repository.
          </Text>
          <View style={styles.repoInputRow}>
            <TextInput
              style={[
                styles.input,
                styles.repoInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="owner"
              placeholderTextColor={colors.textTertiary}
              value={owner}
              onChangeText={setOwner}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.repoSeparator, { color: colors.textTertiary }]}>
              /
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.repoInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="repo"
              placeholderTextColor={colors.textTertiary}
              value={repo}
              onChangeText={setRepo}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveRepo}
          >
            <Text style={styles.primaryButtonText}>Save Repository</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ABOUT
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            style={styles.aboutRow}
            onPress={() => Linking.openURL('https://github.com')}
          >
            <View style={styles.aboutRowLeft}>
              <Ionicons name="logo-github" size={24} color={colors.text} />
              <Text style={[styles.aboutRowText, { color: colors.text }]}>
                View on GitHub
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.aboutRow}>
            <View style={styles.aboutRowLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.aboutRowText, { color: colors.text }]}>
                Version
              </Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  repoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  repoInput: {
    flex: 1,
  },
  repoSeparator: {
    fontSize: 20,
    fontWeight: '300',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  aboutRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutRowText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
