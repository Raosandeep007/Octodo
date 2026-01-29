import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';

interface DueDateBadgeProps {
  date: string;
}

export function DueDateBadge({ date }: DueDateBadgeProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string): string => {
    const d = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(d);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return 'Today';
    }
    if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (): boolean => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const overdue = isOverdue();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: overdue ? colors.dangerLight : colors.primaryLight,
        },
      ]}
    >
      <Ionicons
        name="calendar-outline"
        size={12}
        color={overdue ? colors.danger : colors.primary}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          {
            color: overdue ? colors.danger : colors.primary,
          },
        ]}
      >
        {formatDate(date)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
  },
});
