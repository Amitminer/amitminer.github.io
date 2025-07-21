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
 */
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/app/components/ui/button"
import { ArrowDownCircle, ExternalLink } from "lucide-react"
import ProfileImage from "@/app/assets/pfp.webp"
import BackgroundAnimation from "./BackgroundAnimation"
import { GitHubIcon } from "../icons/index"
import { GithubUsername } from "@/app/utils/Links"
import type { ThrottleOptions } from "@/app/lib/types"
import Image from "next/image"

// Throttle utility
const throttle = <T extends (...args: any[]) => any>(
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

const Hero = () => {
  const [showScrollArrow, setShowScrollArrow] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLButtonElement>(null)
  const hideArrowTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll handler with throttling
  const handleScroll = useCallback(() => {
    const throttledScroll = throttle(
      () => {
        const scrollY = window.scrollY
        const heroHeight = heroRef.current?.offsetHeight || 0
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
        const heroHeight = heroRef.current?.offsetHeight || 0
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
                // Preload the gradient to prevent flash
                willChange: "transform"
              }}
            >
              <div className="w-full h-full rounded-full bg-black"></div>
            </div>

            {/* Image container with immediate visibility */}
            <div className="absolute inset-1 rounded-full overflow-hidden shadow-2xl shadow-[#00FFFF]/30">
              <Image
                src={ProfileImage} //
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
            <div className="absolute inset-0 bg-linear-to-r from-[#FF1493]/10 to-[#00FFFF]/10 rounded-full blur-md animate-pulse"></div>
          </div>

          {/* Name and Title - Immediately visible */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 gradient-text">AmitxD</h1>
          <p className="text-lg sm:text-xl mb-8 text-[#00FFFF]">Self-taught Developer</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {/* About Me Button */}
            <Button
              className="bg-gradient-to-r from-[#FF1493]/70 to-[#00FFFF]/70 hover:from-[#FF1493]/60 hover:to-[#00FFFF]/60 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#FF1493]/20 hover:shadow-[#00FFFF]/30 backdrop-blur-[2px]"
              onClick={scrollToAbout}
              style={{
                filter: "saturate(0.9) brightness(0.95)"
              }}
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

            {/* GitHub Profile Button */}
            <Button
              variant="outline"
              className="border-[#FF1493]/30 text-white hover:bg-[#FF1493]/10 hover:border-[#FF1493] shadow-lg shadow-[#FF1493]/10 hover:shadow-[#FF1493]/20 transition-all duration-300 group"
              asChild
            >
              <a
                href={`https://github.com/${GithubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <GitHubIcon size={18} />
                View Profile
                <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* Scroll Indicator Arrow */}
          <button
            ref={arrowRef}
            onClick={scrollToAbout}
            aria-label="Scroll down to about section"
            className={`fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-[#00FFFF]/60 hover:text-[#00FFFF] transition-all duration-300 hover:scale-110 z-10 ${
              showScrollArrow ? "opacity-100 visible animate-bounce" : "opacity-0 invisible"
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