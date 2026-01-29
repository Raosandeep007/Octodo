import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types';
import { useTheme } from '../hooks';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

export function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const { colors } = useTheme();

  if (!priority) return null;

  const getBackgroundColor = () => {
    switch (priority) {
      case 'high':
        return colors.dangerLight;
      case 'medium':
        return colors.warningLight;
      case 'low':
        return colors.successLight;
      default:
        return colors.surface;
    }
  };

  const getTextColor = () => {
    switch (priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      default:
        return colors.text;
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return '';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          paddingHorizontal: size === 'small' ? 6 : 10,
          paddingVertical: size === 'small' ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: size === 'small' ? 10 : 12,
          },
        ]}
      >
        {getLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
