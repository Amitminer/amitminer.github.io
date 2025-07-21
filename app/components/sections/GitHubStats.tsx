/**
 * GitHubStats Component
 * 
 * A dynamic GitHub statistics showcase that displays:
 * - User statistics and activity metrics
 * - Repository statistics
 * - Contribution data
 * - Activity timeline
 */

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  GitFork,
  Code,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { BackendURL, GithubUsername } from "@/app/utils/Links"
import type { GitHubStats, DetailCardProps, StatCardProps } from "@/app/lib/types"

// Skeleton Components
const StatCardSkeleton = () => (
  <div id="stat-card" className="stat-card animate-pulse">
    <div className="w-8 h-8 bg-gray-700 rounded mb-2"></div>
    <div className="w-16 h-8 bg-gray-700 rounded mb-1"></div>
    <div className="w-20 h-4 bg-gray-700 rounded"></div>
  </div>
);

const DetailCardSkeleton = () => (
  <div id="stat-card" className="stat-card animate-pulse">
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
    <div id="stat-card" className="stat-card">
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
    <div id="stat-card" className="stat-card">
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
  const statsRef = useRef<HTMLDivElement>(null)

  const GITHUB_USERNAME = GithubUsername

  // Fetch stats from backend
  const fetchGitHubStats = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${BackendURL}/v2/stats?username=${GITHUB_USERNAME}${force ? "&force=true" : ""}`
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch GitHub stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats')
    } finally {
      setLoading(false)
    }
  }, [GITHUB_USERNAME])

  useEffect(() => {
    fetchGitHubStats()
  }, [fetchGitHubStats])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    const currentRef = statsRef.current
    if (currentRef) observer.observe(currentRef)
    return () => { if (currentRef) observer.unobserve(currentRef) }
  }, [])

  // Refresh data handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await fetchGitHubStats(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh GitHub stats')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Helper functions
  const getCacheAge = (): string => {
    if (!stats?.cacheAge) return 'Just now'
    const age = stats.cacheAge
    if (age < 60) return `${age}s ago`
    if (age < 3600) return `${Math.floor(age / 60)}m ago`
    return `${Math.floor(age / 3600)}h ago`
  }

  const getYearsActive = (): number => {
    if (!stats) return 0
    const created = new Date(stats.accountCreated)
    const now = new Date()
    return now.getFullYear() - created.getFullYear()
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Render loading state
  if (loading && !stats) {
    return (
      <section className="py-16 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-linear-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-center">
            GitHub Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Render error state
  if (error) {
    return (
      <section className="py-16 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="text-2xl font-bold mb-2 text-red-300">Error Loading Stats</h2>
            <p className="text-orange-300 mb-4">
              {error}
              <br />
              <span className="text-xs text-gray-400 block mt-2">
                Note: The backend server we use for GitHub stats may be restricting access (e.g., due to CORS, rate limits, or region restrictions), or your network connection may be unstable. <br />
                Try reloading the page, or connect using a different network (VPN, mobile data, etc). If the issue persists, the backend may be temporarily unavailable.
              </span>
            </p>
            <button
              onClick={handleRefresh}
              className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
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
    )
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
          <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
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
  )
}

export default GitHubStatsComponent