/**
 * Footer component that displays website footer content with dynamic elements.
 * 
 * - Responsive design with desktop detection
 * - Shows visitor counter only on desktop when scrolled to bottom
 * - Displays copyright year, love animation, and social links
 * - Includes open source project link
*/

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { GitHubIcon } from '../icons/index';
import { CurrentGithubLink } from '@/app/utils/Links';
import VisitorCounter from '../ui/VisitorCounter';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showCounter, setShowCounter] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect if user is on desktop
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Detect if user is near bottom of page
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      setShowCounter(bottomReached);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="w-full bg-secondary/70 mt-16">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="text-xl font-bold gradient-text block text-center">
            AmitxD
          </Link>

          {/* Show counter only if user is on desktop and scrolled to bottom */}
          {isDesktop && showCounter && (
            <div className="absolute top-1.5 right-2 scale-[0.8]">
              <VisitorCounter />
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-[#FF1493] animate-pulse" />
            <span>by AmitxD</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={CurrentGithubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-[#00FFFF] transition-colors duration-300"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Open Source</span>
            </a>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-400">© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
