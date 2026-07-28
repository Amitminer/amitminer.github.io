/**
 * Hero Component
 *
 * Features:
 * - Design with smooth animations
 * - Performance scroll and mouse move handlers
 * - Dynamic scroll indicator with auto-hide
 * - Profile image with loading states
 * - Gradient effects and animations
 * - Action buttons with hover effects
 * - Typewriter/carousel effect for role description
 */
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/app/components/ui/button"
import { ArrowDownCircle, ExternalLink, User, ChevronDown } from "lucide-react"
import ProfileImage from "@/app/assets/pfp.webp"
import BackgroundAnimation from "./BackgroundAnimation"
import { GitHubIcon, LinkedinIcon } from "../icons/index"
import { Name, HeroRoles, GithubLink, LinkedinLink } from "@/app/utils/config"
import type { ThrottleOptions } from "@/app/lib/types"
import Image from "next/image"
import Link from "next/link"

// Throttle utility
const throttle = <T extends (...args: unknown[]) => unknown>(
	func: T,
	{ delay, leading = true, trailing = true }: ThrottleOptions,
): ((...args: Parameters<T>) => void) => {
	let timeoutId: NodeJS.Timeout | null = null
	let lastExecTime = 0

	return (...args: Parameters<T>) => {
		const currentTime = Date.now()
		const remainingTime = delay - (currentTime - lastExecTime)

		if (remainingTime <= 0 && leading) {
			func(...args)
			lastExecTime = currentTime
		} else if (trailing) {
			if (timeoutId) clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				func(...args)
				lastExecTime = Date.now()
			}, remainingTime)
		}
	}
}

// Constants for performance and responsiveness
const SCROLL_THROTTLE_DELAY = 16 // Throttle scroll events to ~60fps (16ms)
const MOUSE_MOVE_THROTTLE_DELAY = 100 // Throttle mouse move events to 100ms
const ARROW_HIDE_DELAY = 2000 // Auto-hide scroll arrow after 2 seconds of inactivity
const SCROLL_THRESHOLD = 50 // Minimum scroll distance to show scroll arrow
const HERO_SECTION_THRESHOLD = 0.7 // Threshold for considering user still in the hero section

// Constants for typewriter effect
const TYPEWRITER_SPEED = 28 // Delay in ms for typing each character
const ERASE_SPEED = 15 // Delay in ms for erasing each character
const HOLD_DELAY = 1600 // Delay in ms to hold the full string before starting to erase
const PAUSE_DELAY = 250 // Delay in ms between erasing and typing the next string

const Hero = () => {
	const [showScrollArrow, setShowScrollArrow] = useState(false)
	const [showProfileOptions, setShowProfileOptions] = useState(false)

	// Typewriter state
	const [displayedText, setDisplayedText] = useState("")
	const [roleIndex, setRoleIndex] = useState(0)
	const [isErasing, setIsErasing] = useState(false)

	const heroRef = useRef<HTMLDivElement>(null)
	const arrowRef = useRef<HTMLButtonElement>(null)
	const hideArrowTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const profileOptionsRef = useRef<HTMLDivElement>(null)

	// --- Typewriter effect ---
	useEffect(() => {
		const currentRole = HeroRoles[roleIndex]

		if (!isErasing) {
			// Typing phase
			if (displayedText.length < currentRole.length) {
				const timeout = setTimeout(() => {
					setDisplayedText(currentRole.slice(0, displayedText.length + 1))
				}, TYPEWRITER_SPEED)
				return () => clearTimeout(timeout)
			} else {
				// Hold full string, then start erasing
				const timeout = setTimeout(() => {
					setIsErasing(true)
				}, HOLD_DELAY)
				return () => clearTimeout(timeout)
			}
		} else {
			// Erasing phase
			if (displayedText.length > 0) {
				const timeout = setTimeout(() => {
					setDisplayedText(displayedText.slice(0, -1))
				}, ERASE_SPEED)
				return () => clearTimeout(timeout)
			} else {
				// Move to next role after short pause
				const timeout = setTimeout(() => {
					setIsErasing(false)
					setRoleIndex((prev) => (prev + 1) % HeroRoles.length)
				}, PAUSE_DELAY)
				return () => clearTimeout(timeout)
			}
		}
	}, [displayedText, isErasing, roleIndex])

	// Scroll handler
	const handleScroll = useCallback(() => {
		const scrollY = window.scrollY
		const heroHeight = heroRef.current?.offsetHeight ?? 0
		const windowHeight = window.innerHeight
		const documentHeight = document.documentElement.scrollHeight

		const isInHeroSection = scrollY < heroHeight * HERO_SECTION_THRESHOLD
		const isNotAtBottom = scrollY + windowHeight < documentHeight - 100
		const hasScrolled = scrollY > SCROLL_THRESHOLD

		const shouldShow = hasScrolled && isInHeroSection && isNotAtBottom

		if (shouldShow !== showScrollArrow) {
			setShowScrollArrow(shouldShow)
		}

		// Auto-hide after delay
		if (hideArrowTimeoutRef.current) {
			clearTimeout(hideArrowTimeoutRef.current)
		}

		if (shouldShow) {
			hideArrowTimeoutRef.current = setTimeout(() => {
				setShowScrollArrow(false)
			}, ARROW_HIDE_DELAY)
		}
	}, [showScrollArrow])

	// Mouse move handler for showing arrow
	const handleMouseMove = useCallback(() => {
		const scrollY = window.scrollY
		const heroHeight = heroRef.current?.offsetHeight ?? 0
		const isInHeroSection = scrollY < heroHeight * HERO_SECTION_THRESHOLD
		const hasScrolled = scrollY > SCROLL_THRESHOLD

		if (isInHeroSection && hasScrolled && !showScrollArrow) {
			setShowScrollArrow(true)
		}
	}, [showScrollArrow])

	// Setup scroll listeners — throttled wrappers are created once per effect run,
	useEffect(() => {
		const throttledScroll = throttle(handleScroll, { delay: SCROLL_THROTTLE_DELAY })
		const throttledMouseMove = throttle(handleMouseMove, { delay: MOUSE_MOVE_THROTTLE_DELAY })

		window.addEventListener("scroll", throttledScroll, { passive: true })
		window.addEventListener("mousemove", throttledMouseMove, { passive: true })

		throttledScroll()

		return () => {
			window.removeEventListener("scroll", throttledScroll)
			window.removeEventListener("mousemove", throttledMouseMove)
			if (hideArrowTimeoutRef.current) {
				clearTimeout(hideArrowTimeoutRef.current)
			}
		}
	}, [handleScroll, handleMouseMove])

	// Handle click outside for profile options
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (profileOptionsRef.current && !profileOptionsRef.current.contains(event.target as Node)) {
				setShowProfileOptions(false)
			}
		}

		if (showProfileOptions) {
			document.addEventListener("mousedown", handleClickOutside)
			document.addEventListener("touchstart", handleClickOutside)
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
			document.removeEventListener("touchstart", handleClickOutside)
		}
	}, [showProfileOptions])

	// Scroll to about section
	const scrollToAbout = useCallback(() => {
		const aboutSection = document.getElementById("about")
		if (aboutSection) {
			aboutSection.scrollIntoView({ behavior: "smooth" })
		} else {
			window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
		}
	}, [])

	return (
		<>
			<BackgroundAnimation />
			<section
				id="hero"
				ref={heroRef}
				className="relative min-h-screen w-full flex items-center justify-center py-16 sm:py-20 md:py-32"
			>
				<div className="container max-w-3xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
					{/* Profile Image Container */}
					<div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6">
						{/* Animated border ring */}
						<div
							className="absolute inset-0 rounded-full p-0.5 bg-linear-to-r from-[#FF1493] via-[#00FFFF] to-[#FF1493]"
							style={{
								animation: "spin 3s linear infinite",
								willChange: "transform",
							}}
						>
							<div className="w-full h-full rounded-full bg-black" />
						</div>

						{/* Image container with immediate visibility */}
						<div className="absolute inset-1 rounded-full overflow-hidden shadow-2xl shadow-[#00FFFF]/30">
							<Image
								src={ProfileImage}
								alt="AmitxD Profile"
								fill
								sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 12rem"
								className="object-cover"
								priority
								placeholder="blur"
								blurDataURL="data:image/jpeg;base64,/2"
								loading="eager"
								decoding="async"
								quality={80}
							/>
						</div>

						{/* Subtle glow effect */}
						<div className="absolute inset-0 bg-linear-to-r from-sky-500/10 to-cyan-400/10 rounded-full blur-md animate-pulse" />
					</div>

					{/* Name */}
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text">{Name}</h1>

					{/* Typewriter Role Description */}
					<p
						className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 min-h-6 sm:min-h-7 flex items-center justify-center px-2 sm:px-0 font-medium"
						style={{
							background: "linear-gradient(90deg, #FFFFFF, #38BDF8, #22D3EE)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						<span>{displayedText}</span>
						<span
							className="ml-0.5 inline-block w-0.5 h-[1em] align-middle animate-pulse"
							style={{ background: "#38BDF8", WebkitTextFillColor: "initial" }}
							aria-hidden="true"
						/>
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
						{/* About Me Button - Glassmorphism Primary CTA */}
						<Button
							size="lg"
							className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-400/90 via-cyan-400/90 to-blue-500/90 backdrop-blur-md text-slate-950 font-bold px-7 py-3.5 rounded-full hover:from-sky-300 hover:via-cyan-300 hover:to-blue-400 active:scale-[0.97] transition-all duration-300 border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"
							onClick={scrollToAbout}
						>
							<span className="tracking-tight font-bold">About Me</span>
							<span className="w-6 h-6 rounded-full bg-slate-950/20 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-y-0.5">
								<ChevronDown className="w-3.5 h-3.5 text-slate-950" />
							</span>
						</Button>

						{/* Contact Button - Emerald Glass CTA */}
						<Button
							variant="outline"
							size="lg"
							className="rounded-full border-emerald-400/40 bg-emerald-950/50 backdrop-blur-md text-emerald-300 hover:bg-emerald-900/70 hover:border-emerald-400/70 hover:text-emerald-100 active:scale-[0.97] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
							asChild
						>
							<Link href="/#contact">Contact Me</Link>
						</Button>

						{/* Profile Options Button - Amber Glass CTA */}
						<div className="relative w-full sm:w-auto" ref={profileOptionsRef}>
							<Button
								variant="outline"
								size="lg"
								className="w-full sm:w-auto rounded-full border-amber-400/40 bg-amber-950/50 backdrop-blur-md text-amber-300 hover:bg-amber-900/70 hover:border-amber-400/70 hover:text-amber-100 active:scale-[0.97] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group"
								onClick={() => setShowProfileOptions(!showProfileOptions)}
							>
								<div className="flex items-center gap-2.5">
									<User className="w-4 h-4 text-amber-400 group-hover:text-amber-200 transition-colors" />
									<span>Profiles</span>
									<span className="w-5 h-5 rounded-full bg-amber-400/15 flex items-center justify-center">
										<ChevronDown
											size={12}
											className={`transition-transform duration-300 ${showProfileOptions ? "rotate-180" : ""}`}
										/>
									</span>
								</div>
							</Button>

							{/* Profile Options Dropdown */}
							{showProfileOptions && (
								<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 bg-slate-950/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-1.5">
									<div className="flex flex-col gap-1">
										<a
											href={GithubLink}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-slate-800"
											onClick={() => setShowProfileOptions(false)}
										>
											<div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
												<GitHubIcon className="w-4 h-4 text-cyan-400" />
											</div>
											<div className="flex flex-col items-start leading-tight">
												<span className="text-xs font-semibold text-slate-100 group-hover:text-white">GitHub</span>
												<span className="text-[10px] text-slate-400">Contributions</span>
											</div>
											<ExternalLink size={12} className="ml-auto text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
										</a>
										<a
											href={LinkedinLink}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-slate-800"
											onClick={() => setShowProfileOptions(false)}
										>
											<div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
												<LinkedinIcon className="w-4 h-4 text-sky-400" />
											</div>
											<div className="flex flex-col items-start leading-tight">
												<span className="text-xs font-semibold text-slate-100 group-hover:text-white">LinkedIn</span>
												<span className="text-[10px] text-slate-400">Professional</span>
											</div>
											<ExternalLink size={12} className="ml-auto text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
										</a>
										</div>
								</div>
							)}
						</div>
					</div>

					{/* Scroll Indicator Arrow */}
					<button
						ref={arrowRef}
						onClick={scrollToAbout}
						aria-label="Scroll down to about section"
						className={`fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-[#00FFFF]/60 hover:text-[#00FFFF] transition-all duration-300 hover:scale-110 z-10 ${showScrollArrow ? "opacity-100 visible animate-bounce" : "opacity-0 invisible"
							}`}
					>
						<ArrowDownCircle size={28} />
					</button>
				</div>
			</section>
		</>
	)
}

export default Hero
