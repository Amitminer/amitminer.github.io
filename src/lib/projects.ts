import { GithubUsername } from "@/lib/config";
import type { Project } from "@/lib/types";

export type { Project };

export const projects: Project[] = [
  {
    name: "HK-OS",
    description:
      "Modular 64-bit x86_64 operating system kernel in Rust (no_std) and C",
    href: `https://github.com/${GithubUsername}/hk_os`,
    isPrivate: true,
  },
  {
    name: "OmniBox",
    description:
      "AI-powered compilation platform and sandbox orchestrator in Rust",
    href: `https://github.com/${GithubUsername}/omni-box`,
    isPrivate: true,
  },
  {
    name: "CompressCLI",
    description:
      "High-performance FFmpeg video and image compression CLI in Rust",
    href: `https://github.com/${GithubUsername}/compresscli`,
  },
  {
    name: "Quicky Notes",
    description:
      "Floating glassmorphism note and scratchpad widget for Hyprland in Rust",
    href: `https://github.com/${GithubUsername}/quicky_notes`,
  },
  {
    name: "GeoGusserX",
    description: "Geography exploration game built with TypeScript",
    href: "https://github.com/Amitminer/GeoGusserX",
  },
];
