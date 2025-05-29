'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { ArrowDownCircle } from 'lucide-react';
import ProfileImage from '@/app/assets/pfp.webp';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);

  // === Scroll + Intersection Observer Effects ===
  useEffect(() => {
    const handleIntersection: IntersectionObserverCallback = ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    const handleScroll = () => {
      if (!arrowRef.current) return;

      // More reliable bottom detection with tolerance
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Add a small tolerance (10px) to account for rounding issues
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 10;

      arrowRef.current.style.opacity = isNearBottom ? '0' : '1';
      arrowRef.current.style.pointerEvents = isNearBottom ? 'none' : 'auto';
    };

    // Call once on mount to set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // === Scroll To "About" Section ===
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  // === JSX ===
  return (
    <section
      ref={heroRef}
      className="min-h-[85vh] flex items-center justify-center opacity-0 pt-12 sm:pt-16">
    <div className="container max-w-3xl mx-auto px-4 md:px-6 py-4 sm:py-8 flex flex-col items-center text-center">
      {/* Profile Image */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-[#00FFFF]/50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF1493] to-[#00FFFF] opacity-30 animate-pulse rounded-full" />
        <Image
          src={ProfileImage}
          alt="AmitxD Profile"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Name */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 gradient-text glitch">
        AmitxD
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl mb-6 text-[#00FFFF]">
        Self-taught Developer
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button
          className="bg-gradient-to-r from-[#FF1493] to-[#00FFFF] hover:from-[#FF1493]/80 hover:to-[#00FFFF]/80 text-white font-medium px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          onClick={scrollToAbout}
        >
          About Me
        </Button>
        <Button
          variant="outline"
          className="border-[#00FFFF] text-white hover:bg-[#00FFFF]/10"
          asChild
        >
          <a href="#contact">Contact Me</a>
        </Button>
      </div>

      {/* Scroll Arrow */}
      <button
        ref={arrowRef}
        onClick={scrollToAbout}
        aria-label="Scroll down"
        className="fixed bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 text-[#00FFFF]/50 hover:text-[#00FFFF] transition-all duration-300 animate-bounce"
      >
        <ArrowDownCircle size={28} />
      </button>
    </div>
</section >

  );
};

export default Hero;