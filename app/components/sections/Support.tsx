/**
 * Support Component
 * Displays donation options with an animated button and dropdown for supporting the creator.
 * - Supports Buy Me a Coffee and UPI payment options
 */
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Heart, Coffee, Copy, Check } from 'lucide-react';
import { BuyMeACoffeeLink } from '@/app/utils/Links';
import { SupportState } from '@/app/lib/types';

interface ExtendedSupportState extends SupportState {
  copied: boolean;
  showOptions: boolean;
}

const Support = () => {
  const supportRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ExtendedSupportState>({
    isVisible: false,
    isHovered: false,
    copied: false,
    showOptions: false,
  });

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";

  // Intersection Observer for animations
  useEffect(() => {
    const currentRef = supportRef.current;
    let observer: IntersectionObserver | null = null;

    if (currentRef) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setState((prev) => ({ ...prev, isVisible: true }));
            if (observer) {
              observer.unobserve(entry.target);
              observer.disconnect();
            }
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(currentRef);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        supportRef.current &&
        !supportRef.current.contains(event.target as Node)
      ) {
        setState((prev) => ({ ...prev, showOptions: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => setState((prev) => ({ ...prev, isHovered: true }));
  const handleMouseLeave = () => setState((prev) => ({ ...prev, isHovered: false }));

  const toggleOptions = () => setState((prev) => ({ ...prev, showOptions: !prev.showOptions }));

  const handleCoffeeClick = () => {
    window.open(BuyMeACoffeeLink, '_blank');
    setState((prev) => ({ ...prev, showOptions: false }));
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setState((prev) => ({ ...prev, copied: true, showOptions: false }));
      setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID:', err);
    }
  };

  return (
    <section
      id="support"
      ref={supportRef}
      className={`py-16 w-full transition-all duration-1000 ${
        state.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } bg-gradient-to-b from-secondary/10 to-secondary/40`}
    >
      <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500">
          Support My Work
        </h2>
        <p className="text-sm sm:text-base mb-12 text-gray-300 leading-relaxed">
          Building and maintaining stuff solo takes time (and caffeine 😅).<br />
          If you find my projects useful, a small coffee goes a long way!
        </p>

        {/* Payment Options */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm">
            {/* Main Support Button */}
            <Button
              onClick={toggleOptions}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`
                flex items-center gap-3 w-full
                bg-gradient-to-r from-pink-500 to-purple-600
                hover:from-pink-600 hover:to-purple-700
                text-white font-semibold px-6 py-3 sm:px-8 sm:py-4
                rounded-lg shadow-lg
                transition-all duration-300
                transform hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-pink-400/60
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Heart
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${
                  state.isHovered ? 'scale-110 text-pink-300' : ''
                }`}
              />
              <span className="text-sm sm:text-base">Support My Work</span>
              <Coffee
                className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ${
                  state.isHovered ? 'scale-110 text-pink-300' : ''
                }`}
              />
            </Button>

            {/* Options Dropdown */}
            {state.showOptions && (
              <div className="absolute top-full mt-3 left-0 right-0 mx-auto w-full max-w-xs sm:max-w-sm bg-[#0C0715] backdrop-blur-lg border border-purple-500/40 rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-300 ease-in-out">
                <div className="p-2">
                  {/* Buy Me a Coffee Option */}
                  <button
                    onClick={handleCoffeeClick}
                    className="w-full flex items-center gap-3 p-3 sm:p-4 text-left text-white hover:bg-gradient-to-r hover:from-pink-500/80 hover:to-purple-600/80 rounded-lg transition-all duration-200 group"
                  >
                    <Coffee className="h-5 w-5 text-pink-400 group-hover:text-white transition-colors" />
                    <span className="font-medium text-sm sm:text-base">Buy Me a Coffee</span>
                  </button>

                  {/* UPI Option */}
                  <button
                    onClick={copyUpiId}
                    className="w-full flex items-center gap-3 p-3 sm:p-4 text-left text-white hover:bg-gradient-to-r hover:from-green-500/80 hover:to-blue-600/80 rounded-lg transition-all duration-200 group"
                  >
                    {state.copied ? (
                      <Check className="h-5 w-5 text-green-400 group-hover:text-white transition-colors" />
                    ) : (
                      <Copy className="h-5 w-5 text-green-400 group-hover:text-white transition-colors" />
                    )}
                    <span className="font-medium text-sm sm:text-base">
                      {state.copied ? 'UPI ID Copied!' : 'Copy UPI ID'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Your support fuels more open-source contributions.
        </p>
      </div>
    </section>
  );
};

export default Support;