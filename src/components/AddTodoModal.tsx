import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';
import { Priority } from '../types';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    body?: string;
    priority: Priority;
    dueDate?: string;
  }) => void;
}

export function AddTodoModal({ visible, onClose, onSubmit }: AddTodoModalProps) {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>(null);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      body: body.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    // Reset form
    setTitle('');
    setBody('');
    setPriority(null);
    setDueDate('');
    onClose();
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: colors.priorityHigh },
    { value: 'medium', label: 'Medium', color: colors.priorityMedium },
    { value: 'low', label: 'Low', color: colors.priorityLow },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            New Todo
          </Text>
          <Pressable
            onPress={handleSubmit}
            disabled={!title.trim()}
            hitSlop={8}
          >
            <Text
              style={[
                styles.addButton,
                {
                  color: title.trim() ? colors.primary : colors.textTertiary,
                },
              ]}
            >
              Add
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Title
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Description (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add more details..."
              placeholderTextColor={colors.textTertiary}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Priority
            </Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor:
                        priority === option.value
                          ? option.color
                          : colors.surface,
                      borderColor:
                        priority === option.value
                          ? option.color
                          : colors.border,
                    },
                  ]}
                  onPress={() =>
                    setPriority(priority === option.value ? null : option.value)
                  }
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color:
                          priority === option.value
                            ? '#FFFFFF'
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Due Date (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              value={dueDate}
              onChangeText={setDueDate}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 17,
  },
  addButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
