/**
 * AnimatedSections Component
 *
 * A high-performance animation system that provides:
 * - Section-based animations with GSAP
 * - Scroll-triggered animations with performance optimizations
 * - Custom cursor effects for desktop devices
 * - Adaptive animations based on device capabilities
 * - Progressive enhancement for slower devices
 */

"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import type React from "react"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

declare global {
  interface Window {
    lastScrollY?: number
  }
}

export default function AnimatedSections({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkIsDesktop = useCallback(() => {
    const isDesktopSize = window.innerWidth >= 1024
    const hasPointerDevice = window.matchMedia("(pointer: fine)").matches
    const isNotTouchDevice = !("ontouchstart" in window)
    const hasGoodPerformance = !window.matchMedia("(prefers-reduced-motion: reduce)").matches

    return isDesktopSize && hasPointerDevice && isNotTouchDevice && hasGoodPerformance
  }, [])

  useEffect(() => {
    setIsDesktop(checkIsDesktop())

    let resizeTimeout: NodeJS.Timeout
    const handleResizeDebounced = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsDesktop(checkIsDesktop())
      }, 150)
    }

    window.addEventListener("resize", handleResizeDebounced, { passive: true })
    return () => {
      window.removeEventListener("resize", handleResizeDebounced)
      clearTimeout(resizeTimeout)
    }
  }, [checkIsDesktop])

  useEffect(() => {
    if (!isDesktop || isInitialized) return

    const initDelay = setTimeout(() => {
      const ctx = gsap.context(() => {
        gsap.defaults({
          ease: "power2.out",
          duration: 1,
          overwrite: "auto",
        })

        let lastScrollTime = 0
        let scrollVelocity = 0
        let isFastScrolling = false

        // Detects fast scrolling to temporarily disable complex animations for performance
        const handleFastScroll = () => {
          const currentTime = Date.now()
          const currentScroll = window.scrollY
          const timeDiff = currentTime - lastScrollTime

          if (timeDiff > 0) {
            const newVelocity = Math.abs(currentScroll - (window.lastScrollY || 0)) / timeDiff
            scrollVelocity = newVelocity
            isFastScrolling = newVelocity > 2 // Threshold for fast scrolling

            if (isFastScrolling) {
              // Disable complex animations during fast scroll
              gsap.globalTimeline.timeScale(0.1)
              setTimeout(() => {
                gsap.globalTimeline.timeScale(1)
              }, 100)
            }
          }

          window.lastScrollY = currentScroll
          lastScrollTime = currentTime
        }

        window.addEventListener("scroll", handleFastScroll, { passive: true })

        // UNIVERSAL PROGRESS BAR (works for all devices)
        const progressBar = document.createElement("div")
        progressBar.className = "scroll-progress"
        progressBar.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 0%;
          height: 3px;
          background: linear-gradient(90deg, #FF1493, #00FFFF);
          z-index: 1000;
          transition: none;
          box-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
        `
        document.body.appendChild(progressBar)

        let progressAnimationId: number
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (progressAnimationId) cancelAnimationFrame(progressAnimationId)
            progressAnimationId = requestAnimationFrame(() => {
              progressBar.style.width = `${self.progress * 100}%`
            })
          },
        })

        const sections = gsap.utils.toArray(".animated-section")
        if (sections.length === 0) return

        sections.forEach((section: any, i) => {
          const direction = i % 2 === 0 ? 100 : -100
          const rotationDir = i % 2 === 0 ? 5 : -5

          gsap.set(section, {
            opacity: 0,
            x: direction,
            y: 50,
            scale: 0.9,
            rotation: rotationDir,
            transformOrigin: "center center",
          })

          gsap.to(section, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play reverse play reverse",
              fastScrollEnd: true,
              preventOverlaps: true,
            },
          })
        })

        // Reverse parallax
        sections.forEach((section: any, i) => {
          if (i % 2 === 0) {
            const reverseEl = document.createElement("div")
            reverseEl.className = "reverse-scroll-bg"
            reverseEl.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: -1;
              will-change: transform;
              background: radial-gradient(circle at ${i % 4 === 0 ? "30%" : "70%"} 50%,
                rgba(255, 20, 147, 0.03) 0%, transparent 70%);
            `
            section.style.position = "relative"
            section.appendChild(reverseEl)

            gsap.to(reverseEl, {
              yPercent: 50,
              xPercent: i % 4 === 0 ? 20 : -20,
              rotation: i % 4 === 0 ? 10 : -10,
              ease: "none",
              scrollTrigger: {
                trigger: document.body || containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                fastScrollEnd: true,
              },
            })
          }
        })

        // Character animations with fast-scroll protection
        const headings = gsap.utils.toArray(
          ".animated-section h1:not(#hero h1), .animated-section h2, .animated-section h3",
        )

        headings.forEach((heading: any) => {
          // Skip if already animated or in problematic sections
          if (
            heading.closest("#hero") ||
            heading.hasAttribute("data-text-animated") ||
            heading.closest("#tech-stack") ||
            heading.closest(".tech-stack") ||
            heading.closest("[class*='tech']") ||
            heading.closest("#languages") ||
            heading.closest("#tools")
          ) {
            return
          }

          heading.setAttribute("data-text-animated", "true")
          const text = heading.textContent || ""

          // For very long text, use simple fade
          if (text.length > 50) {
            gsap.set(heading, { opacity: 0, y: 30 })
            gsap.to(heading, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none reverse",
                fastScrollEnd: true,
              },
            })
            return
          }

          const chars = text
            .split("")
            .map(
              (char: string, i: number) =>
                `<span class="char" style="display: inline-block; will-change: transform;" data-char="${i}">${char === " " ? "&nbsp;" : char}</span>`,
            )
            .join("")

          heading.innerHTML = chars
          const charElements = heading.querySelectorAll(".char")

          gsap.set(charElements, {
            opacity: 0,
            y: 100,
            rotationX: -90,
            scale: 0.5,
            transformOrigin: "center bottom",
          })

          // Create the animation with fast-scroll detection
          const charAnimation = gsap.to(charElements, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1,
            stagger: {
              amount: 0.8,
              from: "random",
              ease: "power2.out",
            },
            ease: "back.out(2.5)",
            paused: true,
          })

          ScrollTrigger.create({
            trigger: heading,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
            fastScrollEnd: true,
            onEnter: () => {
              if (isFastScrolling) {
                gsap.set(charElements, { opacity: 1, y: 0, rotationX: 0, scale: 1 })
              } else {
                charAnimation.play()
              }
            },
            onLeave: () => {
              charAnimation.reverse()
            },
            onEnterBack: () => {
              if (isFastScrolling) {
                gsap.set(charElements, { opacity: 1, y: 0, rotationX: 0, scale: 1 })
              } else {
                charAnimation.play()
              }
            },
            onLeaveBack: () => {
              charAnimation.reverse()
            },
          })
        })

        // Card detection with more selectors
        const cardSelectors = [
          ".project",
          ".project-card",
          ".stat-card",
          ".tech-item",
          "[class*='ProjectCard']",
          "[class*='project-card']",
          ".grid > div:not(.reverse-scroll-bg)",
          "#projects .grid > div:not(.reverse-scroll-bg)",
          "[class*='stat']",
          "[class*='github']",
          "[class*='GitHubStats']",
          ".github-stat",
          ".language-item",
          ".contact-card",
        ]

        const animatedCards = new Set()

        cardSelectors.forEach((selector) => {
          const cards = gsap.utils.toArray(selector)

          cards.forEach((card: any, i) => {
            if (animatedCards.has(card) || card.hasAttribute("data-card-animated")) return

            animatedCards.add(card)
            card.setAttribute("data-card-animated", "true")

            // Check if it's a project card specifically
            const isProjectCard = card.closest("#projects")

            const isTechStack =
              card.classList.contains("tech-item") || card.closest('.tech-stack, #tech, [class*="tech"]')

            // Different trigger points for different card types
            const startTrigger = isProjectCard ? "top 70%" : isTechStack ? "top 80%" : "top 75%"

            const animationDelay = isTechStack ? i * 0.05 : i * 0.1

            gsap.set(card, {
              opacity: 0,
              y: 80,
              rotationY: 25,
              scale: 0.8,
              transformOrigin: "center center",
            })

            gsap.to(card, {
              opacity: 1,
              y: 0,
              rotationY: 0,
              scale: 1,
              duration: isTechStack ? 0.8 : 1.2,
              delay: animationDelay,
              ease: "back.out(1.5)",
              scrollTrigger: {
                trigger: card,
                start: startTrigger,
                end: "bottom 5%",
                toggleActions: "play none none reverse",
                fastScrollEnd: true,
              },
            })

            // Hover animations
            let isHovered = false
            let animationId: number

            const animateHover = (targetValues: any) => {
              if (animationId) cancelAnimationFrame(animationId)

              animationId = requestAnimationFrame(() => {
                gsap.to(card, {
                  ...targetValues,
                  duration: 0.5,
                  ease: "power3.out",
                  overwrite: "auto",
                })
              })
            }

            card.addEventListener("mouseenter", () => {
              isHovered = true
              card.style.willChange = "transform"
              animateHover({
                scale: 1.08,
                y: -15,
                rotationY: 8,
                z: 50,
              })
            })

            card.addEventListener("mousemove", (e: MouseEvent) => {
              if (!isHovered) return

              const rect = card.getBoundingClientRect()
              const x = (e.clientX - rect.left - rect.width / 2) / rect.width
              const y = (e.clientY - rect.top - rect.height / 2) / rect.height

              animateHover({
                rotationY: x * 15,
                rotationX: -y * 10,
                scale: 1.08,
                y: -15,
              })
            })

            card.addEventListener("mouseleave", () => {
              isHovered = false
              card.style.willChange = "auto"
              animateHover({
                scale: 1,
                y: 0,
                rotationY: 0,
                rotationX: 0,
                z: 0,
              })
            })
          })
        })

        // Parallax
        sections.forEach((section: any, i) => {
          const speed = 0.4 + (i % 3) * 0.2
          const direction = i % 2 === 0 ? -1 : 1

          gsap.to(section, {
            yPercent: -10 * speed * direction,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
              fastScrollEnd: true,
            },
          })

          const childElements = section.querySelectorAll("h1:not(#hero h1), h2, h3, p")
          childElements.forEach((child: any, childIndex: number) => {
            gsap.to(child, {
              yPercent: (childIndex % 2 === 0 ? 5 : -5) * speed,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                fastScrollEnd: true,
              },
            })
          })
        })

        // Morphing background
        const morphingBg = document.createElement("div")
        morphingBg.className = "morphing-bg"
        morphingBg.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          background: linear-gradient(135deg,
            rgba(255, 20, 147, 0.02) 0%,
            transparent 30%,
            rgba(0, 255, 255, 0.02) 70%,
            transparent 100%);
        `
        document.body.appendChild(morphingBg)

        let bgAnimationId: number
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          fastScrollEnd: true,
          onUpdate: (self) => {
            if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
            bgAnimationId = requestAnimationFrame(() => {
              const progress = self.progress
              morphingBg.style.background = `linear-gradient(${135 + progress * 120}deg,
                rgba(255, 20, 147, ${0.02 + progress * 0.015}) 0%,
                transparent 30%,
                rgba(0, 255, 255, ${0.02 + progress * 0.015}) 70%,
                transparent 100%)`
            })
          },
        })

        const cursor = cursorRef.current
        if (cursor) {
          let cursorX = 0,
            cursorY = 0
          let cursorAnimationId: number

          const updateCursor = () => {
            gsap.set(cursor, {
              x: cursorX,
              y: cursorY,
            })
          }

          document.addEventListener(
            "mousemove",
            (e) => {
              cursorX = e.clientX
              cursorY = e.clientY

              if (cursorAnimationId) cancelAnimationFrame(cursorAnimationId)
              cursorAnimationId = requestAnimationFrame(updateCursor)
            },
            { passive: true },
          )

          const interactiveSelectors = [...cardSelectors, "button", "a", "[role='button']", ".cursor-hover"]

          interactiveSelectors.forEach((selector) => {
            gsap.utils.toArray(selector).forEach((element: any) => {
              element.addEventListener("mouseenter", () => {
                gsap.to(cursor, {
                  scale: 2,
                  backgroundColor: "rgba(255, 20, 147, 0.6)",
                  duration: 0.3,
                  ease: "power2.out",
                })
              })

              element.addEventListener("mouseleave", () => {
                gsap.to(cursor, {
                  scale: 1,
                  backgroundColor: "rgba(0, 255, 255, 0.4)",
                  duration: 0.3,
                  ease: "power2.out",
                })
              })
            })
          })
        }

        gsap.delayedCall(0.1, () => {
          ScrollTrigger.refresh()

          gsap.delayedCall(0.3, () => {
            const staticCards = document.querySelectorAll('[data-card-animated="true"]')
            staticCards.forEach((card: any) => {
              const rect = card.getBoundingClientRect()
              const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0

              if (isInView && Number.parseFloat(getComputedStyle(card).opacity) < 0.1) {
                gsap.to(card, {
                  opacity: 1,
                  y: 0,
                  rotationY: 0,
                  scale: 1,
                  duration: 0.8,
                  ease: "power2.out",
                })
              }
            })
          })
        })
      }, containerRef)

      setIsInitialized(true)

      return () => {
        ctx.revert()
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        gsap.killTweensOf("*")

        const elements = [".scroll-progress", ".morphing-bg", ".reverse-scroll-bg"]
        elements.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Clean up any remaining will-change styles
        document.querySelectorAll('[style*="will-change"]').forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.willChange = 'auto'
          }
        })

        setIsInitialized(false)
      }
    }, 50)

    return () => {
      clearTimeout(initDelay)
    }
  }, [isDesktop, isInitialized])

  return (
    <div ref={containerRef} className="relative">
      {isDesktop && (
        <div
          ref={cursorRef}
          className="fixed w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-screen"
          style={{
            backgroundColor: "rgba(0, 255, 255, 0.4)",
            transform: "translate(-50%, -50%)",
            willChange: "transform",
            backdropFilter: "blur(2px)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
          }}
        />
      )}
      {children}
    </div>
  )
}