import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Text,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/hooks';
import { githubService } from '../../src/services';
import { IssueItem, EmptyState, LoadingSpinner } from '../../src/components';
import { GitHubIssue } from '../../src/types';

type FilterState = 'open' | 'closed' | 'all';

export default function AllIssuesScreen() {
  const { colors } = useTheme();
  const {
    allIssues,
    setAllIssues,
    config,
    isLoading,
    setIsLoading,
    refreshing,
    setRefreshing,
  } = useStore();

  const [filter, setFilter] = useState<FilterState>('open');

  const loadIssues = useCallback(async () => {
    if (!config.githubToken) {
      return;
    }

    try {
      setIsLoading(true);
      const issues = await githubService.getAssignedIssues();
      setAllIssues(issues);
    } catch (error) {
      console.error('Failed to load issues:', error);
      Alert.alert('Error', 'Failed to load issues. Please check your settings.');
    } finally {
      setIsLoading(false);
    }
  }, [config.githubToken]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  }, [loadIssues]);

  useEffect(() => {
    if (config.githubToken) {
      loadIssues();
    }
  }, [config.githubToken]);

  const handleIssuePress = useCallback((issue: GitHubIssue) => {
    if (issue.html_url) {
      Linking.openURL(issue.html_url);
    }
  }, []);

  const filteredIssues = allIssues.filter((issue) => {
    switch (filter) {
      case 'open':
        return issue.state === 'open';
      case 'closed':
        return issue.state === 'closed';
      default:
        return true;
    }
  });

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Assigned to You
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.filterRow}>
        {(['open', 'closed', 'all'] as const).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterButton,
              filter === f && {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
              { borderColor: colors.border },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? colors.primary : colors.textSecondary },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (!config.githubToken) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="key-outline"
          title="Setup Required"
          message="Please add your GitHub token in settings to view your issues."
        />
        <Pressable
          style={[styles.settingsButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.settingsButtonText}>Go to Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading && allIssues.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading your issues..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <IssueItem issue={item} onPress={handleIssuePress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="globe-outline"
            title="No Issues"
            message={
              filter === 'open'
                ? 'No open issues assigned to you.'
                : filter === 'closed'
                ? 'No closed issues found.'
                : 'No issues assigned to you.'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={filteredIssues.length === 0 && styles.emptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  count: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyList: {
    flex: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 32,
    marginBottom: 32,
    gap: 8,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
