'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Heart } from 'lucide-react';
import { BuyMeACoffeeLink } from '@/app/utils/Links';

const Support = () => {
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-up');
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

  return (
    <section
      id="support"
      ref={supportRef}
      className="py-17 w-full opacity-0 bg-gradient-to-b from-secondary/10 to-secondary/40 transition-opacity duration-700 ease-out"
    >
      <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500">
          Support Me
        </h2>

        <p className="text-lg mb-12 text-gray-300">
          If you find my projects helpful and would like to support their continued development, consider buying me a coffee.
        </p>

        <div className="flex justify-center">
          <a
            href={BuyMeACoffeeLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
          >
            <Button className="flex items-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400/60">
              <Heart className="mr-3 h-6 w-6" />
              Buy Me a Coffee
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Support;
