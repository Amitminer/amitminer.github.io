'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to change header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-secondary/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold gradient-text">
          AmitxD
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="nav-link"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-secondary/95 backdrop-blur-md absolute w-full">
          <nav className="flex flex-col items-center py-4 space-y-4">
            {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
