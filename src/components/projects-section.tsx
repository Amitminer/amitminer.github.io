"use client";

import { useEffect, useState } from "react";
import { GithubUsername } from "@/lib/config";
import { projects as featuredProjects } from "@/lib/projects";
import type { GitHubApiRepo, Project } from "@/lib/types";
import { ProjectList } from "./project-list";

const GITHUB_ACCOUNTS = [GithubUsername, "Amitminer"] as const;
const CACHE_KEY = "amitxd_recent_repos_cache_v1";
const CACHE_TTL_MS = 30 * 60 * 1000;

let memoryCachedProjects: Project[] | null = null;

function getCachedProjects(): Project[] | null {
  if (memoryCachedProjects && memoryCachedProjects.length > 0) {
    return memoryCachedProjects;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (
      Date.now() - timestamp < CACHE_TTL_MS &&
      Array.isArray(data) &&
      data.length > 0
    ) {
      memoryCachedProjects = data;
      return data;
    }
  } catch {}
  return null;
}

function setCachedProjects(data: Project[]) {
  memoryCachedProjects = data;
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ timestamp: Date.now(), data });
    sessionStorage.setItem(CACHE_KEY, payload);
    localStorage.setItem(CACHE_KEY, payload);
  } catch {}
}

export function ProjectsSection() {
  const [tab, setTab] = useState<"featured" | "recent">("featured");
  const [recentProjects, setRecentProjects] = useState<Project[]>(() => {
    return getCachedProjects() || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "recent") return;

    const cached = getCachedProjects();
    if (cached && recentProjects.length === 0) {
      setRecentProjects(cached);
      return;
    }

    if (recentProjects.length === 0 && !loading) {
      setLoading(true);
      setError(null);

      Promise.allSettled(
        GITHUB_ACCOUNTS.map((user) =>
          fetch(
            `https://api.github.com/users/${user}/repos?sort=pushed&per_page=10`,
          ).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${user}`);
            return res.json() as Promise<GitHubApiRepo[]>;
          }),
        ),
      )
        .then((results) => {
          const combinedRepos: GitHubApiRepo[] = [];

          for (const result of results) {
            if (result.status === "fulfilled" && Array.isArray(result.value)) {
              combinedRepos.push(...result.value);
            }
          }

          if (combinedRepos.length === 0) {
            throw new Error("No repositories loaded");
          }

          const filtered = combinedRepos
            .filter(
              (repo) =>
                !repo.fork &&
                !GITHUB_ACCOUNTS.some(
                  (acc) => acc.toLowerCase() === repo.name.toLowerCase(),
                ),
            )
            .sort((a, b) => {
              const timeA = new Date(
                a.pushed_at || a.updated_at || 0,
              ).getTime();
              const timeB = new Date(
                b.pushed_at || b.updated_at || 0,
              ).getTime();
              return timeB - timeA;
            })
            .filter(
              (repo, idx, arr) =>
                arr.findIndex(
                  (r) => r.name.toLowerCase() === repo.name.toLowerCase(),
                ) === idx,
            )
            .slice(0, 6)
            .map((repo) => ({
              name: repo.name,
              description:
                repo.description || "Open-source repository on GitHub",
              href: repo.html_url,
            }));

          if (filtered.length === 0) {
            throw new Error("No recent public repositories found");
          }

          setCachedProjects(filtered);
          setRecentProjects(filtered);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to load recent repos from GitHub.");
          setLoading(false);
        });
    }
  }, [tab, recentProjects.length, loading]);

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="projects-title"
          className="text-sm font-medium tracking-tight text-muted sm:text-base md:text-lg"
        >
          Projects
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setTab("featured")}
            className={`cursor-pointer rounded-md px-3 py-1.5 transition-all duration-150 active:scale-95 ${
              tab === "featured"
                ? "bg-ink font-medium text-bg shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Featured
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("recent");
              const cached = getCachedProjects();
              if (cached && recentProjects.length === 0) {
                setRecentProjects(cached);
              }
            }}
            className={`cursor-pointer rounded-md px-3 py-1.5 transition-all duration-150 active:scale-95 ${
              tab === "recent"
                ? "bg-ink font-medium text-bg shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {tab === "featured" && <ProjectList projects={featuredProjects} />}

      {tab === "recent" && (
        <>
          {loading && (
            <div className="flex flex-col border-t border-line">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 py-4 border-b border-line animate-pulse sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] sm:gap-8 sm:py-5"
                >
                  <div className="h-5 w-32 rounded bg-line/60" />
                  <div className="h-5 w-full max-w-md rounded bg-line/40" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="border-y border-line py-8 text-center text-sm text-muted">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setRecentProjects([]);
                  setLoading(false);
                }}
                className="mt-2 text-ink underline decoration-line underline-offset-2 hover:opacity-75 cursor-pointer active:scale-95 transition-transform"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && recentProjects.length > 0 && (
            <ProjectList projects={recentProjects} />
          )}
        </>
      )}
    </div>
  );
}
