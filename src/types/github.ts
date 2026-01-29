// GitHub API Types

export type Priority = 'high' | 'medium' | 'low' | null;

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name?: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description?: string;
  private: boolean;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  user: GitHubUser;
  repository?: GitHubRepository;
  html_url: string;
}

export interface Todo {
  id: string;
  issue: GitHubIssue;
  priority: Priority;
  dueDate?: string;
  completed: boolean;
  projectId?: string;
}

export interface GitHubProject {
  id: string;
  title: string;
  number: number;
  url: string;
  shortDescription?: string;
  closed: boolean;
  owner: {
    login: string;
  };
}

export interface ProjectItem {
  id: string;
  content?: {
    __typename: string;
    id?: number;
    title?: string;
    number?: number;
    state?: string;
  };
  fieldValues: {
    nodes: Array<{
      __typename: string;
      text?: string;
      date?: string;
      name?: string;
    }>;
  };
}

export interface AppConfig {
  githubToken: string;
  projectUrl?: string;
  owner?: string;
  repo?: string;
  projectNumber?: number;
}
