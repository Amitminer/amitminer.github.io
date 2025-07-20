/**
 * About Component
 * 
 * A dynamic and interactive "About Me" section that features:
 * - Typewriter effect for text animation
 * - Intersection Observer for scroll-based animations
 * - Floating particles and decorative elements
 * - Design with gradient effects
 * - Skeleton loading state
 * 
 * Key Features:
 * - Progressive text reveal with typewriter effect
 * - Blinking cursor animation
 * - Scroll-triggered animations
 * - Highlighted name mentions
 * - Decorative particle animations
 * - Gradient text and border effects
 * - Skeleton loading state
 */

'use client';

import { TypewriterState } from '@/app/lib/types';
import { useEffect, useRef, useState, useCallback } from 'react';

// Constants
const TYPING_DELAY = 8; // ms between characters for first paragraph
const SECOND_TYPING_DELAY = 5; // ms between characters for second paragraph
const CURSOR_BLINK_DELAY = 500; // ms between cursor blinks
const LOADING_DELAY = 1000; // ms for loading state
const PARTICLE_COUNT = 5;

// Content
const CONTENT = {
  firstParagraph: "Hello! I'm AmitxD, also Amitminer, a passionate self-taught developer from India. I love creating innovative solutions and exploring new technologies. My journey in the world of programming has been exciting, and I'm always eager to learn more.",
  secondParagraph: "I'm driven by a curiosity for problem-solving and a desire to make a positive impact through technology. When I'm not coding, you can find me exploring new frameworks, contributing to open-source projects, or sharing my knowledge with the community."
};

const About = () => {
  // === Refs and State Management ===
  const aboutRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typewriterState, setTypewriterState] = useState<TypewriterState>({
    currentIndex: 0,
    secondIndex: 0,
    showCursor: true
  });

  // === Effects ===

  /**
   * Intersection Observer Effect
   * Triggers animations when the section comes into view
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          entry.target.classList.add('slide-up');
          setTimeout(() => setIsLoading(false), LOADING_DELAY);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = aboutRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  /**
   * Cursor Blinking Animation
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTypewriterState(prev => ({ ...prev, showCursor: !prev.showCursor }));
    }, CURSOR_BLINK_DELAY);

    return () => clearInterval(interval);
  }, []);

  /**
   * First Paragraph Typewriter Effect
   */
  useEffect(() => {
    if (isVisible && typewriterState.currentIndex < CONTENT.firstParagraph.length) {
      const timeout = setTimeout(() => {
        setTypewriterState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1
        }));
      }, TYPING_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, typewriterState.currentIndex]);

  /**
   * Second Paragraph Typewriter Effect
   */
  useEffect(() => {
    const isFirstParagraphComplete = typewriterState.currentIndex >= CONTENT.firstParagraph.length;
    
    if (isVisible && isFirstParagraphComplete && typewriterState.secondIndex < CONTENT.secondParagraph.length) {
      const timeout = setTimeout(() => {
        setTypewriterState(prev => ({
          ...prev,
          secondIndex: prev.secondIndex + 1
        }));
      }, SECOND_TYPING_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, typewriterState.currentIndex, typewriterState.secondIndex]);

  // === Helper Functions ===

  /**
   * Renders text with typewriter effect and special highlighting
   */
  const renderTextWithTypewriter = useCallback((text: string, currentIdx: number) => {
    return text.split('').map((char, index) => {
      const isRevealed = index < currentIdx;
      const isHighlighted =
        (text.slice(index, index + 6) === 'AmitxD') ||
        (text.slice(index, index + 9) === 'Amitminer');

      let className = 'transition-all duration-300 ';
      if (isRevealed) {
        className += isHighlighted ? 'text-pink-500 font-bold opacity-100' : 'text-foreground opacity-100';
      } else {
        className += 'text-muted-foreground/30 opacity-50';
      }

      return (
        <span
          key={index}
          className={className}
          style={{ transitionDelay: isRevealed ? `${index * 2}ms` : '0ms' }}
        >
          {char}
        </span>
      );
    });
  }, []);

  // === Animation State Checks ===
  const isFirstParagraphComplete = typewriterState.currentIndex >= CONTENT.firstParagraph.length;
  const isSecondParagraphComplete = typewriterState.secondIndex >= CONTENT.secondParagraph.length;
  const showFirstCursor = !isFirstParagraphComplete && typewriterState.showCursor;
  const showSecondCursor = isFirstParagraphComplete && !isSecondParagraphComplete && typewriterState.showCursor;

  // === Skeleton Loading Component ===
  const SkeletonLoader = useCallback(() => (
    <div className="max-w-3xl mx-auto bg-secondary/30 rounded-xl p-6 md:p-8 backdrop-blur-sm border border-pink-500/10">
      {/* Title Skeleton */}
      <div className="h-8 w-48 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-lg animate-pulse mb-8 mx-auto" />
      
      {/* First Paragraph Skeleton */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-full" />
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-5/6" />
      </div>
      
      {/* Second Paragraph Skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-full" />
        <div className="h-4 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded animate-pulse w-4/5" />
      </div>
    </div>
  ), []);

  // === JSX ===
  return (
    <section
      id="about"
      ref={aboutRef}
      className="py-20 w-full opacity-0 relative overflow-hidden"
    >
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(PARTICLE_COUNT)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full
              ${isVisible ? 'animate-bounce' : 'opacity-0'}`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Title with Gradient Effect */}
        <h2
          className={`text-3xl md:text-4xl font-bold mb-12 gradient-text text-center transition-all duration-700 transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          About me
        </h2>

        {/* Show Skeleton or Content */}
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div
            className={`max-w-3xl mx-auto bg-secondary/30 rounded-xl p-6 md:p-8 backdrop-blur-sm
              border border-pink-500/10 hover:border-pink-500/30 transition-all duration-500
              hover:shadow-2xl hover:shadow-pink-500/5 transform ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            {/* First Paragraph with Typewriter Effect */}
            <div className="text-base leading-relaxed relative">
              {renderTextWithTypewriter(CONTENT.firstParagraph, typewriterState.currentIndex)}
              {showFirstCursor && (
                <span className="text-cyan-500 font-bold animate-pulse ml-1">|</span>
              )}
            </div>

            {/* Second Paragraph with Typewriter Effect */}
            <div className="text-base leading-relaxed relative mt-4">
              {renderTextWithTypewriter(CONTENT.secondParagraph, typewriterState.secondIndex)}
              {showSecondCursor && (
                <span className="text-cyan-500 font-bold animate-pulse ml-1">|</span>
              )}
            </div>

            {/* Completion Indicator */}
            {isFirstParagraphComplete && isSecondParagraphComplete && (
              <div className="mt-6 flex justify-center animate-fade-in">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decorative Elements */}
        {isVisible && (
          <>
            {/* Spinning Circle */}
            <div
              className="absolute top-1/4 left-10 w-6 h-6 border-2 border-pink-500/30 rounded-full
                animate-spin transition-all duration-700 transform"
              style={{ transitionDelay: '0.5s', animationDuration: '6s' }}
            />
            {/* Pulsing Dot */}
            <div
              className="absolute bottom-1/4 right-10 w-4 h-4 bg-cyan-500/20 rounded-full
                animate-ping transition-all duration-700"
              style={{ transitionDelay: '0.6s', animationDuration: '2s' }}
            />
            {/* Rotating Square */}
            <div
              className="absolute top-1/2 right-20 w-8 h-8 border border-cyan-500/20
                rotate-45 animate-pulse transition-all duration-700"
              style={{ transitionDelay: '0.7s', animationDuration: '1.5s' }}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default About;
