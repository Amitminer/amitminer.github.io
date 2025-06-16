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

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Image from "next/image"
import { ArrowUpRight, Star, GitFork, AlertCircle, Code, Eye, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import type { GitHubRepo, PinnedProject, ProjectsState, } from "@/app/lib/types"
import { BackendURL, GithubUsername, PinnedRepoApiUrl } from "@/app/utils/Links"
import DefaultBanner from "@/app/assets/default_banner.jpg"
import type { PinnedRepoAPI } from "@/app/lib/types"

// ===== CACHING SYSTEM =====
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < this.TTL) {
      return cached.data;
    }

    // Return ongoing promise if request is in flight
    if (cached?.promise) {
      return cached.promise;
    }

    // Start new request
    const promise = fetcher().then(data => {
      this.cache.set(key, { data, timestamp: now });
      return data;
    }).catch(error => {
      this.cache.delete(key); // Remove failed request from cache
      throw error;
    });

    this.cache.set(key, { data: null, timestamp: now, promise });
    return promise;
  }

  clear() {
    this.cache.clear();
  }
}

const requestCache = new RequestCache();

// ===== IMAGE UTILITIES =====
/**
 * Smart image URL generation with fallback strategy
 */
const generateOptimalImageUrl = (repoName: string, owner: string = GithubUsername): string => {
  // Use GitHub's OpenGraph service directly (faster than weserv.nl proxy)
  return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
};

/**
 * Preload critical images for better perceived performance
 */
const preloadCriticalImages = (projects: (PinnedProject | GitHubRepo)[], count: number = 3) => {
  if (typeof window === 'undefined') return;

  projects.slice(0, count).forEach((project, index) => {
    const imageUrl = 'html_url' in project
      ? generateOptimalImageUrl(project.name)
      : project.image;

    const link = document.createElement('link') as HTMLLinkElement & { fetchPriority?: string };
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.fetchPriority = index === 0 ? 'high' : 'low';
    document.head.appendChild(link);
  });
};

// ===== API FUNCTIONS =====
/**
 * Enhanced GitHub API fetcher with caching and error handling
 */
const fetchGitHubData = async (endpoint: string): Promise<any> => {
  return requestCache.get(`github-${endpoint}`, async () => {
    const response = await fetch(`${BackendURL}?endpoint=${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch GitHub data`);
    }

    return response.json();
  });
};

/**
 * Enhanced pinned repos fetcher with caching
 */
const fetchPinnedRepos = async (): Promise<PinnedRepoAPI[]> => {
  return requestCache.get(`pinned-${GithubUsername}`, async () => {
    const response = await fetch(`${PinnedRepoApiUrl}${GithubUsername}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pinned repositories: ${response.status}`);
    }

    return response.json();
  });
};

/**
 * Batch fetch repository details with intelligent fallbacks
 */
const fetchReposBatch = async (repos: PinnedRepoAPI[]): Promise<PinnedProject[]> => {
  // Process repos in parallel with individual error handling
  const results = await Promise.allSettled(
    repos.map(async (repo): Promise<PinnedProject> => {
      try {
        const fullRepoData = await fetchGitHubData(`/repos/${repo.author}/${repo.name}`);
        return {
          name: repo.name,
          description: fullRepoData.description || repo.description || "No description available",
          image: generateOptimalImageUrl(repo.name, repo.author),
          url: `https://github.com/${repo.author}/${repo.name}`,
          stars: fullRepoData.stargazers_count || repo.stars || 0,
          forks: fullRepoData.forks_count || repo.forks || 0,
          issues: fullRepoData.open_issues_count || 0,
          updated_at: fullRepoData.updated_at || repo.updated_at || null,
        };
      } catch (error) {
        // Fallback to basic pinned repo data
        console.warn(`Failed to fetch details for ${repo.name}, using basic data:`, error);
        return {
          name: repo.name,
          description: repo.description || "No description available",
          image: generateOptimalImageUrl(repo.name, repo.author),
          url: `https://github.com/${repo.author}/${repo.name}`,
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          issues: 0,
          updated_at: repo.updated_at || null,
        };
      }
    })
  );

  // Extract successful results and log any failures
  return results
    .filter((result): result is PromiseFulfilledResult<PinnedProject> => result.status === 'fulfilled')
    .map(result => result.value);
};

// ===== SKELETON COMPONENT =====
const ProjectCardSkeleton = () => (
  <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden h-full flex flex-col animate-pulse">
    <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-700/10" />
    </div>
    <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
      <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2" />
      <div className="space-y-2 mb-3 sm:mb-4 flex-grow">
        <div className="h-4 bg-gray-700/50 rounded w-full" />
        <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-700/50 rounded w-24" />
      </div>
      <div className="mt-auto">
        <div className="h-10 bg-gray-700/50 rounded-lg w-full" />
      </div>
    </div>
  </div>
);

// ===== MAIN COMPONENT =====
const Projects = () => {
  // ===== STATE MANAGEMENT =====
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

  const [enhancing, setEnhancing] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ===== DATA FETCHING =====
  const fetchInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Phase 1: Fetch all basic data in parallel
      const [pinnedRepos, recentData] = await Promise.allSettled([
        fetchPinnedRepos(),
        fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=12`) // Get a few more initially
      ]);

      // Handle pinned repos
      const pinnedData = pinnedRepos.status === 'fulfilled' ? pinnedRepos.value : [];

      // Handle recent repos
      const recentRepos = recentData.status === 'fulfilled' ? recentData.value : [];

      // Phase 2: Create basic featured projects (fast display)
      const basicFeaturedProjects: PinnedProject[] = pinnedData.map(repo => ({
        name: repo.name,
        description: repo.description || "Loading details...",
        image: generateOptimalImageUrl(repo.name, repo.author),
        url: `https://github.com/${repo.author}/${repo.name}`,
        stars: repo.stars || 0,
        forks: repo.forks || 0,
        issues: 0,
        updated_at: repo.updated_at || null,
      }));

      // Show basic data immediately
      setState(prev => ({
        ...prev,
        featuredProjects: basicFeaturedProjects,
        recentProjects: recentRepos.slice(0, 6), // Show 6 initially
        loading: false,
        error: null
      }));

      // Preload critical images
      preloadCriticalImages([...basicFeaturedProjects, ...recentRepos.slice(0, 3)]);

      // Phase 3: Enhance featured projects in background
      if (pinnedData.length > 0) {
        setEnhancing(true);
        try {
          const enhancedProjects = await fetchReposBatch(pinnedData);
          setState(prev => ({
            ...prev,
            featuredProjects: enhancedProjects
          }));
        } catch (error) {
          console.warn('Failed to enhance projects, keeping basic data:', error);
        } finally {
          setEnhancing(false);
        }
      }

    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch projects"
      }));
    }
  }, []);

  // ===== LOAD MORE FUNCTIONALITY =====
  const handleShowMore = useCallback(async () => {
    if (state.showAll || state.allRecentProjects.length > 0) {
      setState(prev => ({ ...prev, showAll: !prev.showAll }));
      return;
    }

    setState(prev => ({ ...prev, loadingMore: true }));
    try {
      const data = await fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=50`); // Reduced from 100
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
  }, [state.showAll, state.allRecentProjects.length]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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

  // ===== HELPER FUNCTIONS =====
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }, []);

  // ===== PROJECT CARD COMPONENT =====
  const ProjectCard = useCallback(({ project, featured = false }: { project: PinnedProject | GitHubRepo; featured?: boolean }) => {
    const isGitHubRepo = "html_url" in project;
    const projectName = project.name;
    const projectDescription = project.description || "No description available";
    const projectUrl = isGitHubRepo ? project.html_url : project.url;
    const projectStars = isGitHubRepo ? project.stargazers_count : project.stars;
    const projectForks = isGitHubRepo ? project.forks_count : project.forks;
    const projectIssues = isGitHubRepo ? project.open_issues_count : project.issues;
    const projectLanguage = isGitHubRepo ? project.language : null;
    const projectUpdated = isGitHubRepo ? project.updated_at : (project as PinnedProject).updated_at;

    const imageUrl = isGitHubRepo
      ? generateOptimalImageUrl(project.name)
      : (project as PinnedProject).image;

    const handleImageError = useCallback((imageUrl: string) => {
      setState(prev => ({ ...prev, failedImages: new Set([...prev.failedImages, imageUrl]) }));
    }, []);

    return (
      <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-[#00FFFF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FFFF]/10 hover:-translate-y-1 h-full flex flex-col">
        <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
          <Image
            src={state.failedImages.has(imageUrl) ? DefaultBanner.src : imageUrl}
            alt={`${projectName} project preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImageError(imageUrl)}
            priority={featured}
            loading={featured ? "eager" : "lazy"}
            quality={35}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {featured && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Star size={10} className="text-white fill-white" />
              <span className="font-medium text-white hidden sm:inline">Featured</span>
            </div>
          )}

          {projectLanguage && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Code size={10} className="text-white" />
              <span className="font-medium text-white hidden sm:inline">{projectLanguage}</span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-white/90">
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <Star size={10} />
              <span className="font-medium">{projectStars}</span>
            </div>
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              <GitFork size={10} />
              <span className="font-medium">{projectForks}</span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-[#00FFFF] line-clamp-1 group-hover:text-[#00BFFF] transition-colors">
            {projectName}
          </h3>

          <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 flex-grow">
            {projectDescription}
          </p>

          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            {projectUpdated && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formatDate(projectUpdated)}</span>
              </div>
            )}
          </div>

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
    );
  }, [state.failedImages, formatDate]);

  // ===== MEMOIZED VALUES =====
  const displayedRecentProjects = useMemo(() => {
    return state.showAll ? state.allRecentProjects : state.recentProjects.slice(0, 6);
  }, [state.showAll, state.allRecentProjects, state.recentProjects]);

  // ===== ERROR STATE =====
  if (state.error) {
    return (
      <section id="projects" className="py-18 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">Projects</h2>
          <div className="text-center text-red-400 bg-red-900/20 border border-red-500/20 p-6 rounded-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-medium mb-2">Oops! Something went wrong</p>
            <p className="text-sm text-gray-400">{state.error}</p>
            <Button
              onClick={() => {
                requestCache.clear();
                fetchInitialData();
              }}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <section
      id="projects"
      ref={projectsRef}
      className={`py-18 w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center">Projects</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Explore my latest work and contributions. From featured projects that showcase my best work
          to recent developments and experiments.
        </p>

        {/* Enhanced Loading State */}
        {enhancing && !state.loading && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 text-cyan-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Enhancing project details...</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="relative inline-flex rounded-full bg-black/40 backdrop-blur-sm border border-cyan-500/20 p-1 shadow-lg shadow-cyan-500/10">
            <div
              className={`absolute top-1 bottom-1 rounded-full blur-sm bg-cyan-500/30 transition-all duration-300 ${state.activeTab === "featured"
                  ? "left-1 w-[calc(50%-4px)]"
                  : "left-1/2 w-[calc(50%-4px)]"
                }`}
            />
            <div
              className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${state.activeTab === "featured"
                  ? "left-1 w-[calc(50%-4px)]"
                  : "left-1/2 w-[calc(50%-4px)]"
                }`}
            />

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
              Recent ({displayedRecentProjects.length})
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
              displayedRecentProjects.length > 0 ? (
                displayedRecentProjects.map((project) => (
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

        {/* Show More/Less Button */}
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
  );
};

export default Projects;