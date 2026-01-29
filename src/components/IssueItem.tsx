import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GitHubIssue } from '../types';
import { useTheme } from '../hooks';

interface IssueItemProps {
  issue: GitHubIssue;
  onPress?: (issue: GitHubIssue) => void;
}

export function IssueItem({ issue, onPress }: IssueItemProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const repoName = issue.repository?.full_name || '';

  return (
    <Pressable
      onPress={() => onPress?.(issue)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={issue.state === 'open' ? 'radio-button-on' : 'checkmark-circle'}
          size={18}
          color={issue.state === 'open' ? colors.success : colors.textTertiary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {issue.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {repoName && (
            <Text
              style={[styles.repo, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {repoName}
            </Text>
          )}
          <Text style={[styles.separator, { color: colors.textTertiary }]}>
            {' '}
            #{issue.number}
          </Text>
          <Text style={[styles.separator, { color: colors.textTertiary }]}>
            {' '}
            · {formatDate(issue.updated_at)}
          </Text>
        </View>

        {issue.labels.length > 0 && (
          <View style={styles.labelsRow}>
            {issue.labels.slice(0, 3).map((label) => (
              <View
                key={label.id}
                style={[
                  styles.label,
                  { backgroundColor: `#${label.color}20` },
                ]}
              >
                <View
                  style={[
                    styles.labelDot,
                    { backgroundColor: `#${label.color}` },
                  ]}
                />
                <Text
                  style={[styles.labelText, { color: `#${label.color}` }]}
                  numberOfLines={1}
                >
                  {label.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {issue.assignees && issue.assignees.length > 0 && (
        <View style={styles.assigneesContainer}>
          {issue.assignees.slice(0, 3).map((assignee, index) => (
            <Image
              key={assignee.id}
              source={{ uri: assignee.avatar_url }}
              style={[
                styles.avatar,
                {
                  marginLeft: index > 0 ? -8 : 0,
                  borderColor: colors.card,
                },
              ]}
            />
          ))}
        </View>
      )}

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textTertiary}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  repo: {
    fontSize: 12,
  },
  separator: {
    fontSize: 12,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    maxWidth: 80,
  },
  assigneesContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  chevron: {
    marginLeft: 4,
  },
});
