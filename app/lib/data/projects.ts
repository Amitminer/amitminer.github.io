/**
 * Centralized Projects Data
 * 
 * This file contains all project information used throughout the application.
 */

import amitminerPortfolio from './projects/amitminer-portfolio.json';
import compressorx from './projects/compressorx.json';
import encryptx from './projects/encryptx.json';
import docsx from './projects/docsx.json';

export interface CustomProject {
  name: string;                    // Display name
  description: string;             // Short description
  slug: string;                    // Unique, URL-friendly identifier for the project (used in routing, e.g. "compressorx")
  longDescription?: string;        // Detailed description for project pages
  image: string;                   // Project preview image path
  technologies: string[];          // Array of technologies used
  features?: string[];             // Key features of the project
  challenges?: string[];           // Challenges faced during development
  learnings?: string[];            // Key learnings from the project
  featured: boolean;               // Whether to show in featured section
  github?: string;                 // GitHub repository URL
  demo?: string;                   // Live demo URL
  status: 'completed' | 'in-progress' | 'archived';
  startDate: string;               // Project start date (YYYY-MM-DD)
  endDate?: string;                // Project end date (YYYY-MM-DD)
  team?: string[];                 // Team members/roles
}

export const CUSTOM_PROJECTS: CustomProject[] = [
  amitminerPortfolio as CustomProject,
  compressorx as CustomProject,
  encryptx as CustomProject,
  docsx as CustomProject
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