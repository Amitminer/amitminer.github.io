/**
 * TechStack Component
 * 
 * A dynamic technology stack showcase that displays:
 * - Categorized technology groups
 * - Animated tech icons with hover effects
 * - Grid layout
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  SiArchlinux, SiGnubash,
  SiRust, SiPython, SiCplusplus, SiPhp,
  SiReact, SiNextdotjs, SiTailwindcss, SiExpress, SiFlask,
  SiRedis, SiMysql, SiSqlite,
  SiDocker, SiAmazon, SiGooglecloud,
  SiGit, FaWindows
} from '../icons/index';
import { Code } from 'lucide-react';
import { TechGroup, TechGroupProps, TechItemProps } from '@/app/lib/types';

// Constants
const ANIMATION_DELAY = 50; // ms between group animations
const OBSERVER_THRESHOLD = 0.1;
const OBSERVER_ROOT_MARGIN = '50px';

// Tech groups data
const techGroups: TechGroup[] = [
  {
    title: "Languages",
    technologies: [
      { name: 'Rust', icon: <SiRust />, color: 'text-orange-500' },
      { name: 'Python', icon: <SiPython />, color: 'text-blue-500' },
      { name: 'C++', icon: <SiCplusplus />, color: 'text-blue-400' },
      { name: 'PHP', icon: <SiPhp />, color: 'text-blue-600' },
    ]
  },
  {
    title: "Frontend",
    technologies: [
      { name: 'React', icon: <SiReact />, color: 'text-cyan-400' },
      { name: 'Next.js', icon: <SiNextdotjs />, color: 'text-white' },
      { name: 'Tailwind', icon: <SiTailwindcss />, color: 'text-cyan-300' },
    ]
  },
  {
    title: "Backend",
    technologies: [
      { name: 'Express', icon: <SiExpress />, color: 'text-white' },
      { name: 'Flask', icon: <SiFlask />, color: 'text-white' },
    ]
  },
  {
    title: "Databases",
    technologies: [
      { name: 'Redis', icon: <SiRedis />, color: 'text-red-500' },
      { name: 'MySQL', icon: <SiMysql />, color: 'text-blue-600' },
      { name: 'SQLite', icon: <SiSqlite />, color: 'text-blue-300' },
    ]
  },
  {
    title: "DevOps & Cloud",
    technologies: [
      { name: 'Docker', icon: <SiDocker />, color: 'text-blue-500' },
      { name: 'AWS', icon: <SiAmazon />, color: 'text-orange-500' },
      { name: 'GCP', icon: <SiGooglecloud />, color: 'text-blue-500' },
    ]
  },
  {
    title: "Tools & Others",
    technologies: [
      { name: 'Git & GitHub', icon: <SiGit />, color: 'text-orange-500' },
      { name: 'VS Code', icon: <Code />, color: 'text-blue-500' },
      { name: 'Bash', icon: <SiGnubash />, color: 'text-yellow-500' },
    ]
  },
  {
    title: "Operating Systems",
    technologies: [
      { name: 'Windows', icon: <FaWindows />, color: 'text-blue-500' },
      { name: 'Arch Linux', icon: <SiArchlinux />, color: 'text-purple-500' },
    ]
  }
];

// Memoized tech item component
const TechItem = React.memo<TechItemProps>(({ tech, isLast }) => (
  <div id="tech-items" className={`flex flex-col items-center group ${!isLast ? 'border-r border-gray-700/50' : ''} py-2`}>
    <div 
      className={`text-2xl mb-1 ${tech.color} group-hover:scale-110 transition-transform duration-200`}
      style={{ willChange: 'transform' }}
    >
      {tech.icon}
    </div>
    <span className="text-xs text-gray-300 text-center leading-tight">{tech.name}</span>
  </div>
));

TechItem.displayName = 'TechItem';

// Memoized tech group component
const TechGroupComponent = React.memo<TechGroupProps>(({ 
  group, 
  isVisible, 
  groupIndex 
}) => (
  <div
    className={`p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 border border-gray-700/30 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ 
      transitionDelay: `${groupIndex * ANIMATION_DELAY}ms`,
      willChange: 'transform, opacity'
    }}
  >
    <h3 className="text-lg font-semibold mb-3 text-white text-center">{group.title}</h3>
    <div className="grid grid-cols-3 gap-3">
      {group.technologies.map((tech, index) => (
        <TechItem 
          key={tech.name} 
          tech={tech} 
          isLast={index === group.technologies.length - 1}
        />
      ))}
    </div>
  </div>
));

TechGroupComponent.displayName = 'TechGroupComponent';

const TechStack = () => {
  const [isVisible, setIsVisible] = useState(false);
  const techStackRef = React.useRef<HTMLDivElement>(null);

  // Memoized intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  // Intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { 
      threshold: OBSERVER_THRESHOLD,
      rootMargin: OBSERVER_ROOT_MARGIN
    });

    const currentRef = techStackRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [handleIntersection]);

  return (
    <section
      id="tech-stack"
      ref={techStackRef}
      className="py-16 w-full bg-secondary/20"
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
          Technology Stack
        </h2>

        <div className="max-w-7xl mx-auto">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-800 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            {techGroups.map((group, groupIndex) => (
              <TechGroupComponent
                key={group.title}
                group={group}
                isVisible={isVisible}
                groupIndex={groupIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;