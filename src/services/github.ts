import axios, { AxiosInstance } from 'axios';
import {
  GitHubIssue,
  GitHubProject,
  GitHubRepository,
  Todo,
  Priority,
} from '../types';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

class GitHubService {
  private restClient: AxiosInstance;
  private token: string = '';

  constructor() {
    this.restClient = axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  setToken(token: string) {
    this.token = token;
    this.restClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await axios.post(
      GITHUB_GRAPHQL_URL,
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  }

  // Get authenticated user
  async getCurrentUser() {
    const response = await this.restClient.get('/user');
    return response.data;
  }

  // Get user's repositories
  async getRepositories(): Promise<GitHubRepository[]> {
    const response = await this.restClient.get('/user/repos', {
      params: {
        sort: 'updated',
        per_page: 100,
      },
    });
    return response.data;
  }

  // Get issues assigned to user
  async getAssignedIssues(): Promise<GitHubIssue[]> {
    const response = await this.restClient.get('/issues', {
      params: {
        filter: 'assigned',
        state: 'open',
        sort: 'updated',
        per_page: 100,
      },
    });
    return response.data;
  }

  // Get issues from a specific repository
  async getRepoIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    const response = await this.restClient.get(`/repos/${owner}/${repo}/issues`, {
      params: {
        state: 'all',
        sort: 'updated',
        per_page: 100,
      },
    });
    return response.data;
  }

  // Create a new issue
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    const response = await this.restClient.post(`/repos/${owner}/${repo}/issues`, {
      title,
      body,
      labels,
    });
    return response.data;
  }

  // Update an issue
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[] }
  ): Promise<GitHubIssue> {
    const response = await this.restClient.patch(
      `/repos/${owner}/${repo}/issues/${issueNumber}`,
      updates
    );
    return response.data;
  }

  // Close an issue
  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
  }

  // Reopen an issue
  async reopenIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.updateIssue(owner, repo, issueNumber, { state: 'open' });
  }

  // Get user's projects using GraphQL
  async getUserProjects(): Promise<GitHubProject[]> {
    const query = `
      query {
        viewer {
          projectsV2(first: 20) {
            nodes {
              id
              title
              number
              url
              shortDescription
              closed
              owner {
                ... on User {
                  login
                }
                ... on Organization {
                  login
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphql<{
      viewer: { projectsV2: { nodes: GitHubProject[] } };
    }>(query);

    return data.viewer.projectsV2.nodes;
  }

  // Get project items with custom fields
  async getProjectItems(projectId: string): Promise<Todo[]> {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                  }
                }
                content {
                  ... on Issue {
                    id
                    number
                    title
                    body
                    state
                    createdAt
                    updatedAt
                    closedAt
                    url
                    labels(first: 10) {
                      nodes {
                        id
                        name
                        color
                      }
                    }
                    assignees(first: 5) {
                      nodes {
                        id
                        login
                        avatarUrl
                      }
                    }
                    author {
                      login
                      avatarUrl
                    }
                    repository {
                      name
                      nameWithOwner
                      owner {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphql<{
      node: {
        items: {
          nodes: Array<{
            id: string;
            fieldValues: {
              nodes: Array<{
                text?: string;
                date?: string;
                name?: string;
                field?: { name: string };
              }>;
            };
            content?: {
              id: string;
              number: number;
              title: string;
              body?: string;
              state: string;
              createdAt: string;
              updatedAt: string;
              closedAt?: string;
              url: string;
              labels: { nodes: Array<{ id: string; name: string; color: string }> };
              assignees: { nodes: Array<{ id: string; login: string; avatarUrl: string }> };
              author: { login: string; avatarUrl: string };
              repository: { name: string; nameWithOwner: string; owner: { login: string } };
            };
          }>;
        };
      };
    }>(query, { projectId });

    if (!data.node?.items?.nodes) {
      return [];
    }

    return data.node.items.nodes
      .filter((item) => item.content)
      .map((item) => {
        const content = item.content!;
        let priority: Priority = null;
        let dueDate: string | undefined;

        // Extract custom fields
        item.fieldValues.nodes.forEach((field) => {
          const fieldName = field.field?.name?.toLowerCase();
          if (fieldName === 'priority' && field.name) {
            const priorityValue = field.name.toLowerCase();
            if (priorityValue.includes('high')) priority = 'high';
            else if (priorityValue.includes('medium')) priority = 'medium';
            else if (priorityValue.includes('low')) priority = 'low';
          }
          if ((fieldName === 'due date' || fieldName === 'due') && field.date) {
            dueDate = field.date;
          }
        });

        const issue: GitHubIssue = {
          id: parseInt(content.id.replace(/\D/g, '')) || Date.now(),
          number: content.number,
          title: content.title,
          body: content.body,
          state: content.state.toLowerCase() as 'open' | 'closed',
          created_at: content.createdAt,
          updated_at: content.updatedAt,
          closed_at: content.closedAt,
          html_url: content.url,
          labels: content.labels.nodes.map((l) => ({
            id: parseInt(l.id.replace(/\D/g, '')) || Date.now(),
            name: l.name,
            color: l.color,
          })),
          assignees: content.assignees.nodes.map((a) => ({
            id: parseInt(a.id.replace(/\D/g, '')) || Date.now(),
            login: a.login,
            avatar_url: a.avatarUrl,
          })),
          user: {
            id: Date.now(),
            login: content.author.login,
            avatar_url: content.author.avatarUrl,
          },
          repository: {
            id: Date.now(),
            name: content.repository.name,
            full_name: content.repository.nameWithOwner,
            owner: {
              id: Date.now(),
              login: content.repository.owner.login,
              avatar_url: '',
            },
            private: false,
            html_url: `https://github.com/${content.repository.nameWithOwner}`,
          },
        };

        return {
          id: item.id,
          issue,
          priority,
          dueDate,
          completed: content.state.toLowerCase() === 'closed',
          projectId,
        };
      });
  }

  // Add issue to project
  async addIssueToProject(projectId: string, issueId: string): Promise<string> {
    const query = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `;

    const data = await this.graphql<{
      addProjectV2ItemById: { item: { id: string } };
    }>(query, { projectId, contentId: issueId });

    return data.addProjectV2ItemById.item.id;
  }
}

export const githubService = new GitHubService();
