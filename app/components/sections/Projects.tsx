/**
 * Projects Component
 * 
 * A dynamic projects showcase section that displays:
 * - Featured projects (pinned repositories)
 * - Recent projects from GitHub
 * 
 * Features:
 * - Tabbed interface for featured/recent projects
 * - Project cards with GitHub stats
 * - Lazy loading images with fallback
 * - Intersection Observer animations
 * - Error handling and loading states
 * - Responsive grid layout
 * - Shows all recent projects (not limited to 6)
 * - Enhanced UI with better visual feedback
 */

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowUpRight, Star, GitFork, AlertCircle, Code, Eye, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import type { GitHubRepo, PinnedProject, ProjectsState, } from "@/app/lib/types"
import { BackendURL, GithubUsername, PinnedRepoApiUrl } from "@/app/utils/Links"
import DefaultBanner from "@/app/assets/default_banner.jpg"
import type { PinnedRepoAPI } from "@/app/lib/types"

// Skeleton component for loading states
const ProjectCardSkeleton = () => (
  <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden h-full flex flex-col animate-pulse">
    {/* Project Banner Section */}
    <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-700/10" />
    </div>

    {/* Project Info Section */}
    <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
      {/* Project Title */}
      <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2" />

      {/* Project Description */}
      <div className="space-y-2 mb-3 sm:mb-4 flex-grow">
        <div className="h-4 bg-gray-700/50 rounded w-full" />
        <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      </div>

      {/* Project Meta Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-700/50 rounded w-24" />
      </div>

      {/* View Project Button */}
      <div className="mt-auto">
        <div className="h-10 bg-gray-700/50 rounded-lg w-full" />
      </div>
    </div>
  </div>
)

const Projects = () => {
  // === State Management ===
  const [state, setState] = useState<ProjectsState>({
    featuredProjects: [],
    recentProjects: [],
    allRecentProjects: [],
    loading: true,
    loadingMore: false,
    error: null,
    activeTab: "featured",
    failedImages: new Set(),
    showAll: false
  });

  const projectsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // === API Functions ===
  /**
   * Fetches data from the custom backend API
   * @param endpoint - The GitHub API endpoint to fetch from
   * @returns The JSON response data
   * @throws Error if the API request fails
   */
  const fetchGitHubData = async (endpoint: string): Promise<any> => {
    try {
      const response = await fetch(`${BackendURL}?endpoint=${endpoint}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch GitHub data");
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub API Error:", error);
      throw error;
    }
  }

  /**
   * Fetches pinned repositories from the berrysauce API
   * @returns Array of pinned repository data
   * @throws Error if the API request fails
   */
  const fetchPinnedRepos = async (): Promise<PinnedRepoAPI[]> => {
    try {
      const response = await fetch(`${PinnedRepoApiUrl}${GithubUsername}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pinned repositories");
      }

      return await response.json();
    } catch (error) {
      console.error("Pinned Repos API Error:", error);
      throw error;
    }
  }

  /**
   * Converts a PinnedRepoAPI object to PinnedProject format
   * @param pinnedRepo - The pinned repository data
   * @returns Formatted project data
   */
  const convertPinnedToProject = (pinnedRepo: PinnedRepoAPI): PinnedProject => ({
    name: pinnedRepo.name,
    description: pinnedRepo.description || "No description available",
    image: `https://opengraph.githubassets.com/1/${pinnedRepo.author}/${pinnedRepo.name}`,
    url: `https://github.com/${pinnedRepo.author}/${pinnedRepo.name}`,
    stars: pinnedRepo.stars,
    forks: pinnedRepo.forks,
    issues: 0,
    updated_at: pinnedRepo.updated_at || null,
  });

  // === Data Fetching Effects ===
  /**
   * Fetches both featured and recent projects on component mount
   * Handles error states and loading states
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured projects
        const pinnedRepos = await fetchPinnedRepos();
        const projectData = await Promise.all(
          pinnedRepos.map(async (pinnedRepo) => {
            try {
              const fullRepoData = await fetchGitHubData(`/repos/${pinnedRepo.author}/${pinnedRepo.name}`);
              return {
                ...convertPinnedToProject(pinnedRepo),
                description: fullRepoData.description || pinnedRepo.description || "No description available",
                issues: fullRepoData.open_issues_count || 0,
                updated_at: fullRepoData.updated_at,
              };
            } catch (error) {
              console.warn(`Failed to fetch details for ${pinnedRepo.name}, using pinned data:`, error);
              return convertPinnedToProject(pinnedRepo);
            }
          })
        );

        // Fetch initial recent projects
        const recentData = await fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=6`);

        setState(prev => ({
          ...prev,
          featuredProjects: projectData,
          recentProjects: recentData,
          loading: false,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch projects"
        }));
      }
    };

    fetchData();
  }, []);

  // === Load More Functionality ===
  const handleShowMore = async () => {
    if (state.showAll || state.allRecentProjects.length > 0) {
      setState(prev => ({ ...prev, showAll: !prev.showAll }));
      return;
    }

    setState(prev => ({ ...prev, loadingMore: true }));
    try {
      const data = await fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=100`);
      setState(prev => ({
        ...prev,
        allRecentProjects: data,
        showAll: true,
        loadingMore: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Failed to load more projects"
      }));
    }
  };

  // === Animation Effects ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = projectsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, []);

  // === Helper Functions ===
  /**
   * Format date to relative time
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return diffMinutes === 0 ? "Just now" : `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    }
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // === Component Sub-Components ===
  /**
   * ProjectCard Component
   * Renders a single project card with image, stats, and actions
   * @param project - The project data (either PinnedProject or GitHubRepo)
   * @param featured - Whether this is a featured project
   */
  const ProjectCard = ({ project, featured = false }: { project: PinnedProject | GitHubRepo; featured?: boolean }) => {
    // Handle different project types
    const isGitHubRepo = "html_url" in project
    const projectName = project.name
    const projectDescription = project.description || "No description available"
    const projectUrl = isGitHubRepo ? project.html_url : project.url
    const projectStars = isGitHubRepo ? project.stargazers_count : project.stars
    const projectForks = isGitHubRepo ? project.forks_count : project.forks
    const projectIssues = isGitHubRepo ? project.open_issues_count : project.issues
    const projectLanguage = isGitHubRepo ? project.language : null
    const projectUpdated = isGitHubRepo ? project.updated_at : (project as PinnedProject).updated_at
    const projectImage = isGitHubRepo
      ? `https://opengraph.githubassets.com/1/${GithubUsername}/${project.name}`
      : project.image

    /**
     * Handles image loading errors by adding the URL to failed images set
     * @param imageUrl - The URL of the failed image
     */
    const handleImageError = (imageUrl: string) => {
      setState(prev => ({ ...prev, failedImages: new Set([...prev.failedImages, imageUrl]) }));
    }

    return (
      <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-[#00FFFF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FFFF]/10 hover:-translate-y-1 h-full flex flex-col">
        {/* Project Banner Section */}
        <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
          {/* Project Preview Image */}
          <Image
            src={state.failedImages.has(projectImage) ? DefaultBanner.src : projectImage}
            alt={`${projectName} project preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImageError(projectImage)}
            priority={featured}
            loading={featured ? "eager" : "lazy"}
          />

          {/* Gradient Overlay for Better Text Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Star size={10} className="text-white fill-white" />
              <span className="font-medium text-white hidden sm:inline">Featured</span>
            </div>
          )}

          {/* Language Badge */}
          {projectLanguage && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Code size={10} className="text-white" />
              <span className="font-medium text-white hidden sm:inline">{projectLanguage}</span>
            </div>
          )}

          {/* Project Stats Overlay */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-white/90">
            {/* Stars Count */}
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Star size={10} />
              <span className="font-medium">{projectStars}</span>
            </div>
            {/* Forks Count */}
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <GitFork size={10} />
              <span className="font-medium">{projectForks}</span>
            </div>
          </div>
        </div>

        {/* Project Info Section */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
          {/* Project Title */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-[#00FFFF] line-clamp-1 group-hover:text-[#00BFFF] transition-colors">
            {projectName}
          </h3>

          {/* Project Description */}
          <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 flex-grow">
            {projectDescription}
          </p>

          {/* Project Meta Info */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            {projectUpdated && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formatDate(projectUpdated)}</span>
              </div>
            )}
          </div>

          {/* View Project Button */}
          <div className="mt-auto">
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/60 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 transform transition-all duration-300 hover:scale-[1.02] font-medium text-sm sm:text-base group/button"
            >
              <Eye size={14} className="sm:size-4" />
              <span>View Project</span>
              <ArrowUpRight className="size-3 sm:size-4 transition-transform group-hover/button:translate-x-1 group-hover/button:-translate-y-1" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // === Error State ===
  if (state.error) {
    return (
      <section id="projects" className="py-18 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">Projects</h2>
          <div className="text-center text-red-400 bg-red-900/20 border border-red-500/20 p-6 rounded-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-medium mb-2">Oops! Something went wrong</p>
            <p className="text-sm text-gray-400">{state.error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // === Main Render ===

  return (
    <section
      id="projects"
      ref={projectsRef}
      className={`py-18 w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center">Projects</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Explore my latest work and contributions. From featured projects that showcase my best work
          to recent developments and experiments.
        </p>
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="relative inline-flex rounded-full bg-black/40 backdrop-blur-sm border border-cyan-500/20 p-1 shadow-lg shadow-cyan-500/10">
            {/* Glowing moving indicator */}
            <div
              className={`absolute top-1 bottom-1 rounded-full blur-sm bg-cyan-500/30 transition-all duration-300 ${state.activeTab === "featured"
                  ? "left-1 w-[calc(50%-4px)]"
                  : "left-1/2 w-[calc(50%-4px)]"
                }`}
            ></div>
            {/* Solid colored indicator for foreground */}
            <div
              className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${state.activeTab === "featured"
                  ? "left-1 w-[calc(50%-4px)]"
                  : "left-1/2 w-[calc(50%-4px)]"
                }`}
            ></div>

            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "featured" }))}
              className={`relative z-10 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm ${state.activeTab === "featured"
                  ? "text-black"
                  : "text-gray-400 hover:text-cyan-300"
                }`}
            >
              Featured ({state.featuredProjects.length})
            </button>

            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "recent" }))}
              className={`relative z-10 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm ${state.activeTab === "recent"
                  ? "text-black"
                  : "text-gray-400 hover:text-cyan-300"
                }`}
            >
              Recent ({state.showAll ? state.allRecentProjects.length : state.recentProjects.length})
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {state.loading ? (
          <>
            <div className="flex flex-col items-center justify-center space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#00FFFF]" />
                <span className="text-gray-300">Loading projects...</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {state.activeTab === "featured" ? (
              // Featured Projects
              state.featuredProjects.length > 0 ? (
                state.featuredProjects.map((project) => (
                  <ProjectCard key={project.name} project={project} featured />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Star className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">No featured projects found</p>
                </div>
              )
            ) : (
              // Recent Projects - Show only 6 initially
              (state.showAll ? state.allRecentProjects : state.recentProjects.slice(0, 6)).length > 0 ? (
                (state.showAll ? state.allRecentProjects : state.recentProjects.slice(0, 6)).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Code className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">No recent projects found</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Show More/Less Button for Recent Projects */}
        {!state.loading && state.activeTab === "recent" && state.recentProjects.length >= 6 && (
          <div className="text-center mt-8">
            <Button
              onClick={handleShowMore}
              disabled={state.loadingMore}
              className="bg-gradient-to-r from-[#00FFFF]/10 to-[#00BFFF]/10 border border-[#00FFFF]/50 text-[#00FFFF] hover:from-[#00FFFF]/20 hover:to-[#00BFFF]/20 hover:border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF]/20 transition-all duration-300 px-6 py-3 text-sm sm:text-base"
            >
              {state.loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00FFFF] mr-2" />
                  Loading...
                </>
              ) : state.showAll ? (
                "Show Less"
              ) : (
                "Load More Projects"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Projects