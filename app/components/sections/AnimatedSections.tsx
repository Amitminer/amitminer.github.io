/**
 * AnimatedSections — single source of truth for all scroll animations.
 *
 * Each section gets its own tailored animation:
 *  #hero        → immediate on load (already visible)
 *  #about       → slide in from left (typewriter untouched)
 *  #tech-stack  → groups cascade from bottom, icon bounce on hover
 *  #github-stats→ stat cards fan in diagonally
 *  #projects    → diagonal cascade per card, MutationObserver for tab switches
 *  #languages   → scale + glow reveal
 *  #contact     → social icons spin in, form fields stagger
 *  #support     → scale up from bottom
 */

"use client"
import { useRef, useEffect, useCallback } from "react"
import type React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const EASE_REVEAL = "expo.out"
const EASE_POP = "back.out(1.4)"
const DUR_FAST = 0.5
const DUR_MED = 0.7
const DUR_SLOW = 0.9
const STAGGER_SM = 0.06
const STAGGER_MD = 0.08

const inVP = (el: Element) => {
	const r = el.getBoundingClientRect()
	return r.top < window.innerHeight * 0.98 && r.bottom > 0
}

export default function AnimatedSections({ children }: { children: React.ReactNode }) {
	const containerRef = useRef<HTMLDivElement>(null)
	const cursorRef = useRef<HTMLDivElement>(null)
	const cleanupRef = useRef<(() => void)[]>([])
	const addCleanup = useCallback((fn: () => void) => { cleanupRef.current.push(fn) }, [])

	const isDesktop = useCallback(() =>
		window.innerWidth >= 1024 &&
		window.matchMedia("(pointer: fine)").matches &&
		!("ontouchstart" in window)
		, [])

	const reducedMotion = useCallback(() =>
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
		, [])

	// Page restore — un-hide anything stuck invisible
	useEffect(() => {
		const restore = () => setTimeout(() => {
			document.querySelectorAll<HTMLElement>(
				".animated-section, .project-card, .stat-card, .contact-card, #about, #tech-stack, #github-stats, #projects, #languages, #contact, #support"
			).forEach(el => {
				if (inVP(el)) gsap.set(el, { clearProps: "opacity,transform,x,y,scale,rotation" })
			})
			ScrollTrigger.refresh()
		}, 50)

		const onShow = () => restore()
		document.addEventListener("visibilitychange", restore)
		window.addEventListener("pageshow", onShow)
		window.addEventListener("focus", restore)
		addCleanup(() => {
			document.removeEventListener("visibilitychange", restore)
			window.removeEventListener("pageshow", onShow)
			window.removeEventListener("focus", restore)
		})
	}, [addCleanup])

	useEffect(() => {
		const rafId = requestAnimationFrame(() => {
			const ctx = gsap.context(() => {
				const container = containerRef.current!
				const desktop = isDesktop()
				const reduced = reducedMotion()

				gsap.defaults({ overwrite: "auto" })

				// ── Progress bar ────────────────────────────────
				if (desktop) {
					const bar = document.createElement("div")
					Object.assign(bar.style, {
						position: "fixed", top: "0", left: "0", width: "0%", height: "3px",
						background: "linear-gradient(90deg,#FF1493,#00FFFF)",
						boxShadow: "0 0 10px rgba(255,20,147,0.5)",
						zIndex: "1000", pointerEvents: "none"
					})
					document.body.appendChild(bar)
					addCleanup(() => bar.remove())
					ScrollTrigger.create({
						trigger: document.body, start: "top top", end: "bottom bottom",
						onUpdate: s => { bar.style.width = s.progress * 100 + "%" }
					})
				}

				// ── HERO ────────────────────────────────────────
				// Already in viewport — animate on load, no ScrollTrigger
				const hero = container.querySelector<HTMLElement>("#hero")
				if (hero && !reduced) {
					const img = hero.querySelector<HTMLElement>("[class*='w-32'][class*='h-32'], [class*='w-40'], [class*='w-48']")
					const h1 = hero.querySelector<HTMLElement>("h1")
					const p = hero.querySelector<HTMLElement>("p")
					const btns = hero.querySelectorAll<HTMLElement>(".flex.flex-col.sm\\:flex-row > *")
					const heroTl = gsap.timeline({ delay: 0.15, defaults: { ease: EASE_REVEAL } })

					if (img) { gsap.set(img, { opacity: 0, scale: 0.75, rotation: -12 }); heroTl.to(img, { opacity: 1, scale: 1, rotation: 0, duration: DUR_SLOW, ease: EASE_POP }, 0) }
					if (h1) { gsap.set(h1, { opacity: 0, y: 32 }); heroTl.to(h1, { opacity: 1, y: 0, duration: DUR_MED }, 0.25) }
					if (p) { gsap.set(p, { opacity: 0, y: 20 }); heroTl.to(p, { opacity: 1, y: 0, duration: DUR_MED }, 0.38) }
					if (btns.length) {
						gsap.set(btns, { opacity: 0, y: 18 })
						heroTl.to(btns, { opacity: 1, y: 0, duration: DUR_FAST, ease: EASE_POP, stagger: STAGGER_SM }, 0.52)
					}
				}

				// ── ABOUT ───────────────────────────────────────
				const about = container.querySelector<HTMLElement>("#about")
				if (about) {
					gsap.set(about, { opacity: 1 })

					const h2 = about.querySelector<HTMLElement>("h2")
					const card = about.querySelector<HTMLElement>("[class*='max-w-3xl']")

					if (h2 && !inVP(h2) && !reduced) {
						gsap.set(h2, { opacity: 0, x: -40 })
						const h2In = gsap.to(h2, { opacity: 1, x: 0, duration: DUR_MED, ease: EASE_REVEAL, paused: true })
						const h2Out = gsap.to(h2, { opacity: 0, x: 20, duration: DUR_FAST, ease: "power2.in", paused: true })
						ScrollTrigger.create({
							trigger: h2, start: "top 88%", end: "bottom 10%",
							onEnter: () => { h2Out.pause(0); h2In.restart() },
							onLeave: () => { h2In.pause(0); h2Out.restart() },
							onEnterBack: () => { h2Out.pause(0); h2In.restart() },
							onLeaveBack: () => { h2In.pause(0); gsap.set(h2, { opacity: 0, x: -40 }) }
						})
					}
					if (card && !inVP(card) && !reduced) {
						gsap.set(card, { opacity: 0, x: -50 })
						const cardIn = gsap.to(card, { opacity: 1, x: 0, duration: DUR_SLOW, ease: EASE_REVEAL, paused: true })
						const cardOut = gsap.to(card, { opacity: 0, x: 25, duration: DUR_FAST, ease: "power2.in", paused: true })
						ScrollTrigger.create({
							trigger: card, start: "top 88%", end: "bottom 10%",
							onEnter: () => { cardOut.pause(0); cardIn.restart() },
							onLeave: () => { cardIn.pause(0); cardOut.restart() },
							onEnterBack: () => { cardOut.pause(0); cardIn.restart() },
							onLeaveBack: () => { cardIn.pause(0); gsap.set(card, { opacity: 0, x: -50 }) }
						})
					}
				}

				// ── TECH STACK ──────────────────────────────────
				const tech = container.querySelector<HTMLElement>("#tech-stack")
				if (tech) {
					const h2 = tech.querySelector<HTMLElement>("h2")
					const groups = tech.querySelectorAll<HTMLElement>("[class*='rounded-lg'][class*='bg-secondary']")

					if (h2 && !inVP(h2) && !reduced) {
						gsap.set(h2, { opacity: 0, y: 25 })
						gsap.to(h2, {
							opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL,
							scrollTrigger: { trigger: h2, start: "top 95%" }
						})
					}

					groups.forEach((g, i) => {
						if (inVP(g) || reduced) return
						gsap.set(g, { opacity: 0, y: 45, scale: 0.92 })

						// Entrance tween
						const tween = gsap.to(g, {
							opacity: 1, y: 0, scale: 1, duration: DUR_MED,
							delay: i * STAGGER_MD, ease: EASE_POP, paused: true
						})

						// Exit tween — faster, slides back up slightly
						const exitTween = gsap.to(g, {
							opacity: 0, y: -25, scale: 0.95, duration: DUR_FAST,
							ease: "power2.in", paused: true
						})

						ScrollTrigger.create({
							trigger: g, start: "top 120%", end: "bottom 10%",
							onEnter: () => { exitTween.pause(0); tween.restart() },
							onLeave: () => { tween.pause(0); exitTween.restart() },
							onEnterBack: () => { exitTween.pause(0); tween.restart() },
							onLeaveBack: () => { tween.pause(0); gsap.set(g, { opacity: 0, y: 45, scale: 0.92 }) }
						})

						// Icon hover bounce
						g.querySelectorAll<HTMLElement>("[class*='text-2xl']").forEach(icon => {
							const onIn = () => gsap.to(icon, { scale: 1.35, duration: 0.18, ease: "back.out(2)" })
							const onOut = () => gsap.to(icon, { scale: 1, duration: 0.2, ease: "power2.out" })
							icon.addEventListener("mouseenter", onIn)
							icon.addEventListener("mouseleave", onOut)
							addCleanup(() => { icon.removeEventListener("mouseenter", onIn); icon.removeEventListener("mouseleave", onOut) })
						})
					})
				}

				// ── GITHUB STATS ────────────────────────────────
				const ghStats = container.querySelector<HTMLElement>("#github-stats")
				if (ghStats) {
					const h2 = ghStats.querySelector<HTMLElement>("h2")
					if (h2 && !inVP(h2) && !reduced) {
						gsap.set(h2, { opacity: 0, y: 25 })
						gsap.to(h2, {
							opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL,
							scrollTrigger: { trigger: h2, start: "top 88%", toggleActions: "play none none reverse" }
						})
					}

					const animateStatCard = (card: HTMLElement, i: number) => {
						if (card.dataset.ga || reduced) return
						card.dataset.ga = "1"
						const col = i % 3
						const xFrom = (col - 1) * 25
						const alreadyVisible = inVP(card)
						gsap.set(card, { opacity: 0, y: alreadyVisible ? 20 : 55, x: xFrom, scale: 0.87 })

						if (alreadyVisible) {
							// Cached data — just play immediately
							gsap.to(card, { opacity: 1, y: 0, x: 0, scale: 1, duration: DUR_SLOW, delay: i * 0.07, ease: EASE_POP })
							return
						}

						const tween = gsap.to(card, { opacity: 1, y: 0, x: 0, scale: 1, duration: DUR_SLOW, delay: i * 0.07, ease: EASE_POP, paused: true })
						const exitTween = gsap.to(card, { opacity: 0, y: -20, x: xFrom * 0.5, scale: 0.93, duration: DUR_FAST, ease: "power2.in", paused: true })

						ScrollTrigger.create({
							trigger: card, start: "top 88%", end: "bottom 10%",
							onEnter: () => { exitTween.pause(0); tween.restart() },
							onLeave: () => { tween.pause(0); exitTween.restart() },
							onEnterBack: () => { exitTween.pause(0); tween.restart() },
							onLeaveBack: () => { tween.pause(0); gsap.set(card, { opacity: 0, y: 55, x: xFrom, scale: 0.87 }) }
						})
					}

					// Animate any cards already in DOM (cached data case)
					ghStats.querySelectorAll<HTMLElement>("#stat-card, .stat-card").forEach(animateStatCard)

					// Fresh fetch case — GitHubStats dispatches "github-stats-ready" when data loads
					const onStatsReady = () => {
						// Wait one frame for React to commit the new cards to the DOM
						requestAnimationFrame(() => {
							ghStats.querySelectorAll<HTMLElement>("#stat-card, .stat-card").forEach((card, i) => {
								// Reset the ga flag so fresh cards can be re-animated
								delete card.dataset.ga
								animateStatCard(card, i)
							})
							ScrollTrigger.refresh()
						})
					}
					window.addEventListener("github-stats-ready", onStatsReady)
					addCleanup(() => window.removeEventListener("github-stats-ready", onStatsReady))
				}

				// ── PROJECTS ────────────────────────────────────
				const proj = container.querySelector<HTMLElement>("#projects")
				if (proj) {
					const h2 = proj.querySelector<HTMLElement>("h2")
					const tabs = proj.querySelector<HTMLElement>("[class*='bg-gray-800\\/50'][class*='rounded-full']")

					if (h2 && !inVP(h2) && !reduced) {
						gsap.set(h2, { opacity: 0, y: 22 })
						gsap.to(h2, { opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL, scrollTrigger: { trigger: h2, start: "top 88%" } })
					}
					if (tabs && !inVP(tabs) && !reduced) {
						gsap.set(tabs, { opacity: 0, scale: 0.88 })
						gsap.to(tabs, { opacity: 1, scale: 1, duration: DUR_MED, ease: EASE_POP, scrollTrigger: { trigger: tabs, start: "top 90%" } })
					}

					const animateCard = (el: HTMLElement, i: number) => {
						if (inVP(el) || el.dataset.ga || reduced) return
						el.dataset.ga = "1"
						const col = i % 3
						const xFrom = col === 0 ? -35 : col === 2 ? 35 : 0
						gsap.set(el, { opacity: 0, y: 55, x: xFrom, scale: 0.88 })

						const tween = gsap.to(el, { opacity: 1, y: 0, x: 0, scale: 1, duration: DUR_MED, delay: col * 0.07, ease: EASE_POP, paused: true })
						const exitTween = gsap.to(el, { opacity: 0, y: -20, scale: 0.93, duration: DUR_FAST, ease: "power2.in", paused: true })

						ScrollTrigger.create({
							trigger: el, start: "top 88%", end: "bottom 10%",
							onEnter: () => { exitTween.pause(0); tween.restart() },
							onLeave: () => { tween.pause(0); exitTween.restart() },
							onEnterBack: () => { exitTween.pause(0); tween.restart() },
							onLeaveBack: () => { tween.pause(0); gsap.set(el, { opacity: 0, y: 55, x: xFrom, scale: 0.88 }) }
						})
					}

					proj.querySelectorAll<HTMLElement>(".animated-section").forEach((el, i) => {
						const inner = el.querySelector<HTMLElement>("[class*='rounded-xl']") || el
						animateCard(inner, i)
					})

					// Re-animate on tab switch
					const mo = new MutationObserver(() => {
						proj.querySelectorAll<HTMLElement>(".animated-section").forEach((el, i) => {
							const inner = el.querySelector<HTMLElement>("[class*='rounded-xl']") || el
							if (!inner.dataset.ga) { animateCard(inner, i); ScrollTrigger.refresh() }
						})
					})
					mo.observe(proj, { childList: true, subtree: true })
					addCleanup(() => mo.disconnect())
				}

				// ── LANGUAGES ───────────────────────────────────
				const lang = container.querySelector<HTMLElement>("#languages")
				if (lang) {
					const h2 = lang.querySelector<HTMLElement>("h2")
					const imgWrap = lang.querySelector<HTMLElement>("[class*='rounded-xl']")

					if (h2 && !inVP(h2) && !reduced) {
						gsap.set(h2, { opacity: 0, y: 22 })
						gsap.to(h2, { opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL, scrollTrigger: { trigger: h2, start: "top 88%" } })
					}
					if (imgWrap && !inVP(imgWrap) && !reduced) {
						gsap.set(imgWrap, { opacity: 0, scale: 0.82, y: 35 })
						const tween = gsap.to(imgWrap, { opacity: 1, scale: 1, y: 0, duration: DUR_SLOW, ease: EASE_POP, paused: true })
						const exitTween = gsap.to(imgWrap, { opacity: 0, y: -25, scale: 0.92, duration: DUR_FAST, ease: "power2.in", paused: true })
						ScrollTrigger.create({
							trigger: imgWrap, start: "top 88%", end: "bottom 10%",
							onEnter: () => { exitTween.pause(0); tween.restart() },
							onLeave: () => { tween.pause(0); exitTween.restart() },
							onEnterBack: () => { exitTween.pause(0); tween.restart() },
							onLeaveBack: () => { tween.pause(0); gsap.set(imgWrap, { opacity: 0, scale: 0.82, y: 35 }) }
						})
					}
				}

				// ── CONTACT ─────────────────────────────────────
				const contact = container.querySelector<HTMLElement>("#contact")
				if (contact && !reduced) {
					const h2 = contact.querySelector<HTMLElement>("h2")
					const icons = Array.from(contact.querySelectorAll<HTMLElement>(".social-icon"))
					const email = contact.querySelector<HTMLElement>("input[type='email']")
					const msg = contact.querySelector<HTMLElement>("textarea")
					const submit = contact.querySelector<HTMLElement>("button[type='submit']")

					// ── Heading ──
					if (h2 && !inVP(h2)) {
						gsap.set(h2, { opacity: 0, y: 22 })
						const h2In = gsap.to(h2, { opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL, paused: true })
						const h2Out = gsap.to(h2, { opacity: 0, y: -18, duration: DUR_FAST, ease: "power2.in", paused: true })
						ScrollTrigger.create({
							trigger: h2, start: "top 90%", end: "bottom 10%",
							onEnter: () => { h2Out.pause(0); h2In.restart() },
							onLeave: () => { h2In.pause(0); h2Out.restart() },
							onEnterBack: () => { h2Out.pause(0); h2In.restart() },
							onLeaveBack: () => { h2In.pause(0); gsap.set(h2, { opacity: 0, y: 22 }) }
						})
					}

					// ── Social icons — spin in, spin out ──
					const hiddenIcons = icons.filter(el => !inVP(el))
					if (hiddenIcons.length) {
						gsap.set(hiddenIcons, { opacity: 0, scale: 0, rotation: -30 })
						const iconsIn = gsap.to(hiddenIcons, {
							opacity: 1, scale: 1, rotation: 0,
							duration: DUR_FAST, ease: EASE_POP,
							stagger: STAGGER_SM, paused: true
						})
						const iconsOut = gsap.to(hiddenIcons, {
							opacity: 0, scale: 0.5, rotation: 20,
							duration: DUR_FAST * 0.7, ease: "power2.in",
							stagger: { amount: 0.2, from: "end" }, paused: true
						})
						ScrollTrigger.create({
							trigger: contact, start: "top 85%", end: "bottom 20%",
							onEnter: () => { iconsOut.pause(0); iconsIn.restart() },
							onLeave: () => { iconsIn.pause(0); iconsOut.restart() },
							onEnterBack: () => { iconsOut.pause(0); iconsIn.restart() },
							onLeaveBack: () => { iconsIn.pause(0); gsap.set(hiddenIcons, { opacity: 0, scale: 0, rotation: -30 }) }
						})
					}

					// ── Form fields — stagger in from alternating sides ──
					const fieldPairs: [HTMLElement | null, number][] = [
						[email, 0],
						[msg, 1],
						[submit, 2],
					]
					fieldPairs.forEach(([el, i]) => {
						if (!el || inVP(el)) return
						const xFrom = i % 2 === 0 ? -24 : 24
						gsap.set(el, { opacity: 0, x: xFrom, y: 12 })
						const inTween = gsap.to(el, { opacity: 1, x: 0, y: 0, duration: DUR_MED, delay: i * 0.1, ease: EASE_REVEAL, paused: true })
						const outTween = gsap.to(el, { opacity: 0, x: xFrom * 0.5, y: -10, duration: DUR_FAST, ease: "power2.in", paused: true })
						ScrollTrigger.create({
							trigger: el, start: "top 88%", end: "bottom 10%",
							onEnter: () => { outTween.pause(0); inTween.restart() },
							onLeave: () => { inTween.pause(0); outTween.restart() },
							onEnterBack: () => { outTween.pause(0); inTween.restart() },
							onLeaveBack: () => { inTween.pause(0); gsap.set(el, { opacity: 0, x: xFrom, y: 12 }) }
						})
					})
				}

				// ── SUPPORT ─────────────────────────────────────
				const support = container.querySelector<HTMLElement>("#support")
				if (support && !inVP(support) && !reduced) {
					const h2 = support.querySelector<HTMLElement>("h2")
					const p = support.querySelector<HTMLElement>("p")
					const btn = support.querySelector<HTMLElement>("button")

					if (h2) {
						gsap.set(h2, { opacity: 0, y: 30, scale: 0.92 })
						gsap.to(h2, {
							opacity: 1, y: 0, scale: 1, duration: DUR_MED, ease: EASE_POP,
							scrollTrigger: { trigger: h2, start: "top 88%", toggleActions: "play none none reverse" }
						})
					}
					if (p) {
						gsap.set(p, { opacity: 0, y: 20 })
						gsap.to(p, {
							opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL,
							scrollTrigger: { trigger: p, start: "top 90%", toggleActions: "play none none reverse" }
						})
					}
					if (btn) {
						gsap.set(btn, { opacity: 0, scale: 0.8, y: 20 })
						gsap.to(btn, {
							opacity: 1, scale: 1, y: 0, duration: DUR_SLOW, ease: EASE_POP,
							scrollTrigger: { trigger: btn, start: "top 92%", toggleActions: "play none none reverse" }
						})
						// Subtle pulse after reveal
						ScrollTrigger.create({
							trigger: btn,
							start: "top 92%",
							onEnter: () => {
								gsap.to(btn, {
									scale: 1.04, duration: 0.6, ease: "sine.inOut",
									yoyo: true, repeat: 3, delay: DUR_SLOW
								})
							}
						})
						// Hover handled by GSAP
						const onIn = () => gsap.to(btn, { scale: 1.06, y: -4, duration: 0.22, ease: "back.out(2)" })
						const onOut = () => gsap.to(btn, { scale: 1, y: 0, duration: 0.22, ease: "power2.out" })
						btn.addEventListener("mouseenter", onIn)
						btn.addEventListener("mouseleave", onOut)
						addCleanup(() => { btn.removeEventListener("mouseenter", onIn); btn.removeEventListener("mouseleave", onOut) })
					}
				}

				// ── FALLBACK — .animated-section wrappers ───────
				container.querySelectorAll<HTMLElement>(".animated-section").forEach(sec => {
					if (sec.closest("#projects")) return
					if (inVP(sec)) { gsap.set(sec, { opacity: 1 }); return }
					if (sec.dataset.ga) return
					sec.dataset.ga = "1"
					gsap.set(sec, { opacity: 0, y: 28 })

					const tween = gsap.to(sec, { opacity: 1, y: 0, duration: DUR_MED, ease: EASE_REVEAL, paused: true })
					const exitTween = gsap.to(sec, { opacity: 0, y: -20, duration: DUR_FAST, ease: "power2.in", paused: true })

					ScrollTrigger.create({
						trigger: sec, start: "top 88%", end: "bottom 10%",
						onEnter: () => { exitTween.pause(0); tween.restart() },
						onLeave: () => { tween.pause(0); exitTween.restart() },
						onEnterBack: () => { exitTween.pause(0); tween.restart() },
						onLeaveBack: () => { tween.pause(0); gsap.set(sec, { opacity: 0, y: 28 }) }
					})
				})

				// ── CUSTOM CURSOR ───────────────────────────────
				if (desktop) {
					const cursor = cursorRef.current
					if (cursor) {
						const move = (e: MouseEvent) => gsap.set(cursor, { x: e.clientX, y: e.clientY })
						document.addEventListener("mousemove", move)
						addCleanup(() => document.removeEventListener("mousemove", move))

						container.querySelectorAll("a, button, .project-card, .stat-card").forEach(el => {
							const onIn = () => gsap.to(cursor, { scale: 2.5, background: "rgba(255,20,147,0.7)", duration: 0.2 })
							const onOut = () => gsap.to(cursor, { scale: 1, background: "rgba(0,255,255,0.4)", duration: 0.2 })
							el.addEventListener("mouseenter", onIn)
							el.addEventListener("mouseleave", onOut)
							addCleanup(() => { el.removeEventListener("mouseenter", onIn); el.removeEventListener("mouseleave", onOut) })
						})
					}
				}

				// ── BACKGROUND MORPH ────────────────────────────
				const bg = document.createElement("div")
				Object.assign(bg.style, {
					position: "fixed", inset: "0", pointerEvents: "none", zIndex: "-1",
					background: "linear-gradient(135deg,rgba(255,20,147,0.02) 0%,transparent 30%,rgba(0,255,255,0.02) 70%,transparent 100%)"
				})
				document.body.appendChild(bg)
				addCleanup(() => bg.remove())
				ScrollTrigger.create({
					trigger: document.body, start: "top top", end: "bottom bottom",
					onUpdate: s => {
						const p = s.progress
						bg.style.background = `linear-gradient(${135 + p * 120}deg,
              rgba(255,20,147,${0.02 + p * 0.015}) 0%,transparent 30%,
              rgba(0,255,255,${0.02 + p * 0.015}) 70%,transparent 100%)`
					}
				})

				setTimeout(() => ScrollTrigger.refresh(), 200)

			}, containerRef)

			return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
		})

		return () => { cancelAnimationFrame(rafId) }
	}, [isDesktop, reducedMotion, addCleanup])

	useEffect(() => {
		return () => {
			cleanupRef.current.forEach(fn => { try { fn() } catch { } })
			cleanupRef.current = []
			ScrollTrigger.getAll().forEach(t => t.kill())
			gsap.killTweensOf("*")
		}
	}, [])

	return (
		<div ref={containerRef} className="relative">
			<div
				ref={cursorRef}
				className="fixed w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-screen hidden lg:block"
				style={{
					backgroundColor: "rgba(0,255,255,0.4)",
					transform: "translate(-50%,-50%)",
					backdropFilter: "blur(2px)",
					boxShadow: "0 0 20px rgba(0,255,255,0.5)",
					willChange: "transform"
				}}
			/>
			{children}
		</div>
	)
}
