/**
 * BackgroundAnimation Component
 *
 * A dynamic background animation system that creates:
 * - Floating particles with random sizes and movements
 * - Geometric shapes (squares, circles, triangles)
 * - Floating code snippets from Rust
 * - Pulsing dots with subtle multi-accent gradients
 * - GSAP mouse parallax movement
 */

"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"

// ── Seeded pseudo-random (same values server + client) ──────────────────────
const seeded = (seed: number) => {
	let s = seed
	return () => {
		s = (s * 16807 + 0) % 2147483647
		return (s - 1) / 2147483646
	}
}

const rng = seeded(42)
const r = () => rng()

// ── Static configs ───────────────────────────────────────────────────────────
const RUST_SNIPPETS = [
	"fn main() {",
	"let mut x = 5;",
	'println!("Hello!");',
	"match result {",
	"impl Display for",
	"async fn fetch()",
]

const mkParticles = () => Array.from({ length: 12 }, (_, i) => ({
	id: i,
	left: r() * 100,
	top: r() * 90,
	dur: 4 + r() * 4,
	delay: r() * 4,
	depth: 0.2 + r() * 0.8,
}))

const mkShapes = () => Array.from({ length: 6 }, (_, i) => {
	const size = 8 + r() * 14
	const isLeft = r() > 0.5
	const isTop = r() > 0.5
	return {
		id: i,
		type: i % 3,
		size,
		left: isLeft ? r() * 25 : 75 + r() * 25,
		top: isTop ? r() * 30 : 60 + r() * 30,
		dur: 8 + r() * 6,
		delay: r() * 6,
		depth: 0.1 + r() * 0.4,
	}
})

const mkCode = () => RUST_SNIPPETS.map((code, i) => ({
	id: i,
	code,
	left: i % 2 === 0 ? r() * 18 : 80 + r() * 15,
	top: 15 + i * 12 + r() * 6,
	dur: 7 + r() * 4,
	delay: i * 1.8,
	depth: 0.05 + r() * 0.15,
}))

const mkDots = () => Array.from({ length: 6 }, (_, i) => ({
	id: i,
	left: 5 + r() * 90,
	top: 5 + r() * 85,
	dur: 2.5 + r() * 2,
	delay: r() * 3,
}))

// Generate once at module level
const PARTICLES = mkParticles()
const SHAPES = mkShapes()
const CODES = mkCode()
const DOTS = mkDots()

export default function BackgroundAnimation() {
	const containerRef = useRef<HTMLDivElement>(null)
	const particleRefs = useRef<(HTMLDivElement | null)[]>([])
	const shapeRefs = useRef<(HTMLDivElement | null)[]>([])
	const codeRefs = useRef<(HTMLDivElement | null)[]>([])
	const mouseX = useRef(0)
	const mouseY = useRef(0)
	const appliedX = useRef(0)
	const appliedY = useRef(0)
	const rafRef = useRef<number | null>(null)

	const particles = PARTICLES
	const shapes = SHAPES
	const codes = CODES
	const dots = DOTS

	useEffect(() => {
		if (!containerRef.current) return
		gsap.fromTo(containerRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: 1.2, ease: "power2.out" }
		)
	}, [])

	useEffect(() => {
		const ctx = gsap.context(() => {
			particleRefs.current.forEach((el, i) => {
				if (!el) return
				const p = particles[i]
				gsap.to(el, {
					y: `${-12 - r() * 10}px`,
					x: `${(r() - 0.5) * 14}px`,
					duration: p.dur,
					delay: p.delay,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				})
			})

			shapeRefs.current.forEach((el, i) => {
				if (!el) return
				const s = shapes[i]
				gsap.to(el, {
					rotation: 360,
					duration: s.dur,
					delay: s.delay,
					ease: "none",
					repeat: -1,
				})
				gsap.to(el, {
					y: `${-8 - r() * 8}px`,
					duration: s.dur * 0.6,
					delay: s.delay,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				})
			})

			codeRefs.current.forEach((el, i) => {
				if (!el) return
				const c = codes[i]
				gsap.fromTo(el,
					{ opacity: 0.08, x: 0 },
					{
						opacity: 0.35,
						x: 12,
						duration: c.dur,
						delay: c.delay,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					}
				)
			})
		}, containerRef)

		return () => ctx.revert()
	}, [particles, shapes, codes])

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2
			mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2
		}

		const MOVE_THRESHOLD = 0.004

		const tick = () => {
			const mx = mouseX.current
			const my = mouseY.current

			if (
				Math.abs(mx - appliedX.current) > MOVE_THRESHOLD ||
				Math.abs(my - appliedY.current) > MOVE_THRESHOLD
			) {
				appliedX.current = mx
				appliedY.current = my

				particleRefs.current.forEach((el, i) => {
					if (!el) return
					const depth = particles[i].depth
					gsap.to(el, { x: mx * 18 * depth, y: my * 18 * depth, duration: 1.2, ease: "power2.out", overwrite: "auto" })
				})

				shapeRefs.current.forEach((el, i) => {
					if (!el) return
					const depth = shapes[i].depth
					gsap.to(el, {
						x: mx * 28 * depth,
						y: my * 28 * depth,
						duration: 1.8, ease: "power2.out", overwrite: "auto"
					})
				})

				codeRefs.current.forEach((el, i) => {
					if (!el) return
					const depth = codes[i].depth
					gsap.to(el, {
						x: mx * 10 * depth,
						y: my * 10 * depth,
						duration: 2, ease: "power2.out", overwrite: "auto"
					})
				})
			}

			rafRef.current = requestAnimationFrame(tick)
		}

		window.addEventListener("mousemove", onMove, { passive: true })
		rafRef.current = requestAnimationFrame(tick)

		return () => {
			window.removeEventListener("mousemove", onMove)
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [particles, shapes, codes])

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 pointer-events-none overflow-hidden z-0"
			style={{ opacity: 0 }}
		>
			{/* Architectural Grid */}
			<div
				className="absolute inset-0 opacity-[0.08]"
				style={{
					backgroundImage: `
            linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)
          `,
					backgroundSize: "60px 60px"
				}}
			/>

			{/* Floating Particles */}
			{particles.map((p, i) => (
				<div
					key={`p-${p.id}`}
					ref={el => { particleRefs.current[i] = el }}
					className="absolute w-1.5 h-1.5 bg-sky-400/60 rounded-full"
					style={{
						left: `${p.left}%`,
						top: `${p.top}%`,
						opacity: 0.3 + p.depth * 0.3,
						willChange: "transform",
					}}
				/>
			))}

			{/* Geometric Shapes */}
			{shapes.map((s, i) => (
				<div
					key={`s-${s.id}`}
					ref={el => { shapeRefs.current[i] = el }}
					className="absolute opacity-20"
					style={{
						left: `${s.left}%`,
						top: `${s.top}%`,
						willChange: "transform",
					}}
				>
					{s.type === 0 && (
						<div className="border border-sky-400/60 rounded-sm"
							style={{ width: s.size, height: s.size }} />
					)}
					{s.type === 1 && (
						<div className="border border-emerald-400/60 rounded-full"
							style={{ width: s.size, height: s.size }} />
					)}
					{s.type === 2 && (
						<div style={{
							width: 0, height: 0,
							borderLeft: `${s.size / 2}px solid transparent`,
							borderRight: `${s.size / 2}px solid transparent`,
							borderBottom: `${s.size}px solid rgba(56,189,248,0.4)`,
						}} />
					)}
				</div>
			))}

			{/* Rust Floating Code Snippets */}
			{codes.map((c, i) => (
				<div
					key={`c-${c.id}`}
					ref={el => { codeRefs.current[i] = el }}
					className="absolute text-xs font-mono text-sky-300/60 whitespace-nowrap select-none"
					style={{
						left: `${c.left}%`,
						top: `${c.top}%`,
						willChange: "transform, opacity",
					}}
				>
					{c.code}
				</div>
			))}

			{/* Ambient Pulsing Dots */}
			{dots.map(d => (
				<div
					key={`d-${d.id}`}
					className="absolute w-2 h-2 rounded-full animate-pulse"
					style={{
						left: `${d.left}%`,
						top: `${d.top}%`,
						background: "linear-gradient(135deg, rgba(56,189,248,0.5), rgba(16,185,129,0.5))",
						opacity: 0.3,
						animationDuration: `${d.dur}s`,
						animationDelay: `${d.delay}s`,
					}}
				/>
			))}

			{/* Soft Ambient Radial Vignette */}
			<div
				className="absolute inset-0"
				style={{
					background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(14,165,233,0.04) 0%, transparent 80%)"
				}}
			/>
		</div>
	)
}
