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

const mkParticles = () => Array.from({ length: 10 }, (_, i) => ({
	id: i,
	left: r() * 100,
	top: r() * 100,
	dur: 4 + r() * 4,
	delay: r() * 4,
	depth: 0.2 + r() * 0.8,   // parallax depth (0 = stationary, 1 = full move)
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
		top: isTop ? r() * 30 : 70 + r() * 30,
		dur: 8 + r() * 6,
		delay: r() * 6,
		depth: 0.1 + r() * 0.4,
	}
})

const mkCode = () => RUST_SNIPPETS.map((code, i) => ({
	id: i,
	code,
	left: i % 2 === 0 ? r() * 18 : 82 + r() * 14,
	top: 18 + i * 14 + r() * 8,
	dur: 7 + r() * 4,
	delay: i * 1.8,
	depth: 0.05 + r() * 0.15,
}))

const mkDots = () => Array.from({ length: 8 }, (_, i) => ({
	id: i,
	left: r() * 100,
	top: r() * 100,
	dur: 2 + r() * 2,
	delay: r() * 3,
}))

// ── Generate once at module level — never changes between server and client ──
const PARTICLES = mkParticles()
const SHAPES = mkShapes()
const CODES = mkCode()
const DOTS = mkDots()

export default function BackgroundAnimation() {
	const containerRef = useRef<HTMLDivElement>(null)
	const particleRefs = useRef<(HTMLDivElement | null)[]>([])
	const shapeRefs = useRef<(HTMLDivElement | null)[]>([])
	const codeRefs = useRef<(HTMLDivElement | null)[]>([])
	// Stores the last smoothed mouse position to avoid redundant gsap.set calls
	const mouseX = useRef(0)
	const mouseY = useRef(0)
	// Tracks the mouse position that was last applied, so we skip frames with no change
	const appliedX = useRef(0)
	const appliedY = useRef(0)
	const rafRef = useRef<number | null>(null)

	const particles = PARTICLES
	const shapes = SHAPES
	const codes = CODES
	const dots = DOTS

	// ── Fade in container immediately ─────────────────────────
	useEffect(() => {
		if (!containerRef.current) return
		gsap.fromTo(containerRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: 1.2, ease: "power2.out" }
		)
	}, [])

	// ── GSAP floating animations ────────────────────────────────────────────────
	useEffect(() => {
		const ctx = gsap.context(() => {

			// Particles — float up/down with slight x drift
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

			// Shapes — slow rotation + float
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

			// Code snippets — drift + fade
			codeRefs.current.forEach((el, i) => {
				if (!el) return
				const c = codes[i]
				gsap.fromTo(el,
					{ opacity: 0.1, x: 0 },
					{
						opacity: 0.5,
						x: 10,
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

	// ── Mouse parallax ──────────────────────────────────────────────────────────
	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			// Normalise to -1 → +1 from center
			mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2
			mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2
		}

		const MOVE_THRESHOLD = 0.004 // skip RAF work if mouse barely moved

		const tick = () => {
			const mx = mouseX.current
			const my = mouseY.current

			// Skip the whole batch if the mouse hasn't moved meaningfully —
			// this eliminates the constant 60fps gsap.to() spam when idle
			if (
				Math.abs(mx - appliedX.current) > MOVE_THRESHOLD ||
				Math.abs(my - appliedY.current) > MOVE_THRESHOLD
			) {
				appliedX.current = mx
				appliedY.current = my

				// Use gsap.set (instant, no tween object created) for the
				// parallax offset so we don't pile up hundreds of short tweens.
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
			className="fixed inset-0 pointer-events-none overflow-hidden"
			style={{ opacity: 0 }}   // starts transparent — GSAP fades it in
		>
			{/* Grid */}
			<div
				className="absolute inset-0 opacity-15"
				style={{
					backgroundImage: `
            linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px)
          `,
					backgroundSize: "50px 50px"
				}}
			/>

			{/* Particles */}
			{particles.map((p, i) => (
				<div
					key={`p-${p.id}`}
					ref={el => { particleRefs.current[i] = el }}
					className="absolute w-1 h-1 bg-cyan-400 rounded-full"
					style={{
						left: `${p.left}%`,
						top: `${p.top}%`,
						opacity: 0.5 + p.depth * 0.3,
						willChange: "transform",
					}}
				/>
			))}

			{/* Geometric shapes */}
			{shapes.map((s, i) => (
				<div
					key={`s-${s.id}`}
					ref={el => { shapeRefs.current[i] = el }}
					className="absolute opacity-25"
					style={{
						left: `${s.left}%`,
						top: `${s.top}%`,
						willChange: "transform",
					}}
				>
					{s.type === 0 && (
						<div className="border border-cyan-400"
							style={{ width: s.size, height: s.size }} />
					)}
					{s.type === 1 && (
						<div className="border border-pink-500 rounded-full"
							style={{ width: s.size, height: s.size }} />
					)}
					{s.type === 2 && (
						<div style={{
							width: 0, height: 0,
							borderLeft: `${s.size / 2}px solid transparent`,
							borderRight: `${s.size / 2}px solid transparent`,
							borderBottom: `${s.size}px solid rgba(255,20,147,0.55)`,
						}} />
					)}
				</div>
			))}

			{/* Rust code snippets */}
			{codes.map((c, i) => (
				<div
					key={`c-${c.id}`}
					ref={el => { codeRefs.current[i] = el }}
					className="absolute text-xs font-mono text-cyan-300 whitespace-nowrap select-none"
					style={{
						left: `${c.left}%`,
						top: `${c.top}%`,
						opacity: 0.1,
						willChange: "transform, opacity",
					}}
				>
					{c.code}
				</div>
			))}

			{/* Pulsing dots */}
			{dots.map(d => (
				<div
					key={`d-${d.id}`}
					className="absolute w-2 h-2 rounded-full animate-pulse"
					style={{
						left: `${d.left}%`,
						top: `${d.top}%`,
						background: "linear-gradient(135deg, #FF1493, #00FFFF)",
						opacity: 0.4,
						animationDuration: `${d.dur}s`,
						animationDelay: `${d.delay}s`,
					}}
				/>
			))}

			{/* Radial glow — follows no one, just ambient */}
			<div className="absolute inset-0"
				style={{
					background: "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,20,147,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(0,255,255,0.04) 0%, transparent 70%)"
				}}
			/>
		</div>
	)
}
