/**
 * Header Component
 * 
 * A responsive navigation header that includes:
 * - Desktop and mobile navigation
 * - Scroll-based styling
 * - Smooth animations
 * - Accessibility features
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import VisitorCounter from '../ui/VisitorCounter';
import { HeaderState, NavItem } from '@/app/lib/types';

const Header = () => {
  const [state, setState] = useState<HeaderState>({
    isMenuOpen: false,
    scrolled: false,
    activeSection: ''
  });

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Tech Stack', href: '#tech-stack' },
    {label: 'Github Stats', href: '#github-stats'},
    { label: 'Languages', href: '#languages' },
    { label: 'Contact', href: '#contact' }
  ];

  // Detect scroll to change header style and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Update scrolled state
      setState(prev => ({ ...prev, scrolled: scrollPosition > 20 }));

      // Update active section
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.offsetTop - 100;
        const sectionHeight = sectionElement.offsetHeight;
        const sectionId = section.getAttribute('id') || '';

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setState(prev => ({ ...prev, activeSection: sectionId }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (state.isMenuOpen && !target.closest('nav') && !target.closest('button')) {
        setState(prev => ({ ...prev, isMenuOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isMenuOpen) {
        setState(prev => ({ ...prev, isMenuOpen: false }));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${state.scrolled
        ? 'bg-secondary/90 backdrop-blur-sm py-3 shadow-lg'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
          aria-label="Home"
        >
          AmitxD
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`nav-link transition-colors duration-300 ${state.activeSection === href.slice(1)
                ? 'text-pink-500'
                : 'text-gray-300 hover:text-white'
                }`}
              aria-current={state.activeSection === href.slice(1) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg p-1"
          onClick={toggleMenu}
          aria-expanded={state.isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {state.isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-secondary/95 backdrop-blur-sm absolute w-full transition-all duration-300 ${state.isMenuOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        <nav
          className="flex flex-col items-center py-4 space-y-4"
          aria-label="Mobile navigation"
        >
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`nav-link transition-all duration-300 font-medium ${state.activeSection === href.slice(1)
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-cyan-300 active:text-cyan-300'
                }`}
              onClick={() => setState(prev => ({ ...prev, isMenuOpen: false }))}
              aria-current={state.activeSection === href.slice(1) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}

          <div className="w-full flex justify-end pr-6 -mt-2 scale-[0.85] text-gray-400">            <VisitorCounter />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
