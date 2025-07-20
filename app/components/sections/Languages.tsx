/**
 * Languages Component
 * Displays the user's top programming languages from GitHub using the GitHub Stats API.
 * - Immediate image display with loading overlay
 * - Preloading strategy
 * - Caching with cache-busting only on errors
 * - Progressive enhancement
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { GithubUsername, TopLanguagesApiUrl } from '@/app/utils/Links';
import Image from 'next/image';

const Languages = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const languagesRef = useRef<HTMLDivElement>(null);
  const maxRetries = 2;

  // Generate URL only once unless there's an error
  const [imageUrl] = useState(() => TopLanguagesApiUrl);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (languagesRef.current) {
      observer.observe(languagesRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload image when component mounts
  useEffect(() => {
    const preloadImage = () => {
      const img = new window.Image();
      img.src = imageUrl + (retryCount > 0 ? `&t=${Date.now()}` : '');

      img.onload = () => {
        setIsLoading(false);
        setImageLoaded(true);
        setError(null);
      };

      img.onerror = () => {
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(preloadImage, 500);
        } else {
          setError('Unable to load language stats');
          setIsLoading(false);
        }
      };
    };

    preloadImage();
  }, [imageUrl, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
    setError(null);
    setImageLoaded(false);
  };

  // Compact loading indicator
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#00FFFF]" />
        <span className="text-gray-300 text-sm">Loading...</span>
      </div>
    </div>
  );

  // Compact error display
  const ErrorDisplay = () => (
    <div className="absolute inset-0 bg-gray-800/90 rounded-lg flex flex-col items-center justify-center space-y-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-gray-300 text-sm text-center px-4">{error}</p>
      <button
        onClick={handleRetry}
        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <section
      id="languages"
      ref={languagesRef}
      className={`pt-20 pb-12 w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
          Top Languages
        </h2>

        <div className="max-w-4xl mx-auto text-center pt-4 pb-0">
          <div className="relative w-full max-w-[400px] md:max-w-[460px] lg:max-w-[500px] mx-auto p-[2px] rounded-xl bg-gradient-to-br from-cyan-400/60 to-pink-500/60 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 group">
            <div className="rounded-[10px] overflow-hidden bg-[#0d1117]">
              <Image
                src={imageUrl + (retryCount > 0 ? `&t=${Date.now()}` : '')}
                alt={`${GithubUsername}'s Top Languages`}
                width={500}
                height={195}
                className={`w-full h-auto rounded-[10px] transition-transform duration-300 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-60'
                  }`}
                style={{
                  backgroundColor: '#1f2937',
                }}
                unoptimized
              />
            </div>

            {/* Overlays */}
            {isLoading && !imageLoaded && <LoadingOverlay />}
            {error && <ErrorDisplay />}
          </div>


        </div>
      </div>
    </section>
  );
};

export default Languages;