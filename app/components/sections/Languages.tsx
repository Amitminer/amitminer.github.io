'use client';
import { GithubUsername, TopLanguagesApiUrl } from '@/app/utils/Links';
import { useEffect, useRef, useState } from 'react';

const Languages = () => {
  const [isVisible, setIsVisible] = useState(false);
  const languagesRef = useRef<HTMLDivElement>(null);
  const username = GithubUsername;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (languagesRef.current) {
      observer.observe(languagesRef.current);
    }

    return () => {
      if (languagesRef.current) {
        observer.unobserve(languagesRef.current);
      }
    };
  }, []);

  return (
    <section
      id="languages"
      ref={languagesRef}
      className="py-20 w-full bg-secondary/20"
    >
      <div className="container mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-3xl font-bold mb-12 gradient-text text-center">
        Most Used Languages
      </h2>

      <div className="max-w-6xl mx-auto text-center">
        <div
        className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
        <img
          src={TopLanguagesApiUrl}
          alt={`${username} Top Languages`}
          className="w-full md:w-[600px] lg:w-[800px] mx-auto rounded-lg shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300 hover:scale-105"
          loading="lazy"
        />
        </div>
      </div>
      </div>
    </section>
  );
};

export default Languages;