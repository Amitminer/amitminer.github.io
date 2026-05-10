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
import { GithubLink, LinkedinLink } from "@/app/utils/links"
import type { ThrottleOptions } from "@/app/lib/types"
import Image from "next/image"

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

// Constants
const SCROLL_THROTTLE_DELAY = 16 // ~60fps
const MOUSE_MOVE_THROTTLE_DELAY = 100
const ARROW_HIDE_DELAY = 2000
const SCROLL_THRESHOLD = 50
const HERO_SECTION_THRESHOLD = 0.7

// Typewriter constants
const ROLES = [
	"Self-taught developer building cool stuff",
	"Focused on backend and performance",
	"Rust enthusiast and Linux user",
	"Obsessed with optimization and clean code",
]
const TYPEWRITER_SPEED = 28  // ms per character (typing)
const ERASE_SPEED = 15       // ms per character (erasing)
const HOLD_DELAY = 1600      // ms to hold full string before erasing
const PAUSE_DELAY = 250      // ms pause before typing next string

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
		const currentRole = ROLES[roleIndex]

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
					setRoleIndex((prev) => (prev + 1) % ROLES.length)
				}, PAUSE_DELAY)
				return () => clearTimeout(timeout)
			}
		}
	}, [displayedText, isErasing, roleIndex])

	// Scroll handler with throttling
	const handleScroll = useCallback(() => {
		const throttledScroll = throttle(
			() => {
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
			},
			{ delay: SCROLL_THROTTLE_DELAY },
		)
		throttledScroll()
	}, [showScrollArrow])

	// Mouse move handler for showing arrow
	const handleMouseMove = useCallback(() => {
		const throttledMouseMove = throttle(
			() => {
				const scrollY = window.scrollY
				const heroHeight = heroRef.current?.offsetHeight ?? 0
				const isInHeroSection = scrollY < heroHeight * HERO_SECTION_THRESHOLD
				const hasScrolled = scrollY > SCROLL_THRESHOLD

				if (isInHeroSection && hasScrolled && !showScrollArrow) {
					setShowScrollArrow(true)
				}
			},
			{ delay: MOUSE_MOVE_THROTTLE_DELAY },
		)
		throttledMouseMove()
	}, [showScrollArrow])

	// Setup scroll listeners
	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true })
		window.addEventListener("mousemove", handleMouseMove, { passive: true })

		handleScroll()

		return () => {
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("mousemove", handleMouseMove)
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
						<div className="absolute inset-0 bg-linear-to-r from-[#FF1493]/10 to-[#00FFFF]/10 rounded-full blur-md animate-pulse" />
					</div>

					{/* Name */}
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text">AmitxD</h1>

					{/* Typewriter Role Description */}
					<p
						className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 min-h-6 sm:min-h-7 flex items-center justify-center px-2 sm:px-0 font-medium"
						style={{
							background: "linear-gradient(90deg, #FFFFFF, #FF1493, #FF0000)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						<span>{displayedText}</span>
						<span
							className="ml-0.5 inline-block w-0.5 h-[1em] align-middle animate-pulse"
							style={{ background: "#FF1493", WebkitTextFillColor: "initial" }}
							aria-hidden="true"
						/>
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 mt-4">
						{/* About Me Button */}
						<Button
							className="bg-linear-to-r from-[#FF1493]/70 to-[#00FFFF]/70 hover:from-[#FF1493]/60 hover:to-[#00FFFF]/60 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#FF1493]/20 hover:shadow-[#00FFFF]/30 backdrop-blur-[2px]"
							onClick={scrollToAbout}
							style={{ filter: "saturate(0.9) brightness(0.95)" }}
						>
							About Me
						</Button>

						{/* Contact Button */}
						<Button
							variant="outline"
							className="border-[#00FFFF]/30 text-white hover:bg-[#00FFFF]/10 hover:border-[#00FFFF] shadow-lg shadow-[#00FFFF]/10 hover:shadow-[#00FFFF]/20 transition-all duration-300"
							asChild
						>
							<a href="#contact">Contact Me</a>
						</Button>

						{/* Profile Options Button */}
						<div className="relative w-full sm:w-auto" ref={profileOptionsRef}>
							<Button
								variant="outline"
								className="w-full sm:w-auto border-[#FF1493]/30 text-white hover:bg-[#FF1493]/10 hover:border-[#FF1493] shadow-lg shadow-[#FF1493]/10 hover:shadow-[#FF1493]/20 transition-all duration-300 group"
								onClick={() => setShowProfileOptions(!showProfileOptions)}
							>
								<div className="flex items-center gap-2">
									<User className="w-4 h-4" />
									Profiles
									<ChevronDown
										size={14}
										className={`transition-transform duration-300 ${showProfileOptions ? "rotate-180" : ""}`}
									/>
								</div>
							</Button>

							{/* Profile Options Dropdown */}
							{showProfileOptions && (
								<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-44 sm:w-52 bg-[#0C0715]/95 backdrop-blur-md border border-[#FF1493]/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="p-1 flex flex-col gap-0.5">
										<a
											href={GithubLink}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FF1493]/10 transition-colors group"
											onClick={() => setShowProfileOptions(false)}
										>
											<GitHubIcon className="w-4 h-4 text-[#FF1493]" />
											<div className="flex flex-col items-start leading-tight">
												<span className="text-xs font-semibold text-white">GitHub</span>
												<span className="text-[9px] text-gray-400">Contributions</span>
											</div>
											<ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
										</a>
										<a
											href={LinkedinLink}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#00FFFF]/10 transition-colors group"
											onClick={() => setShowProfileOptions(false)}
										>
											<LinkedinIcon className="w-4 h-4 text-[#00FFFF]" />
											<div className="flex flex-col items-start leading-tight">
												<span className="text-xs font-semibold text-white">LinkedIn</span>
												<span className="text-[9px] text-gray-400">Professional</span>
											</div>
											<ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
