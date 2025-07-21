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
import { useEffect, useState, useMemo } from "react"

const BackgroundAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Start animations immediately when component mounts
  useEffect(() => {
    // Use requestAnimationFrame for smoother initialization
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Memoize static data to prevent recreating on each render
  const rustCodeSnippets = useMemo(() => [
    "fn main() {",
    "let mut x = 5;",
    'println!("Hello!");',
    "match result {",
    "Some(val) => val,",
    "impl Display for",
    "use std::collections;",
    "async fn fetch()",
  ], [])

  // Memoize particle configurations
  const particles = useMemo(() => 
    Array(8).fill(null).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 4,
    })), []
  )

  // Memoize shapes configurations
  const shapes = useMemo(() =>
    Array(5).fill(null).map((_, i) => {
      const shapeType = i % 3
      const size = 8 + Math.random() * 12
      const isLeft = Math.random() > 0.5
      const isTop = Math.random() > 0.5
      
      return {
        id: i,
        type: shapeType,
        size,
        left: isLeft ? Math.random() * 25 : 75 + Math.random() * 25,
        top: isTop ? Math.random() * 30 : 70 + Math.random() * 30,
        duration: 8 + Math.random() * 4,
        delay: Math.random() * 6,
      }
    }), []
  )

  // Memoize code snippets configurations
  const codeElements = useMemo(() =>
    rustCodeSnippets.slice(0, 4).map((code, i) => {
      const isLeft = i % 2 === 0
      return {
        id: i,
        code,
        left: isLeft ? Math.random() * 20 : 80 + Math.random() * 15,
        top: 20 + i * 20 + Math.random() * 10,
        duration: 6 + Math.random() * 4,
        delay: i * 2,
      }
    }), [rustCodeSnippets]
  )

  // Memoize dots configurations
  const dots = useMemo(() =>
    Array(6).fill(null).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 3,
    })), []
  )

  if (!isVisible) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-black to-gray-800" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0">
        {shapes.map((shape) => (
          <div
            key={`shape-${shape.id}`}
            className="absolute opacity-30 animate-spin"
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              animationDuration: `${shape.duration}s`,
              animationDelay: `${shape.delay}s`
            }}
          >
            {shape.type === 0 && (
              <div 
                className="border border-cyan-400"
                style={{ width: shape.size, height: shape.size }}
              />
            )}
            {shape.type === 1 && (
              <div 
                className="border border-pink-500 rounded-full"
                style={{ width: shape.size, height: shape.size }}
              />
            )}
            {shape.type === 2 && (
              <div 
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${shape.size/2}px solid transparent`,
                  borderRight: `${shape.size/2}px solid transparent`,
                  borderBottom: `${shape.size}px solid rgba(255, 20, 147, 0.6)`
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Rust Code Snippets */}
      <div className="absolute inset-0">
        {codeElements.map((element) => (
          <div
            key={`code-${element.id}`}
            className="absolute text-xs font-mono text-cyan-300/40 whitespace-nowrap select-none animate-fadeSlide"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDuration: `${element.duration}s`,
              animationDelay: `${element.delay}s`
            }}
          >
            {element.code}
          </div>
        ))}
      </div>

      {/* Pulsing Dots */}
      <div className="absolute inset-0">
        {dots.map((dot) => (
          <div
            key={`dot-${dot.id}`}
            className="absolute w-2 h-2 bg-linear-to-r from-pink-500 to-cyan-500 rounded-full opacity-50 animate-pulse"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              animationDuration: `${dot.duration}s`,
              animationDelay: `${dot.delay}s`
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-pink-500/5 to-cyan-500/5" />

      {/* Custom CSS Animations */}
      <style jsx>{`
        .animate-float {
          animation: float infinite ease-in-out;
        }
        
        .animate-fadeSlide {
          animation: fadeSlide infinite ease-in-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
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