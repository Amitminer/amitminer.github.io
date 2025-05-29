'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Star, GitFork, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { GitHubRepo, PinnedProject } from '@/app/lib/types';
import { BackendURL, GithubUsername, PinnedRepoApiUrl } from '@/app/utils/Links';
import DefaultBanner from '@/app/assets/default_banner.jpg';
import type { PinnedRepoAPI } from '@/app/lib/types';
const Projects = () => {
  const [featuredProjects, setFeaturedProjects] = useState<PinnedProject[]>([]);
  const [recentProjects, setRecentProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'recent'>('featured');
  const projectsRef = useRef<HTMLDivElement>(null);
  
  // Fetch GitHub data from custom API endpoint
  const fetchGitHubData = async (endpoint: string) => {
    const response = await fetch(`${BackendURL}?endpoint=${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch GitHub data');
    }

    const data = await response.json();
    return data;
  };

  // Fetch pinned repositories from the berrysauce API
  const fetchPinnedRepos = async (): Promise<PinnedRepoAPI[]> => {
    const response = await fetch(`${PinnedRepoApiUrl}${GithubUsername}`);

    if (!response.ok) {
      throw new Error('Failed to fetch pinned repositories');
    }

    const data = await response.json();
    return data;
  };

  // Convert PinnedRepoAPI to PinnedProject format
  const convertPinnedToProject = (pinnedRepo: PinnedRepoAPI): PinnedProject => ({
    name: pinnedRepo.name,
    description: pinnedRepo.description || 'No description available',
    image: `https://opengraph.githubassets.com/1/${pinnedRepo.author}/${pinnedRepo.name}`,
    url: `${BackendURL}?endpoint=/${pinnedRepo.author}/${pinnedRepo.name}&cache=true`,
    stars: pinnedRepo.stars,
    forks: pinnedRepo.forks,
    issues: 0, // Will be updated with actual data if available
  });

  // Fetch featured and recent projects on component mount
  useEffect(() => {
    // Fetch featured projects using pinned repositories API
    const fetchFeaturedProjects = async () => {
      try {
        // Get pinned repositories
        const pinnedRepos = await fetchPinnedRepos();

        // Convert to PinnedProject format and try to get additional details
        const projectData = await Promise.all(
          pinnedRepos.map(async (pinnedRepo) => {
            try {
              // Get additional repository details from GitHub API for issues count
              const fullRepoData = await fetchGitHubData(`/repos/${pinnedRepo.author}/${pinnedRepo.name}`);

              // Create PinnedProject with enhanced data
              return {
                name: pinnedRepo.name,
                description: pinnedRepo.description || fullRepoData.description || 'No description available',
                image: `https://opengraph.githubassets.com/1/${pinnedRepo.author}/${pinnedRepo.name}`,
                url: `${BackendURL}?endpoint=/${pinnedRepo.author}/${pinnedRepo.name}&cache=true`,
                stars: pinnedRepo.stars,
                forks: pinnedRepo.forks,
                issues: fullRepoData.open_issues_count || 0,
              };
            } catch (error) {
              // If GitHub API fails, use the converted pinned repo data
              console.warn(`Failed to fetch details for ${pinnedRepo.name}, using pinned data:`, error);
              return convertPinnedToProject(pinnedRepo);
            }
          })
        );

        setFeaturedProjects(projectData);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch featured projects');
      }
    };

    // Fetch recent projects sorted by update date (now showing all repos)
    const fetchRecentProjects = async () => {
      try {
        const data = await fetchGitHubData(
          `/users/${GithubUsername}/repos?sort=updated&per_page=6` 
        );
        setRecentProjects(data);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch recent projects');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
    fetchRecentProjects();
  }, []);

  // Intersection observer to add animation class when projects section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-up');
        }
      },
      { threshold: 0.1 }
    );

    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }

    return () => {
      if (projectsRef.current) {
        observer.unobserve(projectsRef.current);
      }
    };
  }, []);

  // Component to render a single project card
  const ProjectCard = ({ project, featured = false }: { project: PinnedProject | GitHubRepo; featured?: boolean }) => {
    // Handle different project types
    const isGitHubRepo = 'html_url' in project;
    const projectName = project.name;
    const projectDescription = project.description || 'No description available';
    const projectUrl = isGitHubRepo ? project.html_url : project.url;
    const projectStars = isGitHubRepo ? project.stargazers_count : project.stars;
    const projectForks = isGitHubRepo ? project.forks_count : project.forks;
    const projectIssues = isGitHubRepo ? project.open_issues_count : project.issues;
    const projectImage = isGitHubRepo
      ? `https://opengraph.githubassets.com/1/${GithubUsername}/${project.name}`
      : project.image;

    return (
      <div className={`project-card ${featured ? 'md:col-span-2' : ''}`}>
        {/* Project banner image with fallback */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-xl group">
          <Image
            src={projectImage}
            alt={projectName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = DefaultBanner.src;
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Featured badge */}
          {featured && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#FF1493]/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star size={14} className="text-[#FF1493]" />
              <span className="text-xs font-medium text-[#FF1493]">Featured</span>
            </div>
          )}
        </div>

        {/* Project info */}
        <div className="p-4 md:p-6">
          {/* Stats: stars, forks, issues */}
          <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star size={14} />
                <span>{projectStars}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitFork size={14} />
                <span>{projectForks}</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{projectIssues}</span>
              </div>
            </div>
          </div>

          {/* Project name */}
          <h3 className="text-lg md:text-xl font-bold mb-2 text-[#00FFFF]">
            {projectName}
          </h3>

          {/* Project description */}
          <p className="text-gray-300 mb-4 text-sm line-clamp-2">
            {projectDescription}
          </p>

          {/* View project button */}
          <Button
            variant="outline"
            className="border-[#00FFFF] text-white hover:bg-[#00FFFF]/10 w-full transform transition-all duration-300 hover:scale-105"
            asChild
          >
            <a href={projectUrl} target="_blank" rel="noopener noreferrer">
              <span>View Project</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  };

  // Render error message if any error occurred
  if (error) {
    return (
      <section id="projects" className="py-18 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">
            Projects
          </h2>
          <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
            <p>{error}</p>
            <p className="text-sm mt-2 text-gray-400">
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Main render of projects section
  return (
    <section
      id="projects"
      ref={projectsRef}
      className="py-18 w-full opacity-0"
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">
          Projects
        </h2>

        {/* Tab buttons for switching between featured and recent */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 px-2">
          <Button
            variant={activeTab === 'featured' ? 'default' : 'outline'}
            className={`px-3 py-2 text-xs sm:px-6 sm:py-2 sm:text-sm text-center break-words whitespace-normal max-w-full sm:max-w-none ${activeTab === 'featured'
              ? 'bg-gradient-to-r from-[#FF1493] to-[#00FFFF] text-white'
              : 'border-[#00FFFF] text-white hover:bg-[#00FFFF]/10'
              }`}
            onClick={() => setActiveTab('featured')}
          >
            <span className="hidden sm:inline">✨ Featured Projects</span>
            <span className="sm:hidden">✨ Featured</span>
          </Button>
          <Button
            variant={activeTab === 'recent' ? 'default' : 'outline'}
            className={`px-3 py-2 text-xs sm:px-6 sm:py-2 sm:text-sm text-center break-words whitespace-normal max-w-full sm:max-w-none ${activeTab === 'recent'
              ? 'bg-gradient-to-r from-[#FF1493] to-[#00FFFF] text-white'
              : 'border-[#00FFFF] text-white hover:bg-[#00FFFF]/10'
              }`}
            onClick={() => setActiveTab('recent')}
          >
            <span className="hidden sm:inline">🚀 Recent Projects</span>
            <span className="sm:hidden">🚀 Recent</span>
          </Button>
        </div>

        {/* Featured projects grid */}
        {activeTab === 'featured' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-animation">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} featured={true} />
            ))}
          </div>
        )}

        {/* Recent projects or loading placeholders */}
        {activeTab === 'recent' && (
          <div>
            {loading ? (
              // Loading skeleton placeholders
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-secondary/50 rounded-t-xl" />
                    <div className="p-6 bg-secondary/30 rounded-b-xl">
                      <div className="h-4 bg-secondary/50 rounded w-1/4 mb-4" />
                      <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-secondary/50 rounded w-2/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Recent projects grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animation">
                {recentProjects.slice(0, 6).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;