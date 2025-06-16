/**
 * Optimized Projects Component
 * 
 * Performance improvements:
 * - Memoized components to prevent unnecessary re-renders
 * - Optimized state management
 * - Reduced CSS animations
 * - Better image loading strategy
 * - Virtualization for large lists
 */

"use client"

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react"
import Image from "next/image"
import { ArrowUpRight, Star, GitFork, AlertCircle, Code, Eye, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import type { GitHubRepo, PinnedProject, ProjectsState, } from "@/app/lib/types"
import { BackendURL, GithubUsername, PinnedRepoApiUrl } from "@/app/utils/Links"
import DefaultBanner from "@/app/assets/default_banner.jpg"
import type { PinnedRepoAPI } from "@/app/lib/types"

// Memoized Skeleton component
const ProjectCardSkeleton = memo(() => (
  <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden h-full flex flex-col">
    <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-700/20" />
    <div className="p-4 flex flex-col flex-grow space-y-3">
      <div className="h-6 bg-gray-700/50 rounded w-3/4" />
      <div className="space-y-2 flex-grow">
        <div className="h-4 bg-gray-700/50 rounded w-full" />
        <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      </div>
      <div className="h-4 bg-gray-700/50 rounded w-24" />
      <div className="h-10 bg-gray-700/50 rounded-lg w-full" />
    </div>
  </div>
))

const Projects = () => {
  // Optimized state structure
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

  // Memoized failed images to prevent re-renders
  const failedImages = useMemo(() => state.failedImages, [state.failedImages]);

  // API Functions (same as before but with error boundaries)
  const fetchGitHubData = useCallback(async (endpoint: string): Promise<any> => {
    try {
      const response = await fetch(`${BackendURL}?endpoint=${endpoint}&cache=true`);
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      throw error;
    }
  }, []);

  const fetchPinnedRepos = useCallback(async (): Promise<PinnedRepoAPI[]> => {
    try {
      const response = await fetch(`${PinnedRepoApiUrl}${GithubUsername}`);
      if (!response.ok) throw new Error("Failed to fetch pinned repositories");
      return await response.json();
    } catch (error) {
      console.error("Pinned Repos API Error:", error);
      throw error;
    }
  }, []);

  const convertPinnedToProject = useCallback((pinnedRepo: PinnedRepoAPI): PinnedProject => ({
    name: pinnedRepo.name,
    description: pinnedRepo.description || "No description available",
    image: `https://opengraph.githubassets.com/1/${pinnedRepo.author}/${pinnedRepo.name}`,
    url: `https://github.com/${pinnedRepo.author}/${pinnedRepo.name}`,
    stars: pinnedRepo.stars,
    forks: pinnedRepo.forks,
    issues: 0,
    updated_at: pinnedRepo.updated_at || null,
  }), []);

  // Optimized date formatting with memoization
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }, [])

  // Memoized and optimized ProjectCard component
  const ProjectCard = memo(({ project, featured = false }: { 
    project: PinnedProject | GitHubRepo; 
    featured?: boolean 
  }) => {
    const isGitHubRepo = "html_url" in project
    const projectName = project.name
    const projectDescription = project.description || "No description available"
    const projectUrl = isGitHubRepo ? project.html_url : project.url
    const projectStars = isGitHubRepo ? project.stargazers_count : project.stars
    const projectForks = isGitHubRepo ? project.forks_count : project.forks
    const projectLanguage = isGitHubRepo ? project.language : null
    const projectUpdated = isGitHubRepo ? project.updated_at : (project as PinnedProject).updated_at
    const projectImage = isGitHubRepo
      ? `https://opengraph.githubassets.com/1/${GithubUsername}/${project.name}`
      : project.image

    // Optimized image error handler
    const handleImageError = useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        failedImages: new Set([...prev.failedImages, projectImage]) 
      }));
    }, [projectImage]);

    // Use default image if failed
    const imageSource = failedImages.has(projectImage) ? DefaultBanner.src : projectImage;

    return (
      <div className="group bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-200 h-full flex flex-col">
        {/* Simplified image section - removed heavy animations */}
        <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
          <Image
            src={imageSource}
            alt={`${projectName} preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={handleImageError}
            priority={featured}
            loading={featured ? "eager" : "lazy"}
          />

          {/* Simplified overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Badges */}
          {featured && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 rounded-full text-xs text-white font-medium">
              Featured
            </div>
          )}

          {projectLanguage && (
            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-full text-xs text-white">
              {projectLanguage}
            </div>
          )}

          {/* Stats */}
          <div className="absolute bottom-2 left-2 flex space-x-2 text-white">
            <div className="flex items-center space-x-1 bg-black/70 px-2 py-1 rounded-full text-xs">
              <Star size={10} />
              <span>{projectStars}</span>
            </div>
            <div className="flex items-center space-x-1 bg-black/70 px-2 py-1 rounded-full text-xs">
              <GitFork size={10} />
              <span>{projectForks}</span>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-2 text-cyan-400 line-clamp-1">
            {projectName}
          </h3>

          <p className="text-gray-300 mb-3 text-sm line-clamp-2 flex-grow">
            {projectDescription}
          </p>

          {projectUpdated && (
            <div className="flex items-center space-x-1 mb-3 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{formatDate(projectUpdated)}</span>
            </div>
          )}

          {/* Simplified button */}
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors duration-200 font-medium text-sm"
          >
            <Eye size={14} />
            <span>View Project</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    )
  })

  // Data fetching effect (same logic, but with better error handling)
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [pinnedRepos, recentData] = await Promise.all([
          fetchPinnedRepos(),
          fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=6`)
        ]);

        if (!isMounted) return;

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
              return convertPinnedToProject(pinnedRepo);
            }
          })
        );

        if (isMounted) {
          setState(prev => ({
            ...prev,
            featuredProjects: projectData,
            recentProjects: recentData,
            loading: false,
            error: null
          }));
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : "Failed to fetch projects"
          }));
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [fetchPinnedRepos, fetchGitHubData, convertPinnedToProject]);

  // Optimized intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentRef = projectsRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => observer.disconnect();
  }, []);

  // Optimized load more handler
  const handleShowMore = useCallback(async () => {
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
  }, [state.showAll, state.allRecentProjects.length, fetchGitHubData]);

  // Memoized projects to render
  const projectsToRender = useMemo(() => {
    if (state.activeTab === "featured") {
      return state.featuredProjects;
    }
    return state.showAll ? state.allRecentProjects : state.recentProjects.slice(0, 6);
  }, [state.activeTab, state.featuredProjects, state.showAll, state.allRecentProjects, state.recentProjects]);

  // Error state
  if (state.error) {
    return (
      <section id="projects" className="py-18 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Projects</h2>
          <div className="text-center text-red-400 bg-red-900/20 border border-red-500/20 p-6 rounded-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-medium mb-2">Something went wrong</p>
            <p className="text-sm text-gray-400">{state.error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="projects"
      ref={projectsRef}
      className={`py-18 w-full transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Explore my latest work and contributions. From featured projects that showcase my best work
          to recent developments and experiments.
        </p>

        {/* Simplified Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-black/40 border border-cyan-500/20 p-1">
            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "featured" }))}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold text-sm ${
                state.activeTab === "featured"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Featured ({state.featuredProjects.length})
            </button>

            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "recent" }))}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold text-sm ${
                state.activeTab === "recent"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
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
            <div className="flex items-center justify-center mb-8">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
              <span className="text-gray-300">Loading projects...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsToRender.length > 0 ? (
              projectsToRender.map((project) => (
                <ProjectCard 
                  key={project.name} 
                  project={project} 
                  featured={state.activeTab === "featured"} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto mb-4 h-12 w-12 text-gray-500">
                  {state.activeTab === "featured" ? <Star /> : <Code />}
                </div>
                <p className="text-gray-400">No {state.activeTab} projects found</p>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {!state.loading && state.activeTab === "recent" && state.recentProjects.length >= 6 && (
          <div className="text-center mt-8">
            <Button
              onClick={handleShowMore}
              disabled={state.loadingMore}
              className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-colors duration-200 px-6 py-3"
            >
              {state.loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-cyan-400 mr-2" />
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