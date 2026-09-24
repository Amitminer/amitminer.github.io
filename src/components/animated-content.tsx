"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useEffect, useRef } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AnimatedContent({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-animate='header']", {
        opacity: 0,
        y: -10,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });

      gsap.from("[data-animate='hero-pfp']", {
        opacity: 0,
        scale: 0.8,
        y: 15,
        duration: 0.7,
        delay: 0.1,
        ease: "back.out(1.5)",
        clearProps: "opacity,transform",
      });

      gsap.from("[data-animate='hero-text']", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.2,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });

      gsap.from("[data-animate='hero-buttons']", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out",
        clearProps: "all",
      });

      const sections = containerRef.current?.querySelectorAll<HTMLElement>(
        "[data-animate='section']",
      );

      sections?.forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "opacity,transform",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
