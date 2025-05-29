"use client"

import { useEffect, useRef, useState } from "react"
import { CircleProgress } from "@/app/components/ui/CircleProgress"
import {
  Activity,
  GitFork,
  Code,
  Users,
  TrendingUp,
  RefreshCw,
  GitCommit,
  GitPullRequest,
  AlertCircle,
} from "lucide-react"
import { BackendURL, GithubUsername } from "@/app/utils/Links"
import type { GitHubStats,GitHubEvent, GitHubRepo, ContributionsData, CachedData } from "@/app/lib/types"

const GitHubStatsComponent = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const GITHUB_USERNAME = GithubUsername
  const CACHE_KEY = "github_stats_cache"
  const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000 // 2 weeks in milliseconds

  // Check if cached data is still valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }

  // Get cached data
  const getCachedData = (): GitHubStats | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsedCache: CachedData = JSON.parse(cached)
        if (isCacheValid(parsedCache.timestamp)) {
          return parsedCache.data
        }
      }
    } catch (error) {
      console.error("Error reading cache:", error)
    }
    return null
  }

  // Save data to cache
  const setCachedData = (data: GitHubStats): void => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error saving to cache:", error)
    }
  }

  // Fetch data from our custom API route with retry logic
  const fetchFromAPI = async (endpoint: string, retries = 3): Promise<any> => {
    let lastError

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${BackendURL}?endpoint=${endpoint}&cache=true`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `API request failed with status ${response.status}`)
        }

        return response.json()
      } catch (error) {
        lastError = error
        // Wait before retrying (exponential backoff)
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500))
        }
      }
    }

    throw lastError
  }

  // Calculate commits from events (more accurate with token)
  const calculateCommitsFromEvents = (events: GitHubEvent[]): number => {
    const currentYear = new Date().getFullYear()
    return events
      .filter((event) => {
        const eventYear = new Date(event.created_at).getFullYear()
        return eventYear === currentYear && event.type === "PushEvent"
      })
      .reduce((total, event) => {
        return total + (event.payload?.commits?.length || 1)
      }, 0)
  }

  // Calculate language statistics
  const calculateLanguageStats = (repos: GitHubRepo[]): { [key: string]: number } => {
    const languageBytes: { [key: string]: number } = {}

    repos.forEach((repo) => {
      if (repo.language && repo.size > 0) {
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + repo.size
      }
    })

    // Convert to percentages
    const totalBytes = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0)
    const languagePercentages: { [key: string]: number } = {}

    Object.entries(languageBytes).forEach(([lang, bytes]) => {
      languagePercentages[lang] = Math.round((bytes / totalBytes) * 100)
    })

    // Return top 5 languages
    return Object.fromEntries(
      Object.entries(languagePercentages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    )
  }

  // Calculate recent activity score
  const calculateRecentActivity = (repos: GitHubRepo[], events: GitHubEvent[]): number => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const recentRepoActivity = repos.filter((repo) => new Date(repo.pushed_at) > oneMonthAgo).length

    const recentEvents = events.filter((event) => new Date(event.created_at) > oneMonthAgo).length

    return recentRepoActivity + recentEvents
  }

  // Generate contributions data
  const generateContributionsData = (events: GitHubEvent[], repos: GitHubRepo[]): ContributionsData => {
    const commits = calculateCommitsFromEvents(events)
    const recentActivity = calculateRecentActivity(repos, events)

    // Estimate contributions based on available data
    const estimatedContributions = commits + recentActivity * 3

    // Simple streak estimation based on recent activity
    const currentStreak = Math.min(recentActivity, 30)
    const longestStreak = Math.min(recentActivity * 2, 100)

    return {
      totalContributions: estimatedContributions,
      totalCommits: commits,
      currentStreak,
      longestStreak,
    }
  }

  // Fetch GitHub stats using authenticated endpoints
  const fetchGitHubStats = async (): Promise<GitHubStats> => {
    try {
      // Fetch data in parallel for better performance
      const [userData, reposData, eventsData] = await Promise.all([
        fetchFromAPI(`/user`),
        fetchFromAPI(`/user/repos?per_page=100&sort=updated&type=all`),
        fetchFromAPI(`/users/${GITHUB_USERNAME}/events?per_page=100`),
      ])

      // Fetch public repositories for the specific user (for stars calculation)
      const publicReposData: GitHubRepo[] = await fetchFromAPI(
        `/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      )

      // Search for PRs and Issues in parallel
      const [prsData, issuesData] = await Promise.all([
        fetchFromAPI(`/search/issues?q=author:${GITHUB_USERNAME}+type:pr`),
        fetchFromAPI(`/search/issues?q=author:${GITHUB_USERNAME}+type:issue`),
      ])

      // Calculate contributions data
      const contributionsData = generateContributionsData(eventsData, reposData)

      // Calculate statistics
      const totalStars = publicReposData.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const totalForks = publicReposData.reduce((sum, repo) => sum + repo.forks_count, 0)
      const topLanguages = calculateLanguageStats(reposData)
      const recentActivity = calculateRecentActivity(reposData, eventsData)

      // Calculate unique repositories contributed to
      const uniqueContributedTo: number = new Set<string>(
        reposData.filter((repo: GitHubRepo) => repo.owner.login !== GITHUB_USERNAME)
          .map((repo: GitHubRepo) => repo.owner.login)
      ).size

      // Find most recent activity
      const lastActivity = eventsData.length > 0 ? eventsData[0].created_at : userData.updated_at

      return {
        totalStars,
        totalForks,
        totalRepos: userData.public_repos,
        privateRepos: userData.total_private_repos || 0,
        followers: userData.followers,
        following: userData.following,
        publicGists: userData.public_gists,
        accountCreated: userData.created_at,
        lastActivity,
        topLanguages,
        recentActivity,
        totalCommits: contributionsData.totalCommits,
        totalPRs: prsData.total_count || 0,
        totalIssues: issuesData.total_count || 0,
        contributedTo: uniqueContributedTo,
        totalContributions: contributionsData.totalContributions,
        currentStreak: contributionsData.currentStreak,
        longestStreak: contributionsData.longestStreak,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch GitHub data: ${error.message}`)
      }
      throw new Error("Failed to fetch GitHub data: Unknown error occurred")
    }
  }

  // Load GitHub stats (from cache or API)
  const loadGitHubStats = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // First, try to get cached data
      const cachedStats = getCachedData()
      if (cachedStats) {
        setStats(cachedStats)
        setLoading(false)
        return
      }

      // If no valid cache, fetch from API
      const freshStats = await fetchGitHubStats()
      setStats(freshStats)
      setCachedData(freshStats)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Force refresh (bypass cache)
  const forceRefresh = async (): Promise<void> => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      localStorage.removeItem(CACHE_KEY)
      const freshStats = await fetchGitHubStats()
      setStats(freshStats)
      setCachedData(freshStats)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadGitHubStats()

    // Set up intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 },
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <section id="github-stats" className="py-20 w-full bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ff9d00]" />
            <span className="ml-2 text-gray-300">Loading GitHub stats...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="github-stats" className="py-20 w-full bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading GitHub stats: {error}</p>
            <button
              onClick={forceRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-[#ff9d00] text-black rounded hover:bg-[#ff9d00]/90 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!stats) return null

  const getCacheAge = (): string => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsedCache: CachedData = JSON.parse(cached)
      const ageInHours = Math.floor((Date.now() - parsedCache.timestamp) / (1000 * 60 * 60))
      if (ageInHours < 24) return `${ageInHours}h ago`
      const ageInDays = Math.floor(ageInHours / 24)
      return `${ageInDays}d ago`
    }
    return "just now"
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getActivityLevel = (activity: number): { color: string; label: string } => {
    if (activity >= 20) return { color: "text-green-400", label: "Very Active" }
    if (activity >= 10) return { color: "text-yellow-400", label: "Active" }
    if (activity >= 5) return { color: "text-orange-400", label: "Moderate" }
    return { color: "text-gray-400", label: "Low" }
  }

  const activityLevel = getActivityLevel(stats.recentActivity)

  return (
    <section id="github-stats" ref={statsRef} className="py-20 w-full bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">GitHub Activity</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Updated {getCacheAge()}</span>
            <button
              onClick={forceRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-[#ff9d00] transition-colors disabled:opacity-50"
              title="Force refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-animation">
            <div className="stat-card">
              <TrendingUp className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="text-4xl font-bold text-white mb-1">{stats.totalStars}</h3>
              <p className="text-yellow-500">Stars Earned</p>
            </div>

            <div className="stat-card">
              <GitFork className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="text-4xl font-bold text-white mb-1">{stats.totalForks}</h3>
              <p className="text-blue-500">Forks</p>
            </div>

            <div className="stat-card">
              <Code className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="text-4xl font-bold text-white mb-1">{stats.totalRepos}</h3>
              <p className="text-purple-500">Public Repos</p>
              {stats.privateRepos > 0 && <p className="text-xs text-gray-400 mt-1">+{stats.privateRepos} private</p>}
            </div>

            <div className="stat-card">
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="text-4xl font-bold text-white mb-1">{stats.followers}</h3>
              <p className="text-green-500">Followers</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Development Stats Card */}
            <div className="stat-card">
              <h3 className="text-2xl font-bold mb-6 text-[#ff9d00]">Development Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-yellow-500" />
                    Total Stars Earned:
                  </span>
                  <span className="font-semibold">{stats.totalStars}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-2">
                    <GitCommit size={16} className="text-green-500" />
                    Total Commits ({new Date().getFullYear()}):
                  </span>
                  <span className="font-semibold">{stats.totalCommits}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-2">
                    <GitPullRequest size={16} className="text-blue-400" />
                    Pull Requests:
                  </span>
                  <span className="font-semibold">{stats.totalPRs}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400" />
                    Issues Created:
                  </span>
                  <span className="font-semibold">{stats.totalIssues}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span>Projects Contributed To:</span>
                  <span className="font-semibold">{stats.contributedTo}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-2">
                    <Activity size={16} className={activityLevel.color} />
                    Recent Activity (30d):
                  </span>
                  <span className={`font-semibold ${activityLevel.color}`}>
                    {activityLevel.label} ({stats.recentActivity})
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-20 h-20">
                  <CircleProgress
                    value={Math.min(stats.totalStars * 2, 100)}
                    max={100}
                    size={80}
                    strokeWidth={8}
                    isVisible={isVisible}
                  />
                </div>
              </div>
            </div>

            {/* Contribution Activity Card */}
            <div className="stat-card">
              <h3 className="text-2xl font-bold mb-6 text-white">Contribution Activity</h3>

              <div className="flex items-center justify-between mb-8">
                {/* Total Contributions */}
                <div className="text-center">
                  <h4 className="text-4xl font-bold text-pink-500">{stats.totalContributions.toLocaleString()}</h4>
                  <p className="text-gray-400 text-sm">Total Contributions</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date().getFullYear()}</p>
                </div>

                {/* Current Streak */}
                <div className="text-center">
                  <div className="mb-2">
                    <CircleProgress
                      value={Math.min(stats.currentStreak * 3, 100)}
                      max={100}
                      size={80}
                      strokeWidth={8}
                      isVisible={isVisible}
                    />
                  </div>
                  <p className="text-yellow-400 font-medium">Current Streak</p>
                  <p className="text-gray-500 text-xs">{stats.currentStreak} days</p>
                </div>

                {/* Longest Streak */}
                <div className="text-center">
                  <h4 className="text-4xl font-bold text-pink-500">{stats.longestStreak}</h4>
                  <p className="text-gray-400 text-sm">Longest Streak</p>
                  <p className="text-gray-500 text-xs mt-1">Days</p>
                </div>
              </div>

              {/* Top Languages */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Top Languages</h4>
                <div className="space-y-3">
                  {Object.entries(stats.topLanguages)
                    .slice(0, 3)
                    .map(([language, percentage]) => (
                      <div key={language} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{language}</span>
                        <div className="flex items-center gap-2 w-20">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-[#ff9d00] h-2 rounded-full transition-all duration-1000"
                              style={{ width: isVisible ? `${percentage}%` : "0%" }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GitHubStatsComponent
