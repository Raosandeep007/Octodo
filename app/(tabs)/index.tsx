import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStore } from "../../src/store";
import { useTheme } from "../../src/hooks";
import { githubService } from "../../src/services";
import {
  TodoItem,
  EmptyState,
  LoadingSpinner,
  AddTodoModal,
} from "../../src/components";
import { Todo, Priority } from "../../src/types";

export default function TodoListScreen() {
  const { colors } = useTheme();
  const {
    todos,
    setTodos,
    updateTodo,
    config,
    isLoading,
    setIsLoading,
    refreshing,
    setRefreshing,
    selectedProject,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("open");

  const loadTodos = useCallback(async () => {
    if (!config.githubToken) {
      return;
    }

    try {
      setIsLoading(true);

      if (selectedProject) {
        const projectTodos = await githubService.getProjectItems(
          selectedProject.id,
        );
        setTodos(projectTodos);
      } else {
        // Load assigned issues as todos without project
        const issues = await githubService.getAssignedIssues();
        const todosFromIssues: Todo[] = issues.map((issue) => ({
          id: `issue-${issue.id}`,
          issue,
          priority: null,
          completed: issue.state === "closed",
        }));
        setTodos(todosFromIssues);
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      Alert.alert("Error", "Failed to load todos. Please check your settings.");
    } finally {
      setIsLoading(false);
    }
  }, [config.githubToken, selectedProject]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  }, [loadTodos]);

  useEffect(() => {
    if (config.githubToken) {
      loadTodos();
    }
  }, [config.githubToken, selectedProject]);

  const handleToggleComplete = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const newCompleted = !todo.completed;
      updateTodo(id, { completed: newCompleted });

      if (todo.issue.repository) {
        try {
          const [owner, repo] = todo.issue.repository.full_name.split("/");
          if (newCompleted) {
            await githubService.closeIssue(owner, repo, todo.issue.number);
          } else {
            await githubService.reopenIssue(owner, repo, todo.issue.number);
          }
        } catch (error) {
          // Revert on error
          updateTodo(id, { completed: !newCompleted });
          Alert.alert("Error", "Failed to update issue status.");
        }
      }
    },
    [todos, updateTodo],
  );

  const handleAddTodo = useCallback(
    async (data: {
      title: string;
      body?: string;
      priority: Priority;
      dueDate?: string;
    }) => {
      if (!config.owner || !config.repo) {
        Alert.alert(
          "Setup Required",
          "Please configure your repository in settings.",
        );
        return;
      }

      try {
        const issue = await githubService.createIssue(
          config.owner,
          config.repo,
          data.title,
          data.body,
        );

        const newTodo: Todo = {
          id: `issue-${issue.id}`,
          issue,
          priority: data.priority,
          dueDate: data.dueDate,
          completed: false,
        };

        setTodos([newTodo, ...todos]);
      } catch (error) {
        Alert.alert("Error", "Failed to create todo.");
      }
    },
    [config.owner, config.repo, todos],
  );

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case "open":
        return !todo.completed;
      case "completed":
        return todo.completed;
      default:
        return true;
    }
  });

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.filterRow}>
        {(["open", "completed", "all"] as const).map((f) => (
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
          message="Please add your GitHub token in settings to get started."
        />
        <Pressable
          style={[styles.settingsButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.settingsButtonText}>Go to Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading && todos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading your todos..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggleComplete={handleToggleComplete}
            onPress={(todo) => {
              // Navigate to detail or open in browser
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No Todos"
            message={
              filter === "completed"
                ? "You haven't completed any todos yet."
                : "You're all caught up! Tap + to add a new todo."
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
        contentContainerStyle={filteredTodos.length === 0 && styles.emptyList}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <AddTodoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTodo}
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
  filterRow: {
    flexDirection: "row",
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
    fontWeight: "500",
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 32,
    marginBottom: 32,
    gap: 8,
  },
  settingsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
