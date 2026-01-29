import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, GitHubIssue, Priority, AppConfig, GitHubProject } from '../types';

type ThemePreference = 'light' | 'dark' | 'system';

interface AppState {
  // Config
  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;

  // Theme
  themeMode: ThemePreference;
  setThemeMode: (mode: ThemePreference) => void;

  // Todos
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  toggleTodoComplete: (id: string) => void;

  // All Issues
  allIssues: GitHubIssue[];
  setAllIssues: (issues: GitHubIssue[]) => void;

  // Projects
  projects: GitHubProject[];
  setProjects: (projects: GitHubProject[]) => void;
  selectedProject: GitHubProject | null;
  setSelectedProject: (project: GitHubProject | null) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // UI State
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Config
      config: {
        githubToken: '',
        projectUrl: '',
        owner: '',
        repo: '',
        projectNumber: undefined,
      },
      setConfig: (config) =>
        set((state) => ({ config: { ...state.config, ...config } })),

      // Theme
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Todos
      todos: [],
      setTodos: (todos) => set({ todos }),
      addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
      toggleTodoComplete: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      // All Issues
      allIssues: [],
      setAllIssues: (allIssues) => set({ allIssues }),

      // Projects
      projects: [],
      setProjects: (projects) => set({ projects }),
      selectedProject: null,
      setSelectedProject: (selectedProject) => set({ selectedProject }),

      // Loading states
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),

      // UI State
      refreshing: false,
      setRefreshing: (refreshing) => set({ refreshing }),
    }),
    {
      name: 'octodo-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        config: state.config,
        themeMode: state.themeMode,
        todos: state.todos,
      }),
    }
  )
);
