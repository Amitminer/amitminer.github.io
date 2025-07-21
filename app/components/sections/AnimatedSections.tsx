/**
 * AnimatedSections Component - Cleaned Version
 *
 * Provides optimized scroll-based animations with GSAP
 * - Section animations with performance optimizations
 * - Custom cursor effects for desktop
 * - Card hover effects and text animations
 * - Progress bar and background morphing
 */

"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import type React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function AnimatedSections({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const cleanupRef = useRef<(() => void)[]>([])

  const checkIsDesktop = useCallback(() => {
    return window.innerWidth >= 1024 && 
           window.matchMedia("(pointer: fine)").matches && 
           !("ontouchstart" in window) &&
           !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup)
  }, [])

  // Desktop detection with resize handling
  useEffect(() => {
    setIsDesktop(checkIsDesktop())

    const handleResize = () => setIsDesktop(checkIsDesktop())
    window.addEventListener("resize", handleResize, { passive: true })
    
    addCleanup(() => window.removeEventListener("resize", handleResize))
  }, [checkIsDesktop, addCleanup])

  // Handle page visibility changes and navigation
  useEffect(() => {
    if (!isDesktop) return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, check for elements that should be animated
        setTimeout(() => {
          const allCards = document.querySelectorAll('.project, .project-card, .stat-card, .tech-item, [class*="ProjectCard"], .grid > div, .contact-card')
          allCards.forEach((card: any) => {
            if (!card?.parentNode) return
            
            const rect = card.getBoundingClientRect()
            const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
            
            if (isInViewport && parseFloat(getComputedStyle(card).opacity) < 0.1) {
              gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
              })
            }
          })
          ScrollTrigger.refresh()
        }, 100)
      }
    }

    const handlePageShow = () => {
      // Handle browser back/forward navigation
      setTimeout(() => {
        ScrollTrigger.refresh()
        handleVisibilityChange()
      }, 150)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', handlePageShow)
    
    addCleanup(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', handlePageShow)
    })
  }, [isDesktop, addCleanup])

  // Main animation initialization
  useEffect(() => {
    if (!isDesktop || isInitialized) return

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        gsap.defaults({ ease: "power2.out", duration: 1, overwrite: "auto" })

        // Performance monitoring for fast scrolling
        let isFastScrolling = false
        let lastScrollY = 0
        let fastScrollTimer: NodeJS.Timeout

        const handleScroll = () => {
          const currentScrollY = window.scrollY
          const scrollDelta = Math.abs(currentScrollY - lastScrollY)
          
          if (scrollDelta > 50) {
            if (!isFastScrolling) {
              gsap.globalTimeline.timeScale(0.1)
              isFastScrolling = true
            }
            
            clearTimeout(fastScrollTimer)
            fastScrollTimer = setTimeout(() => {
              gsap.globalTimeline.timeScale(1)
              isFastScrolling = false
            }, 100)
          }
          
          lastScrollY = currentScrollY
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        addCleanup(() => {
          window.removeEventListener("scroll", handleScroll)
          clearTimeout(fastScrollTimer)
        })

        // Progress bar
        const progressBar = document.createElement("div")
        Object.assign(progressBar.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "0%",
          height: "3px",
          background: "linear-gradient(90deg, #FF1493, #00FFFF)",
          zIndex: "1000",
          boxShadow: "0 0 10px rgba(255, 20, 147, 0.5)"
        })
        document.body.appendChild(progressBar)
        addCleanup(() => progressBar.remove())

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            progressBar.style.width = `${self.progress * 100}%`
          }
        })

        // Section animations
        const sections = gsap.utils.toArray(".animated-section")
        sections.forEach((section: any, i) => {
          if (!section?.parentNode) return

          const direction = i % 2 === 0 ? 100 : -100
          
          gsap.set(section, {
            opacity: 0,
            x: direction,
            y: 50,
            scale: 0.9,
            rotation: i % 2 === 0 ? 5 : -5
          })

          gsap.to(section, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play reverse play reverse"
            }
          })

          // Parallax effect
          const speed = 0.4 + (i % 3) * 0.2
          gsap.to(section, {
            yPercent: -10 * speed * (i % 2 === 0 ? -1 : 1),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5
            }
          })
        })

        // Text animations for headings
        const headings = gsap.utils.toArray(".animated-section h1, .animated-section h2, .animated-section h3")
        headings.forEach((heading: any) => {
          if (!heading?.parentNode || 
              heading.closest("#hero") || 
              heading.hasAttribute("data-animated")) return

          heading.setAttribute("data-animated", "true")
          const text = heading.textContent || ""

          // Simple fade for long text
          if (text.length > 50) {
            gsap.set(heading, { opacity: 0, y: 30 })
            gsap.to(heading, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            })
            return
          }

          // Character animation for shorter text
          const chars = text.split("").map((char: string) => 
            `<span class="char" style="display: inline-block;">${char === " " ? "&nbsp;" : char}</span>`
          ).join("");
          
          heading.innerHTML = chars;
          const charElements = heading.querySelectorAll(".char")

          gsap.set(charElements, {
            opacity: 0,
            y: 50,
            scale: 0.8
          })

          gsap.to(charElements, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: { amount: 0.6, from: "random" },
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              toggleActions: "play reverse play reverse"
            }
          })
        })

        // Card animations
        const cardSelectors = [
          ".project", ".project-card", ".stat-card", ".tech-item",
          "[class*='ProjectCard']", ".grid > div", ".contact-card"
        ]

        const animatedCards = new Set()
        cardSelectors.forEach(selector => {
          gsap.utils.toArray(selector).forEach((card: any, i) => {
            if (!card?.parentNode || animatedCards.has(card)) return
            
            animatedCards.add(card)
            
            gsap.set(card, {
              opacity: 0,
              y: 60,
              scale: 0.9
            })

            const cardAnimation = gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: i * 0.1,
              ease: "back.out(1.5)",
              paused: true
            })

            ScrollTrigger.create({
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
              onRefresh: () => {
                // Check if card is already in viewport and should be animated
                const rect = card.getBoundingClientRect()
                const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
                
                if (isInViewport && !cardAnimation.isActive()) {
                  cardAnimation.play()
                }
              },
              onEnter: () => cardAnimation.play(),
              onLeave: () => cardAnimation.reverse(),
              onEnterBack: () => cardAnimation.play(),
              onLeaveBack: () => cardAnimation.reverse()
            })

            // Hover effects
            const handleMouseEnter = () => {
              gsap.to(card, {
                scale: 1.05,
                y: -10,
                duration: 0.3,
                ease: "power2.out"
              })
            }

            const handleMouseLeave = () => {
              gsap.to(card, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
              })
            }

            card.addEventListener("mouseenter", handleMouseEnter)
            card.addEventListener("mouseleave", handleMouseLeave)
            
            addCleanup(() => {
              card.removeEventListener("mouseenter", handleMouseEnter)
              card.removeEventListener("mouseleave", handleMouseLeave)
            })
          })
        })

        // Custom cursor
        const cursor = cursorRef.current
        if (cursor) {
          let cursorX = 0, cursorY = 0

          const updateCursor = (e: MouseEvent) => {
            cursorX = e.clientX
            cursorY = e.clientY
            gsap.set(cursor, { x: cursorX, y: cursorY })
          }

          document.addEventListener("mousemove", updateCursor)
          addCleanup(() => document.removeEventListener("mousemove", updateCursor))

          // Cursor interactions
          const interactiveElements = document.querySelectorAll("button, a, .project, .project-card")
          interactiveElements.forEach(element => {
            const handleEnter = () => {
              gsap.to(cursor, {
                scale: 2,
                backgroundColor: "rgba(255, 20, 147, 0.6)",
                duration: 0.3
              })
            }

            const handleLeave = () => {
              gsap.to(cursor, {
                scale: 1,
                backgroundColor: "rgba(0, 255, 255, 0.4)",
                duration: 0.3
              })
            }

            element.addEventListener("mouseenter", handleEnter)
            element.addEventListener("mouseleave", handleLeave)
            
            addCleanup(() => {
              element.removeEventListener("mouseenter", handleEnter)
              element.removeEventListener("mouseleave", handleLeave)
            })
          })
        }

        // Background morphing
        const morphingBg = document.createElement("div")
        Object.assign(morphingBg.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: "-1",
          background: "linear-gradient(135deg, rgba(255, 20, 147, 0.02) 0%, transparent 30%, rgba(0, 255, 255, 0.02) 70%, transparent 100%)"
        })
        document.body.appendChild(morphingBg)
        addCleanup(() => morphingBg.remove())

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const progress = self.progress
            morphingBg.style.background = `linear-gradient(${135 + progress * 120}deg,
              rgba(255, 20, 147, ${0.02 + progress * 0.015}) 0%,
              transparent 30%,
              rgba(0, 255, 255, ${0.02 + progress * 0.015}) 70%,
              transparent 100%)`
          }
        })

        // Refresh ScrollTrigger and check for elements already in viewport
        setTimeout(() => {
          ScrollTrigger.refresh()
          
          // Force check for cards that should already be visible
          const allCards = document.querySelectorAll('.project, .project-card, .stat-card, .tech-item, [class*="ProjectCard"], .grid > div, .contact-card')
          allCards.forEach((card: any) => {
            if (!card?.parentNode) return
            
            const rect = card.getBoundingClientRect()
            const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
            
            // If card is in viewport but still invisible, animate it immediately
            if (isInViewport && parseFloat(getComputedStyle(card).opacity) < 0.1) {
              gsap.set(card, { opacity: 1, y: 0, scale: 1 })
            }
          })
        }, 100)

        // Additional check after a longer delay for navigation cases
        setTimeout(() => {
          const allCards = document.querySelectorAll('.project, .project-card, .stat-card, .tech-item, [class*="ProjectCard"], .grid > div, .contact-card')
          allCards.forEach((card: any) => {
            if (!card?.parentNode) return
            
            const rect = card.getBoundingClientRect()
            const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
            
            if (isInViewport && parseFloat(getComputedStyle(card).opacity) < 0.1) {
              gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
              })
            }
          })
        }, 500)

      }, containerRef)

      setIsInitialized(true)

      return () => {
        ctx.revert()
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        setIsInitialized(false)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [isDesktop, isInitialized, addCleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => {
        try { cleanup() } catch (e) { console.warn('Cleanup error:', e) }
      })
      cleanupRef.current = []
      
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      gsap.killTweensOf("*")
      
      // Remove any created elements
      document.querySelectorAll(".scroll-progress, .morphing-bg").forEach(el => el.remove())
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {isDesktop && (
        <div
          ref={cursorRef}
          className="fixed w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-screen"
          style={{
            backgroundColor: "rgba(0, 255, 255, 0.4)",
            transform: "translate(-50%, -50%)",
            backdropFilter: "blur(2px)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)"
          }}
        />
      )}
      {children}
    </div>
  )
}