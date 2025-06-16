/**
 * Performance Optimized Projects Component
 * 
 * Key optimizations for mobile performance:
 * - Reduced re-renders with proper memoization
 * - Throttled scroll events and intersection observer
 * - Simplified animations and transitions
 * - Optimized image loading strategy
 * - Reduced DOM complexity
 * - Better state management
 */

"use client"

import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react"
import Image from "next/image"
import { ArrowUpRight, Star, GitFork, AlertCircle, Code, Eye, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import type { GitHubRepo, PinnedProject, ProjectsState, } from "@/app/lib/types"
import { BackendURL, GithubUsername, PinnedRepoApiUrl } from "@/app/utils/Links"
import DefaultBanner from "@/app/assets/default_banner.jpg"
import type { PinnedRepoAPI } from "@/app/lib/types"

// ===== PERFORMANCE UTILITIES =====
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// ===== SIMPLIFIED CACHING =====
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.TTL) {
      return cached.data;
    }
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const cache = new SimpleCache();

// ===== OPTIMIZED IMAGE UTILITIES =====
const generateImageUrl = (repoName: string, owner: string = GithubUsername): string => {
  return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
};

// ===== SIMPLIFIED API FUNCTIONS =====
const fetchWithCache = async function <T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

const fetchGitHubData = async (endpoint: string): Promise<any> => {
  return fetchWithCache(`github-${endpoint}`, async () => {
    const response = await fetch(`${BackendURL}?endpoint=${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
};

const fetchPinnedRepos = async (): Promise<PinnedRepoAPI[]> => {
  return fetchWithCache(`pinned-${GithubUsername}`, async () => {
    const response = await fetch(`${PinnedRepoApiUrl}${GithubUsername}`);
    if (!response.ok) throw new Error(`Failed to fetch pinned repositories`);
    return response.json();
  });
};

// ===== SIMPLIFIED SKELETON =====
const ProjectCardSkeleton = memo(() => (
  <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden h-[320px] animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-700/20 to-gray-700/10" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-700/50 rounded w-3/4" />
      <div className="h-4 bg-gray-700/50 rounded w-full" />
      <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      <div className="h-10 bg-gray-700/50 rounded-lg w-full mt-4" />
    </div>
  </div>
));

// ===== OPTIMIZED PROJECT CARD =====
const ProjectCard = memo(({ project, featured = false }: { project: PinnedProject | GitHubRepo; featured?: boolean }) => {
  const [imageError, setImageError] = useState(false);
  
  const isGitHubRepo = "html_url" in project;
  const projectName = project.name;
  const projectDescription = project.description || "No description available";
  const projectUrl = isGitHubRepo ? project.html_url : project.url;
  const projectStars = isGitHubRepo ? project.stargazers_count : project.stars;
  const projectForks = isGitHubRepo ? project.forks_count : project.forks;
  const projectLanguage = isGitHubRepo ? project.language : null;
  const projectUpdated = isGitHubRepo ? project.updated_at : (project as PinnedProject).updated_at;

  const imageUrl = isGitHubRepo
    ? generateImageUrl(project.name)
    : (project as PinnedProject).image;

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

  return (
    <div className="group bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-200 h-full flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={imageError ? DefaultBanner.src : imageUrl}
          alt={`${projectName} preview`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          priority={featured}
          loading={featured ? "eager" : "lazy"}
          quality={75}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 rounded-full text-xs text-white font-medium">
            <Star size={10} className="inline mr-1" />
            Featured
          </div>
        )}

        {projectLanguage && (
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
            <Code size={10} className="inline mr-1" />
            {projectLanguage}
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex space-x-2 text-white text-xs">
          <div className="bg-black/60 px-2 py-1 rounded-full flex items-center">
            <Star size={10} className="mr-1" />
            {projectStars}
          </div>
          <div className="bg-black/60 px-2 py-1 rounded-full flex items-center">
            <GitFork size={10} className="mr-1" />
            {projectForks}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 text-cyan-400 line-clamp-1">
          {projectName}
        </h3>

        <p className="text-gray-300 mb-3 text-sm line-clamp-2 flex-grow">
          {projectDescription}
        </p>

        {projectUpdated && (
          <div className="flex items-center text-xs text-gray-400 mb-3">
            <Calendar size={12} className="mr-1" />
            {formatDate(projectUpdated)}
          </div>
        )}

        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600/20 border border-purple-500/60 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors duration-200 font-medium text-sm"
        >
          <Eye size={14} />
          View Project
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
});

// ===== MAIN COMPONENT =====
const Projects = () => {
  // ===== SIMPLIFIED STATE =====
  const [state, setState] = useState<{
    featuredProjects: PinnedProject[];
    recentProjects: GitHubRepo[];
    loading: boolean;
    error: string | null;
    activeTab: "featured" | "recent";
    showAll: boolean;
  }>({
    featuredProjects: [],
    recentProjects: [],
    loading: true,
    error: null,
    activeTab: "featured",
    showAll: false
  });

  const projectsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ===== SIMPLIFIED DATA FETCHING =====
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [pinnedData, recentData] = await Promise.allSettled([
        fetchPinnedRepos().catch(() => []),
        fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=12`).catch(() => [])
      ]);

      const pinned = pinnedData.status === 'fulfilled' ? pinnedData.value : [];
      const recent = recentData.status === 'fulfilled' ? recentData.value : [];

      // Create featured projects from pinned repos
      const featured: PinnedProject[] = pinned.map(repo => ({
        name: repo.name,
        description: repo.description || "No description available",
        image: generateImageUrl(repo.name, repo.author),
        url: `https://github.com/${repo.author}/${repo.name}`,
        stars: repo.stars || 0,
        forks: repo.forks || 0,
        issues: 0,
        updated_at: repo.updated_at || null,
      }));

      setState(prev => ({
        ...prev,
        featuredProjects: featured,
        recentProjects: recent,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load projects"
      }));
    }
  }, []);

  // ===== THROTTLED INTERSECTION OBSERVER =====
  useEffect(() => {
    const handleIntersection = throttle(([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, 100);

    const observer = new IntersectionObserver(handleIntersection, { 
      threshold: 0.1,
      rootMargin: '50px'
    });

    const currentRef = projectsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== MEMOIZED PROJECTS =====
  const displayedProjects = useMemo(() => {
    if (state.activeTab === "featured") {
      return state.featuredProjects;
    }
    return state.showAll ? state.recentProjects : state.recentProjects.slice(0, 6);
  }, [state.activeTab, state.featuredProjects, state.recentProjects, state.showAll]);

  // ===== ERROR STATE =====
  if (state.error) {
    return (
      <section id="projects" className="py-16 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Projects
          </h2>
          <div className="text-center text-red-400 bg-red-900/20 border border-red-500/20 p-6 rounded-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-medium mb-2">Something went wrong</p>
            <p className="text-sm text-gray-400">{state.error}</p>
            <Button onClick={fetchData} className="mt-4 bg-red-600 hover:bg-red-700">
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
      className={`py-16 w-full transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Explore my latest work and contributions.
        </p>

        {/* Simplified Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-full p-1 border border-gray-700">
            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "featured" }))}
              className={`px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium ${
                state.activeTab === "featured"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Featured ({state.featuredProjects.length})
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: "recent" }))}
              className={`px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium ${
                state.activeTab === "recent"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Recent ({state.recentProjects.length})
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project) => (
              <ProjectCard 
                key={project.name} 
                project={project} 
                featured={state.activeTab === "featured"} 
              />
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!state.loading && state.activeTab === "recent" && state.recentProjects.length > 6 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => setState(prev => ({ ...prev, showAll: !prev.showAll }))}
              className="bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/30"
            >
              {state.showAll ? "Show Less" : "Show More Projects"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
