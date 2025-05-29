export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
}

export interface PinnedProject {
  name: string;
  description: string;
  image: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
}

export interface PinnedRepoAPI {
  author: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
}

// GithubStats Related Types

export interface GitHubStats {
  totalStars: number
  totalForks: number
  totalRepos: number
  followers: number
  following: number
  publicGists: number
  totalCommits: number
  totalPRs: number
  totalIssues: number
  contributedTo: number
  totalContributions: number
  currentStreak: number
  longestStreak: number
  accountCreated: string
  lastActivity: string
  topLanguages: { [key: string]: number }
  recentActivity: number
  privateRepos: number
  lastUpdated: string
}

export interface CachedData {
  data: GitHubStats
  timestamp: number
}

export interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  language: string
  size: number
  updated_at: string
  pushed_at: string
  private: boolean
  owner: {
    login: string
  }
}

export interface GitHubUser {
  public_repos: number
  total_private_repos: number
  followers: number
  following: number
  public_gists: number
  created_at: string
  updated_at: string
}

export interface GitHubEvent {
  type: string
  created_at: string
  payload: any
}

export interface SearchResult {
  total_count: number
  items: any[]
}

export interface ContributionsData {
  totalContributions: number
  totalCommits: number
  currentStreak: number
  longestStreak: number
}


// SKills Related Types
export interface Skill {
  name: string
  percentage: number
  color: string
  icon: React.ReactElement
  bytes: number
}

export interface CachedSkillData {
  name: string
  percentage: number
  bytes: number
}