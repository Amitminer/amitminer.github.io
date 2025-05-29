import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { GitHubIcon } from '../icons/index';
import { CurrentGithubLink } from '@/app/utils/Links';

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Dynamic year

  return (
    <footer className="w-full bg-secondary/70 mt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="text-xl font-bold gradient-text">
            AmitxD
          </Link>

          {/* Signature line */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-[#FF1493] animate-pulse" />
            <span>by AmitxD</span>
          </div>

          {/* GitHub link + copyright */}
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
