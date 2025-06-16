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
import { useEffect, useRef } from "react"

const BackgroundAnimation = () => {
  // === Refs for Animation Containers ===
  const particlesRef = useRef<HTMLDivElement>(null)  // Floating particles container
  const shapesRef = useRef<HTMLDivElement>(null)     // Geometric shapes container
  const codeRef = useRef<HTMLDivElement>(null)       // Code snippets container
  const dotsRef = useRef<HTMLDivElement>(null)       // Pulsing dots container

  // === Animation Effects ===
  useEffect(() => {
    /**
     * Creates floating particles with random properties
     * - Random size between 2px and 5px
     * - Random position across the screen
     * - Random animation timing
     */
    const createParticles = () => {
      if (!particlesRef.current) return

      // Clear existing particles
      particlesRef.current.innerHTML = ""

      // Create floating particles
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div")
        particle.className = "particle"

        // Random size between 2px and 5px
        const size = Math.random() * 3 + 2
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`

        // Random position
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`

        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 6}s`

        // Random animation duration
        particle.style.animationDuration = `${4 + Math.random() * 4}s`

        particlesRef.current.appendChild(particle)
      }
    }

    /**
     * Creates floating geometric shapes
     * - Random shape type (square, circle, triangle)
     * - Random size and color
     * - Positioned away from center area
     */
    const createFloatingShapes = () => {
      if (!shapesRef.current) return

      shapesRef.current.innerHTML = ""

      // Create geometric shapes
      for (let i = 0; i < 8; i++) {
        const shape = document.createElement("div")
        shape.className = "floating-shape"

        // Random shape type
        const shapeType = Math.random()
        if (shapeType < 0.33) {
          // Square
          const size = Math.random() * 20 + 10
          shape.style.width = `${size}px`
          shape.style.height = `${size}px`
          shape.style.borderColor = Math.random() > 0.5 ? "#ff1493" : "#00ffff"
        } else if (shapeType < 0.66) {
          // Circle
          const size = Math.random() * 15 + 8
          shape.style.width = `${size}px`
          shape.style.height = `${size}px`
          shape.style.borderRadius = "50%"
          shape.style.borderColor = Math.random() > 0.5 ? "#ff1493" : "#00ffff"
        } else {
          // Triangle
          const size = Math.random() * 12 + 6
          shape.style.width = "0"
          shape.style.height = "0"
          shape.style.borderLeft = `${size}px solid transparent`
          shape.style.borderRight = `${size}px solid transparent`
          shape.style.borderBottom = `${size * 1.5}px solid ${Math.random() > 0.5 ? "#ff1493" : "#00ffff"}`
        }

        // Position shapes away from center (avoid 30%-70% of screen width and 20%-80% of height)
        let left, top
        do {
          left = Math.random() * 100
          top = Math.random() * 100
        } while (left > 25 && left < 75 && top > 15 && top < 85)

        shape.style.left = `${left}%`
        shape.style.top = `${top}%`

        // Random animation delay
        shape.style.animationDelay = `${Math.random() * 8}s`

        shapesRef.current.appendChild(shape)
      }
    }

    /**
     * Creates floating code snippets from Rust
     * - Random selection from predefined snippets
     * - Positioned away from center area
     * - Random animation timing
     */
    const createCodeSnippets = () => {
      if (!codeRef.current) return

      codeRef.current.innerHTML = ""
      const codeTexts = [
        "fn main() {",
        "let mut x = 5;",
        'println!("Hello, world!");',
        "match result {",
        "Some(val) => val,",
        "None => panic!(),",
        "impl Display for",
        "cargo build --release",
        "use std::collections::HashMap;",
        "async fn fetch_data()",
        "#[derive(Debug)]",
        "Result<T, E>",
        "Vec<String>",
        "struct Point { x: f64, y: f64 }",
        ".iter().map(|x| x * 2)",
        "pub mod tests {",
        "Option<T>",
        "#[cfg(test)]",
        ".unwrap_or_default()",
        "Arc<Mutex<T>>",
      ]

      // Create floating code snippets
      for (let i = 0; i < 6; i++) {
        const code = document.createElement("div")
        code.className = "code-snippet"
        code.textContent = codeTexts[Math.floor(Math.random() * codeTexts.length)]

        // Position away from center area
        let left
        do {
          left = Math.random() * 90
        } while (left > 20 && left < 70)

        code.style.left = `${left}%`
        code.style.animationDelay = `${Math.random() * 10}s`
        code.style.animationDuration = `${8 + Math.random() * 4}s`

        codeRef.current.appendChild(code)
      }
    }

    /**
     * Creates pulsing dots with gradient effects
     * - Random position across the screen
     * - Random animation timing
     */
    const createPulsingDots = () => {
      if (!dotsRef.current) return

      dotsRef.current.innerHTML = ""

      // Create pulsing dots
      for (let i = 0; i < 10; i++) {
        const dot = document.createElement("div")
        dot.className = "pulsing-dot"

        // Random position
        dot.style.left = `${Math.random() * 100}%`
        dot.style.top = `${Math.random() * 100}%`

        // Random animation delay
        dot.style.animationDelay = `${Math.random() * 3}s`

        dotsRef.current.appendChild(dot)
      }
    }

    // Initial creation of all animation elements
    createParticles()
    createFloatingShapes()
    createCodeSnippets()
    createPulsingDots()

    // Recreate elements periodically for variety
    const interval = setInterval(() => {
      createParticles()
      createFloatingShapes()
      createCodeSnippets()
      createPulsingDots()
    }, 15000)  // Regenerate every 15 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // === Render ===
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="grid-pattern" />

      {/* Wave Animation Layer */}
      <div className="wave-animation" />

      {/* Floating Particles Layer */}
      <div ref={particlesRef} className="floating-particles" />

      {/* Geometric Shapes Layer */}
      <div ref={shapesRef} className="floating-shapes" />

      {/* Code Snippets Layer */}
      <div ref={codeRef} className="floating-shapes" />

      {/* Pulsing Dots Layer */}
      <div ref={dotsRef} className="floating-shapes" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#FF1493]/3 to-[#00FFFF]/3" />
    </div>
  )
}

export default BackgroundAnimation
