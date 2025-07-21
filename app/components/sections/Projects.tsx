/**
 * Projects Component
 * 
 * A dynamic projects showcase section that displays:
 * - Custom curated projects (replaces pinned repositories)
 * - Recent projects from GitHub
 * 
 * Features:
 * - Tabbed interface for custom/recent projects
 * - Project cards with GitHub stats
 * - Lazy loading images with fallback
 * - Intersection Observer animations
 * - Error handling and loading states
 * - Grid layout
 * - Custom project pages via /projects/[slug]
 */

"use client"

import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Star, GitFork, AlertCircle, Code, Eye, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import type { GitHubRepo } from "@/app/lib/types"
import { BackendURL, GithubUsername } from "@/app/utils/Links"
import DefaultBanner from "@/app/assets/default_banner.jpg"
import { projectImages, previewImages } from '@/app/assets/projects';

import { getCustomProjects, type CustomProject } from "@/app/lib/data/projects"

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

// ===== CACHING =====
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

// ===== IMAGE UTILITIES =====
const generateImageUrl = (repoName: string, owner: string = GithubUsername): string => {
  return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
};

// ===== API FUNCTIONS =====
const fetchWithCache = async function <T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

const fetchGitHubData = async (endpoint: string): Promise<any> => {
  return fetchWithCache(`github-${endpoint}`, async () => {
    const response = await fetch(`${BackendURL}/v2/?endpoint=${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
};

// ===== SKELETON =====
const ProjectCardSkeleton = memo(() => (
  <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden h-[320px] animate-pulse">
    <div className="h-48 bg-linear-to-r from-gray-700/20 to-gray-700/10" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-700/50 rounded w-3/4" />
      <div className="h-4 bg-gray-700/50 rounded w-full" />
      <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      <div className="h-10 bg-gray-700/50 rounded-lg w-full mt-4" />
    </div>
  </div>
));
ProjectCardSkeleton.displayName = 'ProjectCardSkeleton';

// ===== CUSTOM PROJECT CARD =====
const CustomProjectCard = memo(({ project }: { project: CustomProject }) => {
  const [imageError, setImageError] = useState(false);
  const previewImage = previewImages[project.slug];
  const mainImage = projectImages[project.slug];

  const getStatusColor = (status: CustomProject['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'archived': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusText = (status: CustomProject['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'archived': return 'Archived';
      default: return 'Unknown';
    }
  };

  return (
    <div className="group bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-200 h-full flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={imageError ? DefaultBanner.src : (mainImage || DefaultBanner.src)}
          alt={`${project.name} preview`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          priority={project.featured}
          decoding="async"
          loading={project.featured ? "eager" : "lazy"}
          quality={75}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {project.featured && (
          <div className="absolute top-2 right-2 bg-linear-to-r from-pink-500 to-purple-500 px-2 py-1 rounded-full text-xs text-white font-medium">
            <Star size={10} className="inline mr-1" />
            Featured
          </div>
        )}

        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </div>

        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {project.technologies.slice(0, 2).map((tech) => (
            <div key={tech} className="bg-black/60 px-2 py-1 rounded-full text-xs text-white">
              {tech}
            </div>
          ))}
          {project.technologies.length > 2 && (
            <div className="bg-black/60 px-2 py-1 rounded-full text-xs text-white">
              +{project.technologies.length - 2}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col grow">
        <h3 className="text-lg font-bold mb-2 text-cyan-400 line-clamp-1">
          {project.name}
        </h3>

        <p className="text-gray-300 mb-4 text-sm line-clamp-2 grow">
          {project.description}
        </p>

        <Link
          href={`/projects/${project.slug}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600/20 border border-purple-500/60 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors duration-200 font-medium text-sm"
        >
          Learn More
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
});
CustomProjectCard.displayName = 'CustomProjectCard';

// ===== GITHUB PROJECT CARD =====
const GitHubProjectCard = memo(({ project }: { project: GitHubRepo }) => {
  const [imageError, setImageError] = useState(false);

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

  const imageUrl = generateImageUrl(project.name);

  return (
    <div className="group bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-200 h-full flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={imageError ? DefaultBanner.src : imageUrl}
          alt={`${project.name} preview`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          decoding="async"
          loading="lazy"
          quality={75}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {project.language && (
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
            <Code size={10} className="inline mr-1" />
            {project.language}
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex space-x-2 text-white text-xs">
          <div className="bg-black/60 px-2 py-1 rounded-full flex items-center">
            <Star size={10} className="mr-1" />
            {project.stargazers_count}
          </div>
          <div className="bg-black/60 px-2 py-1 rounded-full flex items-center">
            <GitFork size={10} className="mr-1" />
            {project.forks_count}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col grow">
        <h3 className="text-lg font-bold mb-2 text-cyan-400 line-clamp-1">
          {project.name}
        </h3>

        <p className="text-gray-300 mb-3 text-sm line-clamp-2 grow">
          {project.description || "No description available"}
        </p>

        {project.updated_at && (
          <div className="flex items-center text-xs text-gray-400 mb-3">
            <Calendar size={12} className="mr-1" />
            {formatDate(project.updated_at)}
          </div>
        )}

        <a
          href={project.html_url}
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
GitHubProjectCard.displayName = 'GitHubProjectCard';

// ===== MAIN COMPONENT =====
const Projects = () => {
  // ===== STATE =====
  const [state, setState] = useState<{
    recentProjects: GitHubRepo[];
    loading: boolean;
    error: string | null;
    activeTab: "featured" | "recent";
    showAll: boolean;
  }>({
    recentProjects: [],
    loading: true,
    error: null,
    activeTab: "featured",
    showAll: false
  });

  const projectsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ===== DATA FETCHING =====
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const recentData = await fetchGitHubData(`/users/${GithubUsername}/repos?sort=updated&per_page=12`).catch(() => []);
      // Utility to generate a URL-safe slug from a string
      const toUrlSlug = (str: string) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9\-_]+/g, '-') // Replace non-url-safe chars with hyphen
          .replace(/^-+|-+$/g, '')         // Trim leading/trailing hyphens
          .replace(/--+/g, '-');           // Collapse multiple hyphens

      const recentDataWithSlugs = Array.isArray(recentData)
        ? recentData.map((repo: any) => ({
            ...repo,
            slug: repo.name ? toUrlSlug(repo.name) : '',
          }))
        : [];
      setState(prev => ({
        ...prev,
        recentProjects: recentDataWithSlugs,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load recent projects"
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
      return getCustomProjects();
    }
    return state.showAll ? state.recentProjects : state.recentProjects.slice(0, 6);
  }, [state.activeTab, state.recentProjects, state.showAll]);

  // ===== ERROR STATE =====
  if (state.error && state.activeTab === "recent") {
    return (
      <section id="projects" className="py-16 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
        <h2 className="text-3xl font-bold mb-4 text-center bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Explore my latest work and contributions.
        </p>

        {/* Tab Navigation */}
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
              Featured ({getCustomProjects().length})
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
        {state.loading && state.activeTab === "recent" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.activeTab === "featured" ? (
                displayedProjects.map((project) => (
                  <div className="animated-section" key={project.slug}>
                    <CustomProjectCard 
                      project={project as CustomProject}
                    />
                  </div>
                ))
              ) : (
                displayedProjects.map((project) => (
                  <div className="animated-section" key={project.name}>
                    <GitHubProjectCard 
                      project={project as GitHubRepo} 
                    />
                  </div>
                ))
              )}
            </div>
            {displayedProjects.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No projects found. Check your data source.
              </div>
            )}
          </>
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