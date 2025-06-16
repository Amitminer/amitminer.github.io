/**
 * GitHubStats Component
 * 
 * A dynamic GitHub statistics showcase that displays:
 * - User statistics and activity metrics
 * - Repository statistics
 * - Contribution data
 * - Language usage
 * - Activity timeline
 */

"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  GitFork,
  Code,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { BackendURL, GithubUsername } from "@/app/utils/Links"
import type { GitHubStats, GitHubEvent, CachedData, DetailCardProps, StatCardProps, CacheUtils, GitHubRepoInfo } from "@/app/lib/types"

// Constants
const REPOS_PER_PAGE = 80;
const EVENTS_PER_PAGE = 80;
const LOADING_STEPS = {
  INITIAL: 10,
  CORE_DATA: 20,
  REPO_PROCESS: 50,
  REPO_STATS: 70,
  FINAL_DATA: 90,
  COMPLETE: 100
};

// Skeleton Components
const StatCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="w-8 h-8 bg-gray-700 rounded mb-2"></div>
    <div className="w-16 h-8 bg-gray-700 rounded mb-1"></div>
    <div className="w-20 h-4 bg-gray-700 rounded"></div>
  </div>
);

const DetailCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="w-48 h-6 bg-gray-700 rounded mb-6"></div>
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="w-32 h-4 bg-gray-700 rounded"></div>
          <div className="w-16 h-4 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, value, label, loading = false, color = "text-blue-400" }: StatCardProps) => {
  if (loading) return <StatCardSkeleton />;

  return (
    <div className="stat-card">
      <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold mb-1 text-white">{value}</div>
      <div className="text-sm text-cyan-300">{label}</div>
    </div>
  );
};

// Detail Card Component
const DetailCard = ({ title, data, loading = false }: DetailCardProps) => {
  if (loading) return <DetailCardSkeleton />;

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-6 text-purple-300">{title}</h3>
      <div className="space-y-4">
        {data.map(({ label, value }, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-emerald-300">{label}</span>
            <span className="font-medium text-yellow-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GitHubStatsComponent = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)

  const GITHUB_USERNAME = GithubUsername
  const CACHE_KEY = "github_stats_cache"
  const CACHE_DURATION = 10 * 60 * 1000

  // Memoized cache utilities
  const cacheUtils: CacheUtils = useMemo(() => ({
    isValid: (timestamp: number): boolean => Date.now() - timestamp < CACHE_DURATION,

    get: (): GitHubStats | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsedCache: CachedData = JSON.parse(cached)
          if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
            return parsedCache.data
          }
        }
      } catch (error) {
        console.error("Cache read error:", error)
      }
      return null
    },

    set: (data: GitHubStats): void => {
      try {
        const cacheData: CachedData = { data, timestamp: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      } catch (error) {
        console.error("Cache write error:", error)
      }
    }
  }), [CACHE_KEY, CACHE_DURATION])

  // Optimized API fetch with better error handling and timeout
  const fetchFromAPI = useCallback(async (endpoint: string, timeout = 8000): Promise<any> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${BackendURL}?endpoint=${endpoint}&cache=true`, {
        headers: {
          "Cache-Control": "max-age=300", // 5 minutes browser cache
          "Accept": "application/json",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      return response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - API is taking too long')
      }
      throw error instanceof Error ? error : new Error('Unknown fetch error')
    } finally {
      clearTimeout(timeoutId)
    }
  }, [BackendURL])

  // Optimized data processing functions
  const processRepoData = useCallback((repos: GitHubRepoInfo[]) => {
    let totalStars = 0
    let totalForks = 0
    let totalSize = 0
    const languageBytes: { [key: string]: number } = {}
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    let recentRepoActivity = 0

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count
      totalForks += repo.forks_count

      if (repo.language && repo.size > 0) {
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + repo.size
        totalSize += repo.size
      }

      if (new Date(repo.pushed_at).getTime() > oneMonthAgo) {
        recentRepoActivity++
      }
    })

    // Calculate top languages efficiently
    const topLanguages = totalSize > 0
      ? Object.fromEntries(
        Object.entries(languageBytes)
          .map(([lang, bytes]: [string, number]) => [lang, Math.round((bytes / totalSize) * 100)] as [string, number])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      )
      : {};

    return { totalStars, totalForks, topLanguages, recentRepoActivity }
  }, [])

  // Contributions calculation (simplified)
  const calculateSimpleContributions = useCallback((events: GitHubEvent[]) => {
    const currentYear = new Date().getFullYear()
    const currentYearStart = new Date(currentYear, 0, 1).getTime()
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)

    let totalCommits = 0
    let recentEvents = 0
    let lastActivityDate = new Date(0)

    events.forEach(event => {
      const eventDate = new Date(event.created_at)
      const eventTime = eventDate.getTime()

      if (eventTime > currentYearStart && event.type === "PushEvent") {
        totalCommits += event.payload?.commits?.length || 1
      }

      if (eventTime > oneMonthAgo) {
        recentEvents++
      }

      if (eventDate > lastActivityDate) {
        lastActivityDate = eventDate
      }
    })

    // Simple streak calculation (approximate)
    const daysSinceLastActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentStreak = daysSinceLastActivity <= 1 ? Math.min(recentEvents, 30) : 0

    return {
      totalCommits,
      recentEvents,
      lastActivity: lastActivityDate.toISOString(),
      currentStreak,
      longestStreak: Math.min(totalCommits * 2, 365), // Rough estimate
      totalContributions: totalCommits * 3 // Rough estimate
    }
  }, [])

  // Main data fetching function
  const fetchGitHubStats = useCallback(async (): Promise<GitHubStats> => {
    setLoadingProgress(LOADING_STEPS.INITIAL)

    try {
      // Fetch core data in parallel with reduced payload
      setLoadingProgress(LOADING_STEPS.CORE_DATA)
      const [userData, reposData] = await Promise.all([
        fetchFromAPI(`/user`),
        fetchFromAPI(`/user/repos?per_page=${REPOS_PER_PAGE}&sort=updated&type=all`) // Reduced from 100
      ])

      setLoadingProgress(LOADING_STEPS.REPO_PROCESS)

      // Process repo data immediately
      const repoStats = processRepoData(reposData)

      setLoadingProgress(LOADING_STEPS.REPO_STATS)

      // Fetch remaining data
      const [eventsData, prsData, issuesData] = await Promise.all([
        fetchFromAPI(`/users/${GITHUB_USERNAME}/events?per_page=${EVENTS_PER_PAGE}`), // Reduced from 100
        fetchFromAPI(`/search/issues?q=author:${GITHUB_USERNAME}+type:pr&per_page=1`), // Just count
        fetchFromAPI(`/search/issues?q=author:${GITHUB_USERNAME}+type:issue&per_page=1`) // Just count
      ])

      setLoadingProgress(LOADING_STEPS.FINAL_DATA)

      // Process events data
      const contributionStats = calculateSimpleContributions(eventsData)

      // Calculate unique contributors efficiently
      const uniqueContributedTo = new Set(
        reposData
          .filter((repo: GitHubRepoInfo) => repo.owner.login !== GITHUB_USERNAME)
          .map((repo: GitHubRepoInfo) => repo.owner.login)
      ).size

      setLoadingProgress(LOADING_STEPS.COMPLETE)

      return {
        totalStars: repoStats.totalStars,
        totalForks: repoStats.totalForks,
        totalRepos: userData.public_repos,
        privateRepos: userData.total_private_repos || 0,
        followers: userData.followers,
        following: userData.following,
        publicGists: userData.public_gists,
        accountCreated: userData.created_at,
        lastActivity: contributionStats.lastActivity,
        topLanguages: repoStats.topLanguages,
        recentActivity: repoStats.recentRepoActivity + contributionStats.recentEvents,
        totalCommits: contributionStats.totalCommits,
        totalPRs: prsData.total_count || 0,
        totalIssues: issuesData.total_count || 0,
        contributedTo: uniqueContributedTo,
        totalContributions: contributionStats.totalContributions,
        currentStreak: contributionStats.currentStreak,
        longestStreak: contributionStats.longestStreak,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error fetching GitHub stats:", error)
      throw error
    }
  }, [GITHUB_USERNAME, fetchFromAPI, processRepoData, calculateSimpleContributions])

  // Data fetching and error handling
  useEffect(() => {
    const loadData = async () => {
    try {
      // Check cache first
        const cachedData = cacheUtils.get();
        if (cachedData) {
          setStats(cachedData);
          setLoading(false);
          return;
      }

      // Fetch fresh data
        const freshData = await fetchGitHubStats();
        setStats(freshData);
        cacheUtils.set(freshData);
    } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch GitHub stats');
    } finally {
        setLoading(false);
    }
    };

    loadData();
  }, [fetchGitHubStats, cacheUtils]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = statsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Refresh data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    setLoadingProgress(0);

    try {
      const freshData = await fetchGitHubStats();
      setStats(freshData);
      cacheUtils.set(freshData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh GitHub stats');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper functions
  const getCacheAge = (): string => {
    if (!stats) return '';
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return 'Just now';
    
    const { timestamp } = JSON.parse(cached);
    const age = Math.floor((Date.now() - timestamp) / 1000);
    
    if (age < 60) return `${age}s ago`;
    if (age < 3600) return `${Math.floor(age / 60)}m ago`;
    return `${Math.floor(age / 3600)}h ago`;
  };

  const getActivityLevel = (activity: number): string => {
    if (activity > 50) return 'Very Active';
    if (activity > 30) return 'Active';
    if (activity > 10) return 'Moderate';
    return 'Low';
  };

  const getYearsActive = (): number => {
    if (!stats) return 0;
    const created = new Date(stats.accountCreated);
    const now = new Date();
    return now.getFullYear() - created.getFullYear();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render loading state
  if (loading && !stats) {
    return (
      <section className="py-16 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-center">
            GitHub Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className="py-16 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="text-2xl font-bold mb-2 text-red-300">Error Loading Stats</h2>
            <p className="text-orange-300 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="inline-block animate-spin mr-2" />
                  <span className="text-cyan-200">Refreshing...</span>
                </>
              ) : (
                <span className="text-white">Try Again</span>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Render stats
  return (
    <section
      id="github-stats"
      ref={statsRef}
      className="py-16 w-full"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            GitHub Statistics
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-300">
              Last updated: {getCacheAge()}
            </span>
            <button
              onClick={handleRefresh}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              disabled={isRefreshing}
              title="Refresh stats"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<GitFork />}
            value={stats?.totalForks || 0}
            label="Total Forks"
            loading={loading}
            color="text-orange-400"
          />
          <StatCard
            icon={<Code />}
            value={stats?.totalRepos || 0}
            label="Public Repositories"
            loading={loading}
            color="text-purple-400"
          />
          <StatCard
            icon={<Users />}
            value={stats?.followers || 0}
            label="Followers"
            loading={loading}
            color="text-green-400"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repository Stats */}
          <DetailCard
            title="Repository Statistics"
            data={[
              { label: 'Total Stars', value: stats?.totalStars || 0 },
              { label: 'Total Forks', value: stats?.totalForks || 0 },
              { label: 'Public Repos', value: stats?.totalRepos || 0 },
              { label: 'Public Gists', value: stats?.publicGists || 0 },
              { label: 'Contributed To', value: stats?.contributedTo || 0 }
            ]}
            loading={loading}
          />

          {/* Activity Stats */}
          <DetailCard
            title="Activity Statistics"
            data={[
              { label: 'Total Commits', value: stats?.totalCommits || 0 },
              { label: 'Total PRs', value: stats?.totalPRs || 0 },
              { label: 'Total Issues', value: stats?.totalIssues || 0 },
              { label: 'Longest Streak', value: `${stats?.longestStreak || 0} days` },
              { label: 'Years Active', value: getYearsActive() }
            ]}
            loading={loading}
          />
        </div>

        {/* Account Info */}
        <div className="mt-8 text-center text-sm">
          <p className="text-indigo-300">Account created on {stats ? formatDate(stats.accountCreated) : '...'}</p>
          <p className="text-teal-300">Last activity: {stats ? formatDate(stats.lastActivity) : '...'}</p>
        </div>
      </div>
    </section>
  );
};

export default GitHubStatsComponent;