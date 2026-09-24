"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";

export function ProjectList({
  projects,
  initialLimit = 3,
}: {
  projects: Project[];
  initialLimit?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = projects.length > initialLimit;
  const visibleProjects =
    showAll || !hasMore ? projects : projects.slice(0, initialLimit);

  return (
    <div>
      <ul className="m-0 flex list-none flex-col p-0">
        {visibleProjects.map((project) => (
          <li
            key={project.name}
            className="border-b border-line first:border-t"
          >
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group -mx-3 grid grid-cols-1 gap-1.5 rounded-lg px-3 py-4 transition-all duration-200 hover:bg-line/20 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] sm:items-baseline sm:gap-8 sm:py-5"
            >
              <span className="flex items-center gap-2 text-base font-medium text-ink transition-colors group-hover:text-white sm:text-lg md:text-[1.15rem]">
                <span className="underline decoration-line underline-offset-4 group-hover:decoration-ink">
                  {project.name}
                </span>
                {project.isPrivate ? (
                  <span className="rounded border border-line px-1.5 py-0.5 text-[11px] font-normal tracking-wide text-muted no-underline">
                    private
                  </span>
                ) : (
                  <span className="text-sm text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink">
                    ↗
                  </span>
                )}
              </span>
              <span className="text-sm leading-relaxed text-muted transition-colors group-hover:text-ink/85 sm:text-base">
                {project.description}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="pt-4 sm:pt-5">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted underline decoration-line underline-offset-4 transition-all duration-150 hover:text-ink hover:decoration-ink active:scale-95 sm:text-sm"
          >
            {showAll
              ? "Show less ↑"
              : `Show ${projects.length - initialLimit} more projects ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
