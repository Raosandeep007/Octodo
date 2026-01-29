import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Swipeable,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Todo } from '../types';
import { useTheme } from '../hooks';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onPress?: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggleComplete, onPress }: TodoItemProps) {
  const { colors, isDark } = useTheme();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            backgroundColor: todo.completed ? colors.warning : colors.success,
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <Ionicons
          name={todo.completed ? 'arrow-undo' : 'checkmark-circle'}
          size={24}
          color="#FFFFFF"
        />
        <Text style={styles.actionText}>
          {todo.completed ? 'Reopen' : 'Complete'}
        </Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'right') {
        onToggleComplete(todo.id);
      }
    },
    [todo.id, onToggleComplete]
  );

  const repoName = todo.issue.repository
    ? todo.issue.repository.full_name
    : 'Unknown repo';

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={handleSwipeOpen}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          onPress={() => onPress?.(todo)}
          style={({ pressed }) => [
            styles.container,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.checkboxContainer}>
            <Pressable
              onPress={() => onToggleComplete(todo.id)}
              hitSlop={8}
              style={[
                styles.checkbox,
                {
                  borderColor: todo.completed ? colors.success : colors.border,
                  backgroundColor: todo.completed
                    ? colors.success
                    : 'transparent',
                },
              ]}
            >
              {todo.completed && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    textDecorationLine: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                  },
                ]}
                numberOfLines={2}
              >
                {todo.issue.title}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text
                style={[styles.repo, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {repoName} #{todo.issue.number}
              </Text>
            </View>

            <View style={styles.badgesRow}>
              {todo.priority && <PriorityBadge priority={todo.priority} />}
              {todo.dueDate && <DueDateBadge date={todo.dueDate} />}
              {todo.issue.labels.slice(0, 2).map((label) => (
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
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
            style={styles.chevron}
          />
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
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
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  repo: {
    fontSize: 12,
  },
  badgesRow: {
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
  chevron: {
    marginLeft: 8,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
