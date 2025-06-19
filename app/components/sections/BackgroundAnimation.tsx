/**
 * BackgroundAnimation Component
 * 
 * A dynamic background animation system that creates:
 * - Floating particles with random sizes and movements
 * - Geometric shapes (squares, circles, triangles)
 * - Floating code snippets from Rust
 * - Pulsing dots with gradient effects
 */

"use client"
import { useEffect, useRef, useState } from "react"

const BackgroundAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only start animations when page is loaded and visible
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Rust code snippets (keeping as requested)
  const rustCodeSnippets = [
    "fn main() {",
    "let mut x = 5;",
    'println!("Hello!");',
    "match result {",
    "Some(val) => val,",
    "impl Display for",
    "use std::collections;",
    "async fn fetch()",
    "#[derive(Debug)]",
    "Result<T, E>",
    "Vec<String>",
    "Option<T>",
  ]

  if (!isVisible) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
    >
      {/* Simplified Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Static Floating Particles (CSS only animation) */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Static Geometric Shapes */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => {
          const shapeType = i % 3
          const size = 8 + Math.random() * 12
          const isLeft = Math.random() > 0.5
          const isTop = Math.random() > 0.5
          
          return (
            <div
              key={`shape-${i}`}
              className="absolute opacity-30"
              style={{
                left: isLeft ? `${Math.random() * 25}%` : `${75 + Math.random() * 25}%`,
                top: isTop ? `${Math.random() * 30}%` : `${70 + Math.random() * 30}%`,
                animation: `spin ${8 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 6}s`
              }}
            >
              {shapeType === 0 && (
                <div 
                  className="border border-cyan-400"
                  style={{ width: size, height: size }}
                />
              )}
              {shapeType === 1 && (
                <div 
                  className="border border-pink-500 rounded-full"
                  style={{ width: size, height: size }}
                />
              )}
              {shapeType === 2 && (
                <div 
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${size/2}px solid transparent`,
                    borderRight: `${size/2}px solid transparent`,
                    borderBottom: `${size}px solid rgba(255, 20, 147, 0.6)`
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Static Rust Code Snippets */}
      <div className="absolute inset-0">
        {rustCodeSnippets.slice(0, 4).map((code, i) => {
          const isLeft = i % 2 === 0
          return (
            <div
              key={`code-${i}`}
              className="absolute text-xs font-mono text-cyan-300/40 whitespace-nowrap select-none"
              style={{
                left: isLeft ? `${Math.random() * 20}%` : `${80 + Math.random() * 15}%`,
                top: `${20 + i * 20 + Math.random() * 10}%`,
                animationName: 'fadeSlide',
                animationDuration: `${6 + Math.random() * 4}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 2}s`
              }}
            >
              {code}
            </div>
          )
        })}
      </div>

      {/* Static Pulsing Dots */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-pink-500/5 to-cyan-500/5" />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes fadeSlide {
          0%, 100% { opacity: 0.2; transform: translateX(0px); }
          50% { opacity: 0.6; transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

export default BackgroundAnimation
