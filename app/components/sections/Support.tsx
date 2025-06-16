/**
 * Support Component
 * 
 * A section that encourages users to support the developer through Buy Me a Coffee.
*/

'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Heart, Coffee } from 'lucide-react';
import { BuyMeACoffeeLink } from '@/app/utils/Links';
import { SupportState } from '@/app/lib/types';

const Support = () => {
  const supportRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SupportState>({
    isVisible: false,
    isHovered: false
  });

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isVisible: true }));
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (supportRef.current) {
      observer.observe(supportRef.current);
    }

    return () => {
      if (supportRef.current) {
        observer.unobserve(supportRef.current);
      }
    };
  }, []);

  // Handle hover state
  const handleMouseEnter = () => setState(prev => ({ ...prev, isHovered: true }));
  const handleMouseLeave = () => setState(prev => ({ ...prev, isHovered: false }));

  return (
    <section
      id="support"
      ref={supportRef}
      className={`py-17 w-full transition-all duration-1000 ${
        state.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } bg-gradient-to-b from-secondary/10 to-secondary/40`}
    >
      <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500">
          Support My Work
        </h2>

        <p className="text-sm mb-12 text-gray-300 leading-relaxed">
          Enjoying my projects? Buy me a coffee to support ongoing development and maintenance.
        </p>

        <div className="flex justify-center">
          <a
            href={BuyMeACoffeeLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support my work by buying me a coffee"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group"
          >
            <Button 
              className={`
                flex items-center gap-3
                bg-gradient-to-r from-pink-500 to-purple-600 
                hover:from-pink-600 hover:to-purple-700 
                text-white font-semibold px-8 py-4 
                rounded-lg shadow-lg 
                transition-all duration-300 
                transform hover:scale-105 
                focus:outline-none focus:ring-4 focus:ring-pink-400/60
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Heart className={`h-6 w-6 transition-transform duration-300 ${
                state.isHovered ? 'scale-110 text-pink-300' : ''
              }`} />
              <span>Buy Me a Coffee</span>
              <Coffee className={`h-5 w-5 transition-transform duration-300 ${
                state.isHovered ? 'scale-110 text-pink-300' : ''
              }`} />
            </Button>
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Your support fuels more open-source contributions.
        </p>
      </div>
    </section>
  );
};

export default Support;
