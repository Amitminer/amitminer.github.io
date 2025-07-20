/**
 * Projects Data Module
 * 
 * This module provides all project metadata and utility functions for use across the app.
 * Update this file to add, remove, or modify project information.
 */

import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  slug: z.string(),
  longDescription: z.string().optional(),
  image: z.string(),
  technologies: z.array(z.string()),
  features: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  learnings: z.array(z.string()).optional(),
  featured: z.boolean(),
  github: z.string().optional(),
  demo: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'archived']),
  startDate: z.string(),
  endDate: z.string().optional(),
  team: z.array(z.string()).optional(),
});

export type CustomProject = z.infer<typeof ProjectSchema>;

import amitminerPortfolio from './projects/amitminer-portfolio.json';
import compressorx from './projects/compressorx.json';
import encryptx from './projects/encryptx.json';
import docsx from './projects/docsx.json';

export const CUSTOM_PROJECTS: CustomProject[] = [
  ProjectSchema.parse(amitminerPortfolio),
  ProjectSchema.parse(compressorx),
  ProjectSchema.parse(encryptx),
  ProjectSchema.parse(docsx),
];

// Utility functions for working with projects
export const getProjectBySlug = (slug: string): CustomProject | undefined => {
  return CUSTOM_PROJECTS.find(project => project.slug === slug);
};

export const getFeaturedProjects = (): CustomProject[] => {
  return CUSTOM_PROJECTS.filter(project => project.featured);
};

export const getProjectsByStatus = (status: CustomProject['status']): CustomProject[] => {
  return CUSTOM_PROJECTS.filter(project => project.status === status);
};

export const getProjectsByTechnology = (technology: string): CustomProject[] => {
  return CUSTOM_PROJECTS.filter(project =>
    project.technologies.some(tech =>
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  );
}; 