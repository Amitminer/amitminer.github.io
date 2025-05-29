'use client';

import { useEffect, useRef, useState } from 'react';

const About = () => {
  const aboutRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(0);
  const [showSecondParagraph, setShowSecondParagraph] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const firstParagraph =
    "Hey! I'm AmitxD (also known as Amitminer), a self-taught developer from India who’s super into tech and building cool stuff. I love learning on my own and experimenting with new ideas—coding has been a fun and exciting journey so far.";

  const secondParagraph =
    "I'm really into solving problems and figuring out how things work. I like building things that actually help people. Outside of coding, I mess around with new frameworks, contribute to open-source when I can, and sometimes share what I’ve learned with others.";

  // === Visibility Trigger (Intersection Observer) ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          entry.target.classList.add('slide-up');
        }
      },
      { threshold: 0.1 }
    );

    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => {
      if (aboutRef.current) observer.unobserve(aboutRef.current);
    };
  }, []);

  // === Blinking Cursor ===
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // === First Paragraph Typewriter Effect ===
  useEffect(() => {
    if (isVisible && currentIndex < firstParagraph.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 7);
      return () => clearTimeout(timeout);
    } else if (isVisible && currentIndex >= firstParagraph.length && !showSecondParagraph) {
      const timeout = setTimeout(() => setShowSecondParagraph(true), 200);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, currentIndex, showSecondParagraph, firstParagraph.length]);

  // === Second Paragraph Typewriter Effect ===
  useEffect(() => {
    if (showSecondParagraph && secondIndex < secondParagraph.length) {
      const timeout = setTimeout(() => {
        setSecondIndex((prev) => prev + 1);
      }, 7);
      return () => clearTimeout(timeout);
    }
  }, [showSecondParagraph, secondIndex, secondParagraph.length]);

  // === Typewriter Render Function ===
  const renderTextWithTypewriter = (text: string, idx: number) =>
    text.split('').map((char, i) => {
      const revealed = i < idx;
      const slice = text.slice(i, i + 9);
      const isHighlighted = slice.startsWith('AmitxD') || slice.startsWith('Amitminer');

      const className = [
        'transition-all duration-300',
        revealed
          ? isHighlighted
            ? 'text-pink-500 font-bold opacity-100'
            : 'text-foreground opacity-100'
          : 'text-muted-foreground/30 opacity-50',
      ].join(' ');

      return (
        <span
          key={i}
          className={className}
          style={{ transitionDelay: revealed ? `${i * 2}ms` : '0ms' }}
        >
          {char}
        </span>
      );
    });

  // === Cursor Logic ===
  const showFirstCursor = currentIndex < firstParagraph.length || (!showSecondParagraph && showCursor);
  const showSecondCursor = showSecondParagraph && secondIndex < secondParagraph.length && showCursor;

  return (
    <section
      id="about"
      ref={aboutRef}
      className="py-10 sm:py-20 w-full opacity-0 relative overflow-hidden"
    >
      {/* === Floating Background Dots === */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full ${isVisible ? 'animate-bounce' : 'opacity-0'
              }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* === Main Content === */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <h2
          className={`text-3xl md:text-4xl font-bold mb-14 gradient-text text-center transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
        >
          About me
        </h2>

        <div
          className={`max-w-3xl mx-auto bg-secondary/30 rounded-xl p-6 md:p-8 backdrop-blur-sm 
            border border-pink-500/10 hover:border-pink-500/30 transition-all duration-500 
            hover:shadow-2xl hover:shadow-pink-500/5 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          style={{ transitionDelay: '0.2s' }}
        >
          {/* === First Paragraph === */}
          <div className="text-lg leading-relaxed mb-6 min-h-[80px] sm:min-h-[120px] relative">
            {renderTextWithTypewriter(firstParagraph, currentIndex)}
            {showFirstCursor && <span className="text-cyan-500 font-bold animate-pulse ml-1">|</span>}
          </div>

          {/* === Second Paragraph === */}
          {showSecondParagraph && (
            <div
              className={`text-lg leading-relaxed transition-all duration-300 relative ${showSecondParagraph ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              {renderTextWithTypewriter(secondParagraph, secondIndex)}
              {showSecondCursor && <span className="text-cyan-500 font-bold animate-pulse ml-1">|</span>}
            </div>
          )}

          {/* === Completion Indicator === */}
          {secondIndex >= secondParagraph.length && (
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

        {/* === Decorative Shapes === */}
        {isVisible && (
          <>
            <div
              className="absolute top-1/4 left-10 w-6 h-6 border-2 border-pink-500/30 rounded-full animate-spin transition-all duration-700 transform"
              style={{ transitionDelay: '0.5s', animationDuration: '6s' }}
            />
            <div
              className="absolute bottom-1/4 right-10 w-4 h-4 bg-cyan-500/20 rounded-full animate-ping transition-all duration-700"
              style={{ transitionDelay: '0.6s', animationDuration: '2s' }}
            />
            <div
              className="absolute top-1/2 right-20 w-8 h-8 border border-cyan-500/20 rotate-45 animate-pulse transition-all duration-700"
              style={{ transitionDelay: '0.7s', animationDuration: '1.5s' }}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default About;
