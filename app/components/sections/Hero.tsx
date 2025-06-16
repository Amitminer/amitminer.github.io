/**
 * Optimized Hero Component
 * 
 * Features:
 * - Responsive design with smooth animations
 * - Performance optimized scroll and mouse move handlers
 * - Dynamic scroll indicator with auto-hide
 * - Profile image with loading states
 * - Gradient effects and animations
 * - Action buttons with hover effects
 */

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import { ArrowDownCircle, ExternalLink } from "lucide-react"
import ProfileImage from "@/app/assets/pfp.webp"
import BackgroundAnimation from "./BackgroundAnimation"
import { GitHubIcon } from "../icons/index"
import { GithubUsername } from "@/app/utils/Links"
import { ThrottleOptions } from "@/app/lib/types"

// Throttle utility with TypeScript support
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  { delay, leading = true, trailing = true }: ThrottleOptions
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    const remainingTime = delay - (currentTime - lastExecTime);
    
    if (remainingTime <= 0 && leading) {
      func(...args);
      lastExecTime = currentTime;
    } else if (trailing) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, remainingTime);
    }
  };
};

// Constants
const SCROLL_THROTTLE_DELAY = 32; 
const MOUSE_MOVE_THROTTLE_DELAY = 150;
const ARROW_HIDE_DELAY = 2000;
const SCROLL_THRESHOLD = 50;
const HERO_SECTION_THRESHOLD = 0.7;

const Hero = () => {
  // State
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  
  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const hideArrowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  // Scroll handler with throttling
  const handleScroll = useCallback(
    throttle(() => {
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current?.offsetHeight || 0;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Skip processing if scroll position hasn't changed significantly
      if (Math.abs(scrollY - lastScrollY.current) < 5) return;
      lastScrollY.current = scrollY;
      
      const isInHeroSection = scrollY < heroHeight * HERO_SECTION_THRESHOLD;
      const isNotAtBottom = scrollY + windowHeight < documentHeight - 100;
      const hasScrolled = scrollY > SCROLL_THRESHOLD;
      
      const shouldShow = hasScrolled && isInHeroSection && isNotAtBottom;
      
      if (shouldShow !== showScrollArrow) {
        setShowScrollArrow(shouldShow);
      }
      
      // Auto-hide after delay
      if (hideArrowTimeoutRef.current) {
        clearTimeout(hideArrowTimeoutRef.current);
      }
      
      if (shouldShow) {
        hideArrowTimeoutRef.current = setTimeout(() => {
          setShowScrollArrow(false);
        }, ARROW_HIDE_DELAY);
      }
    }, { delay: SCROLL_THROTTLE_DELAY }),
    [showScrollArrow]
  );

  // Mouse move handler for showing arrow
  const handleMouseMove = useCallback(
    throttle(() => {
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current?.offsetHeight || 0;
      const isInHeroSection = scrollY < heroHeight * HERO_SECTION_THRESHOLD;
      const hasScrolled = scrollY > SCROLL_THRESHOLD;
      
      if (isInHeroSection && hasScrolled && !showScrollArrow) {
        setShowScrollArrow(true);
      }
    }, { delay: MOUSE_MOVE_THROTTLE_DELAY }),
    [showScrollArrow]
  );

  // Setup scroll listeners
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideArrowTimeoutRef.current) {
        clearTimeout(hideArrowTimeoutRef.current);
      }
    };
  }, [handleScroll, handleMouseMove]);

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn("Profile image failed to load");
    setIsImageLoaded(true);
  }, []);

  // Scroll to about section
  const scrollToAbout = useCallback(() => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <BackgroundAnimation />
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen w-full flex items-center justify-center py-16 sm:py-20 md:py-32"
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="container max-w-3xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          {/* Profile Image Container */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6">
            {/* Animated border ring (only border rotates, not the image) */}
            <div 
              className="absolute inset-0 rounded-full p-0.5 bg-gradient-to-r from-[#FF1493] via-[#00FFFF] to-[#FF1493] animate-spin" 
              style={{ 
                animationDuration: '3s',
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="w-full h-full rounded-full bg-black"></div>
            </div>
            
            {/* Static image container */}
            <div 
              className="absolute inset-1 rounded-full overflow-hidden shadow-2xl shadow-[#00FFFF]/30"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Image
                src={ProfileImage}
                alt="AmitxD Profile"
                fill
                sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 12rem"
                className="object-cover"
                priority
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            
            {/* Subtle glow effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#FF1493]/10 to-[#00FFFF]/10 rounded-full blur-md animate-pulse"
              style={{
                willChange: 'opacity',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            ></div>
          </div>

          {/* Name and Title */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 gradient-text"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            AmitxD
          </h1>
          <p 
            className="text-lg sm:text-xl mb-8 text-[#00FFFF]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            Self-taught Developer
          </p>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 mt-4"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* About Me Button */}
            <Button
              className="bg-gradient-to-r from-[#FF1493] to-[#00FFFF] hover:from-[#FF1493]/80 hover:to-[#00FFFF]/80 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#FF1493]/20 hover:shadow-[#00FFFF]/30"
              onClick={scrollToAbout}
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
              showScrollArrow 
                ? 'opacity-100 visible animate-bounce' 
                : 'opacity-0 invisible'
            }`}
            style={{
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <ArrowDownCircle size={28} />
          </button>
        </div>
      </section>
    </>
  );
};

export default Hero;