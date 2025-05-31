"use client"

import type React from "react"

import { BackendURL, GithubUsername } from "@/app/utils/Links"
import { useEffect, useState, useRef } from "react"
import { SiRust, SiPython, SiPhp, SiHtml5, SiCplusplus, SiTypescript, SiGnubash, SiJavascript } from "react-icons/si"
import type { Skill, CachedSkillData } from "@/app/lib/types"

const skillMeta: Record<string, { color: string; icon: React.ReactElement }> = {
  "C++": { color: "from-cyan-400 to-blue-500", icon: <SiCplusplus className="text-cyan-400" /> },
  Rust: { color: "from-orange-500 to-yellow-500", icon: <SiRust className="text-orange-500" /> },
  Python: { color: "from-green-400 to-teal-500", icon: <SiPython className="text-green-400" /> },
  PHP: { color: "from-indigo-400 to-purple-500", icon: <SiPhp className="text-indigo-400" /> },
  TypeScript: { color: "from-blue-400 to-indigo-500", icon: <SiTypescript className="text-blue-400" /> },
  JavaScript: { color: "from-yellow-400 to-orange-500", icon: <SiJavascript className="text-yellow-400" /> },
  Shell: { color: "from-gray-400 to-gray-600", icon: <SiGnubash className="text-gray-400" /> },
  HTML: { color: "from-red-400 to-orange-500", icon: <SiHtml5 className="text-red-400" /> },
}

// Custom hook for animated counter
const useAnimatedCounter = (end: number, duration = 2000, delay = 0) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    const timer = setTimeout(() => {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeOutQuart * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [end, duration, delay, hasStarted])

  return { count, startAnimation: () => setHasStarted(true) }
}

// Individual skill component with animations
const SkillItem = ({
  skill,
  index,
  onAnimationStart,
}: {
  skill: Skill
  index: number
  onAnimationStart: () => void
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)
  const { count, startAnimation } = useAnimatedCounter(skill.percentage, 1500, index * 200)
  const skillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          onAnimationStart()

          // Start counter animation
          setTimeout(() => {
            startAnimation()
          }, index * 200)

          // Start progress bar animation
          setTimeout(
            () => {
              setProgressWidth(skill.percentage)
            },
            index * 200 + 300,
          )
        }
      },
      { threshold: 0.3 },
    )

    if (skillRef.current) {
      observer.observe(skillRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible, skill.percentage, index, startAnimation, onAnimationStart])

  return (
    <div
      ref={skillRef}
      className={`mb-8 transform transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3 text-lg font-medium">
          <div
            className={`transform transition-all duration-500 ${
              isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
            style={{ transitionDelay: `${index * 200 + 200}ms` }}
          >
            {skill.icon}
          </div>
          <span
            className={`transition-all duration-500 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 200 + 300}ms` }}
          >
            {skill.name}
          </span>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-medium tabular-nums transition-all duration-500 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 200 + 400}ms` }}
          >
            <span className="inline-block min-w-[3ch]">{count}</span>%
          </span>
        </div>
      </div>

      <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-20 rounded-full transition-opacity duration-1000`}
          style={{ transitionDelay: `${index * 200 + 500}ms` }}
        />

        {/* Main progress bar */}
        <div
          role="progressbar"
          aria-valuenow={skill.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${skill.name} skill level: ${skill.percentage}%`}
          className={`relative h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-1000 ease-out shadow-lg`}
          style={{
            width: `${progressWidth}%`,
            transitionDelay: `${index * 200 + 600}ms`,
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer" />
        </div>

        {/* Pulse effect for high percentages */}
        {skill.percentage > 70 && (
          <div
            className={`absolute right-0 top-0 h-full w-2 bg-white/50 rounded-r-full transition-opacity duration-1000 ${
              progressWidth > 0 ? "animate-pulse" : "opacity-0"
            }`}
            style={{ transitionDelay: `${index * 200 + 1200}ms` }}
          />
        )}
      </div>
    </div>
  )
}

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [animationsStarted, setAnimationsStarted] = useState(false)

  useEffect(() => {
    // Check if data is already cached
    const cachedData = sessionStorage.getItem("github_skills_data")
    const cacheTimestamp = sessionStorage.getItem("github_skills_timestamp")
    const cacheExpiry = 1000 * 60 * 60 * 24 * 14 // 14 days cache


    if (cachedData && cacheTimestamp) {
      const isExpired = Date.now() - Number.parseInt(cacheTimestamp) > cacheExpiry
      if (!isExpired) {
        try {
          const cachedSkills: CachedSkillData[] = JSON.parse(cachedData)
          const skillsWithIcons: Skill[] = cachedSkills.map((skill) => ({
            ...skill,
            color: skillMeta[skill.name]?.color || "from-gray-400 to-gray-600",
            icon: skillMeta[skill.name]?.icon || <div className="w-4 h-4 bg-gray-400 rounded" />,
          }))
          setSkills(skillsWithIcons)
          setLoading(false)
          return
        } catch (e) {
          console.warn("Failed to parse cached data, fetching fresh data")
          sessionStorage.removeItem("github_skills_data")
          sessionStorage.removeItem("github_skills_timestamp")
        }
      }
    }

    /**
     * Fetches GitHub repositories for the configured user, aggregates language usage statistics, and updates the skills state with the top six languages by byte count.
     *
     * Filters repositories to include only recent, non-fork, non-empty repos updated within the last year. Fetches language data for these repos in batches, aggregates byte counts per language, and calculates each language's percentage share among the top six. Updates the loading progress during the process and caches the resulting skill data in session storage for future use.
     *
     * @throws {Error} If fetching repositories fails, the data structure is invalid, or no language data is found.
     */
    async function fetchAndCalculateSkills() {
      try {
        setError(null)
        const Username = GithubUsername

        console.log("Fetching repos for user:", Username)
        // console.log("Backend URL:", BackendURL)

        const res = await fetch(`${BackendURL}?endpoint=/users/${Username}/repos`)
        if (!res.ok) {
          throw new Error(`Failed to fetch repos: ${res.status} ${res.statusText}`)
        }

        const repos = await res.json()
        console.log("Fetched repos:", repos)

        if (!Array.isArray(repos)) {
          throw new Error("Invalid repos data structure")
        }

        const langBytes: Record<string, number> = {}

        // Filter repos: only recent, non-fork repos with significant activity
        const filteredRepos = repos
          .filter(
            (repo) =>
              repo.full_name &&
              !repo.fork &&
              repo.size > 0 && // Has some content
              repo.pushed_at &&
              new Date(repo.pushed_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Updated in last year
          )
          .sort((a, b) => b.size - a.size) // Sort by size (bigger repos first)
          .slice(0, 20) // Only top 20 repos

        console.log(`Processing ${filteredRepos.length} repos out of ${repos.length} total`)

        // Fetch languages for repos in parallel with limited concurrency
        const batchSize = 5 // Process 5 repos at a time
        for (let i = 0; i < filteredRepos.length; i += batchSize) {
          const batch = filteredRepos.slice(i, i + batchSize)

          const languagePromises = batch.map(async (repo) => {
            try {
              const langRes = await fetch(`${BackendURL}?endpoint=/repos/${repo.full_name}/languages`)
              if (!langRes.ok) return null

              const langs = await langRes.json()
              return { repoName: repo.full_name, langs }
            } catch (error) {
              console.warn(`Error fetching languages for ${repo.full_name}:`, error)
              return null
            }
          })

          // Wait for this batch to complete
          const results = await Promise.all(languagePromises)

          // Update progress with animation
          const newProgress = Math.round(((i + batchSize) / filteredRepos.length) * 100)
          setLoadingProgress(newProgress)

          // Process results
          results.forEach((result) => {
            if (result && typeof result.langs === "object" && result.langs !== null) {
              for (const [lang, bytes] of Object.entries(result.langs)) {
                if (typeof bytes === "number" && bytes > 0) {
                  langBytes[lang] = (langBytes[lang] || 0) + bytes
                }
              }
            }
          })
        }

        console.log("Final language bytes:", langBytes)

        // Calculate total bytes and get top languages only
        const totalBytes = Object.values(langBytes).reduce((sum, bytes) => sum + bytes, 0)
        console.log("Total bytes:", totalBytes)

        if (totalBytes === 0) {
          throw new Error("No language data found in any repositories")
        }

        // Get top 6 languages by bytes, then calculate percentages
        const sortedLanguages = Object.entries(langBytes)
          .sort(([, a], [, b]) => b - a) // Sort by bytes descending
          .slice(0, 6) // Take only top 6

        // Calculate total for top 6 languages for accurate percentages
        const topLanguagesTotal = sortedLanguages.reduce((sum, [, bytes]) => sum + bytes, 0)

        const calculatedSkills: Skill[] = sortedLanguages.map(([lang, bytes]) => ({
          name: lang,
          bytes,
          percentage: Math.round((bytes / topLanguagesTotal) * 100),
          color: skillMeta[lang]?.color || "from-gray-400 to-gray-600",
          icon: skillMeta[lang]?.icon || <div className="w-4 h-4 bg-gray-400 rounded" />,
        }))

        console.log("Calculated skills:", calculatedSkills)
        setSkills(calculatedSkills)

        // Cache only the serializable data (without React components)
        const cacheableData: CachedSkillData[] = calculatedSkills.map((skill) => ({
          name: skill.name,
          percentage: skill.percentage,
          bytes: skill.bytes,
        }))
        sessionStorage.setItem("github_skills_data", JSON.stringify(cacheableData))
        sessionStorage.setItem("github_skills_timestamp", Date.now().toString())
      } catch (error) {
        console.error("Error fetching skills:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAndCalculateSkills()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-18">
        <div className="text-lg mb-4 animate-pulse">Loading skills...</div>
        {loadingProgress > 0 && (
          <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-pink-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        )}
        {loadingProgress > 0 && <div className="text-sm text-gray-500 mt-2 tabular-nums">{loadingProgress}%</div>}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-18">
        <div className="text-center animate-fadeIn">
          <div className="text-lg text-red-500 mb-2">Error loading skills</div>
          <div className="text-sm text-gray-500">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="flex items-center justify-center py-18">
        <div className="text-center animate-fadeIn">
          <div className="text-lg text-gray-500 mb-2">No skills data available</div>
          <div className="text-sm text-gray-400">
            This could mean the repositories don't contain enough code data or the API is not returning language
            information.
          </div>
        </div>
      </div>
    )
  }

  return (
    <section id="skills" className="py-18 w-full">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text text-center animate-fadeInUp">Skills</h2>
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full mb-12 animate-expandWidth" />

        <div className="max-w-3xl mx-auto">
          {skills.map((skill, index) => (
            <SkillItem
              key={skill.name}
              skill={skill}
              index={index}
              onAnimationStart={() => setAnimationsStarted(true)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
