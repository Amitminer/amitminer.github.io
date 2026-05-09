/**
 * Projects Data Module
 * 
 * This module provides project metadata and utility functions for use across the app.
 * Update projects.json to add, remove, or modify project information.
 */

import { z } from 'zod';
import projectsData from './projects.json';

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  slug: z.string(),
  image: z.string(),
  technologies: z.array(z.string()),
  featured: z.boolean(),
  github: z.string().optional(),
  demo: z.string().optional(),
});

export type CustomProject = z.infer<typeof ProjectSchema>;

// In-memory cache for parsed projects
let cachedProjects: CustomProject[] | null = null;

export const getCustomProjects = (): CustomProject[] => {
  if (cachedProjects) return cachedProjects;
  cachedProjects = projectsData.map(project => ProjectSchema.parse(project));
  return cachedProjects;
};
