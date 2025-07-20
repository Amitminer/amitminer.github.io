/**
 * Project Detail Page
 *
 * Displays detailed information, preview, features, challenges, and metadata for projects.
 */
import { notFound } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, Code, Users, Zap, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { GitHubIcon } from '@/app/components/icons';
import { getCustomProjects, getProjectBySlug, type CustomProject } from '@/app/lib/data/projects';
import { previewImages } from '@/app/assets/projects';
import DefaultBanner from '@/app/assets/default_banner.jpg';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const previewImage = previewImages[slug];

  const getStatusColor = (status: CustomProject['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40';
      case 'in-progress': return 'text-amber-300 bg-amber-500/15 border-amber-400/40';
      case 'archived': return 'text-slate-300 bg-slate-500/15 border-slate-400/40';
      default: return 'text-slate-300 bg-slate-500/15 border-slate-400/40';
    }
  };

  const getStatusText = (status: CustomProject['status']) => {
    switch (status) {
      case 'completed': return '✨ Completed';
      case 'in-progress': return '🚧 In Progress';
      case 'archived': return '📦 Archived';
      default: return '❓ Unknown';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    const start = new Date(project.startDate);
    const end = project.endDate ? new Date(project.endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <ArrowLeft size={18} />
            </div>
            <span className="font-semibold">Back to Projects</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 py-8 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Project Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                      {project.name}
                    </h1>
                    <div className={`self-start px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                        <Calendar size={16} className="text-cyan-400" />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">Duration</span>
                    </div>
                    <p className="text-white text-lg font-bold">{calculateDuration()}</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <Code size={16} className="text-purple-400" />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">Stack</span>
                    </div>
                    <p className="text-white text-lg font-bold">{project.technologies.length} Tech</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {project.github && (
                    <Button asChild className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-6 py-2.5 text-white font-medium rounded-xl">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <GitHubIcon className="w-5 h-5 mr-2" />
                        View Source
                      </a>
                    </Button>
                  )}
                  {project.demo && (
                    <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-2.5 text-white font-medium rounded-xl">
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={18} className="mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Project Image */}
              <div className="order-first lg:order-last">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-10"></div>
                  {project.demo && previewImage ? (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={previewImage}
                        alt={`${project.name} preview`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                      />
                    </a>
                  ) : (
                    <Image
                      src={previewImage || DefaultBanner}
                      alt={`${project.name} preview`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid xl:grid-cols-3 gap-8 xl:gap-12">
              {/* Main Content */}
              <div className="xl:col-span-2 space-y-8 md:space-y-12">
                {/* Overview */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Target size={20} className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Project Overview
                    </h2>
                  </div>
                  <div className="bg-slate-800/30 p-6 md:p-8 rounded-xl border border-slate-700/50">
                    <div className="prose prose-invert max-w-none">
                      {project.longDescription?.split('\n\n').map((paragraph: string, index: number) => (
                        <p key={index} className="text-slate-300 leading-relaxed text-base md:text-lg mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      )) || (
                        <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Zap size={20} className="text-emerald-400" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Key Features
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {project.features.map((feature: string, index: number) => (
                        <div key={index} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-3 flex-shrink-0"></div>
                            <p className="text-slate-300 leading-relaxed">{feature}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges & Learnings */}
                {(project.challenges || project.learnings) && (
                  <div className="space-y-8">
                    {project.challenges && project.challenges.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Target size={20} className="text-orange-400" />
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            Challenges
                          </h2>
                        </div>
                        <div className="space-y-4">
                          {project.challenges.map((challenge: string, index: number) => (
                            <div key={index} className="bg-orange-500/5 p-6 rounded-xl border border-orange-500/20">
                              <p className="text-slate-300 leading-relaxed">{challenge}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.learnings && project.learnings.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Lightbulb size={20} className="text-green-400" />
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            Key Learnings
                          </h2>
                        </div>
                        <div className="space-y-4">
                          {project.learnings.map((learning: string, index: number) => (
                            <div key={index} className="bg-green-500/5 p-6 rounded-xl border border-green-500/20">
                              <p className="text-slate-300 leading-relaxed">{learning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Technologies */}
                <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Code size={18} className="text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-cyan-400">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-full text-sm border border-cyan-500/20 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Calendar size={18} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-400">Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="relative pl-6 border-l-2 border-purple-500/30">
                      <div className="absolute left-[-5px] top-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                      <p className="text-sm text-slate-400 mb-1">Started</p>
                      <p className="text-white font-semibold text-sm">{formatDate(project.startDate)}</p>
                    </div>
                    {project.endDate && (
                      <div className="relative pl-6 border-l-2 border-purple-500/30">
                        <div className="absolute left-[-5px] top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <p className="text-sm text-slate-400 mb-1">Completed</p>
                        <p className="text-white font-semibold text-sm">{formatDate(project.endDate)}</p>
                      </div>
                    )}
                    <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                      <p className="text-sm text-slate-400 mb-1">Total Duration</p>
                      <p className="text-white font-bold text-lg">{calculateDuration()}</p>
                    </div>
                  </div>
                </div>

                {/* Team */}
                {project.team && project.team.length > 0 && (
                  <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Users size={18} className="text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold text-indigo-400">Team</h3>
                    </div>
                    <div className="space-y-2">
                      {project.team.map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-300 font-medium text-sm">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Back to Projects */}
        <section className="px-4 py-8 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto text-center">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-xl hover:bg-cyan-600/30 hover:border-cyan-400/50 transition-colors"
            >
              <div className="p-1 bg-cyan-500/20 rounded-lg">
                <ArrowLeft size={16} />
              </div>
              <span className="font-semibold">Explore More Projects</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return getCustomProjects().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.name} - Project Details`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      images: [project.image],
    },
  };
}