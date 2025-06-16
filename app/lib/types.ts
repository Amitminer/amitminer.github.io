// Header
export interface NavItem {
  label: string;
  href: string;
}

export interface HeaderState {
  isMenuOpen: boolean;
  scrolled: boolean;
  activeSection: string;
}

// GithubStats Component Types
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

export interface CacheUtils {
  isValid: (timestamp: number) => boolean;
  get: () => GitHubStats | null;
  set: (data: GitHubStats) => void;
}

export interface GitHubRepoInfo {
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

export interface GitHubEvent {
  type: string
  created_at: string
  payload: any
}

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  loading?: boolean;
  color?: string;
}

export interface DetailCardProps {
  title: string;
  data: { label: string; value: string | number }[];
  loading?: boolean;
}

// About Component Types
export interface TypewriterState {
  currentIndex: number;
  secondIndex: number;
  showCursor: boolean;
}

// Contact Component Types
export interface FormState {
  email: string;
  message: string;
}

export interface ContactState {
  isVisible: boolean;
  formState: FormState;
  errors: Partial<FormState>;
  isSubmitting: boolean;
}

// Hero 
export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

// Project Component Types
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

export interface ProjectsState {
  featuredProjects: PinnedProject[];
  recentProjects: GitHubRepo[];
  allRecentProjects: GitHubRepo[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  activeTab: "featured" | "recent";
  failedImages: Set<string>;
  showAll: boolean;
}

export interface PinnedRepoAPI {
  author: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  updated_at?: string;
}

export interface PinnedProject {
  name: string;
  description: string;
  image: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  updated_at: string | null;
}


// Support Component Types
export interface SupportState {
  isVisible: boolean;
  isHovered: boolean;
}

// TechStack Section
export interface TechIcon {
  name: string;
  icon: React.ReactElement;
  color: string;
}

export interface TechGroup {
  title: string;
  technologies: TechIcon[];
}

export interface TechItemProps {
  tech: TechIcon;
  isLast: boolean;
}

export interface TechGroupProps {
  group: TechGroup;
  isVisible: boolean;
  groupIndex: number;
}