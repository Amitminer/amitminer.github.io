/**
 * Languages Component
 *
 * Receives topLanguages data from GitHubStats parent (zero extra API calls).
 * Design: segmented stacked bar + legend grid (dot + name + %).
 * Animations via GSAP — segments expand from left, legend items fade/slide in.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

function onCustomEvent<T>(
	name: string,
	handler: (detail: T) => void,
): EventListener {
	return (e: Event) => handler((e as CustomEvent<T>).detail);
}

// ── Language → colour mapping ─────────────────────────────────────────────────
const LANG_COLORS: Record<string, { solid: string; glow: string }> = {
	TypeScript: { solid: '#3178C6', glow: 'rgba(49,120,198,0.22)' }, // official TS blue
	Rust: { solid: '#DEA584', glow: 'rgba(222,165,132,0.22)' }, // rust-like copper
	Python: { solid: '#3776AB', glow: 'rgba(55,118,171,0.22)' }, // python blue
	PHP: { solid: '#777BB4', glow: 'rgba(119,123,180,0.22)' }, // official PHP purple
	'C++': { solid: '#00599C', glow: 'rgba(0,89,156,0.22)' }, // C++ blue
	Shell: { solid: '#89E051', glow: 'rgba(137,224,81,0.22)' }, // github shell green
};

const LANG_ABBR: Record<string, string> = {
	JavaScript: 'JS',
	TypeScript: 'TS',
	Rust: 'Rs',
	'C++': 'C++',
	Python: 'Py',
	Shell: 'Sh',
};

const FALLBACK = { solid: '#4B5563', glow: 'rgba(75,85,99,0.15)' };
const getLangColor = (name: string) => LANG_COLORS[name] ?? FALLBACK;
const abbr = (name: string) => LANG_ABBR[name] ?? name;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const LanguagesSkeleton = () => (
	<div>
		<div className="lg:hidden">
			<div className="w-full h-5 rounded-full bg-white/5 overflow-hidden animate-pulse mb-5" />
			<div className="mb-4 h-px w-full bg-white/5" />
			<div className="grid grid-cols-2 gap-x-5 gap-y-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="flex items-center gap-2.5">
						<div className="w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse shrink-0" />
						<div className="h-3 rounded bg-white/10 animate-pulse" style={{ width: `${44 + (i % 3) * 16}px` }} />
						<div className="h-3 w-8 rounded bg-white/6 animate-pulse ml-auto" />
					</div>
				))}
			</div>
		</div>
		<div className="hidden lg:flex lg:gap-8 lg:items-stretch">
			<div className="flex-1 flex items-end gap-2.5 h-60">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
						<div
							className="w-full rounded-t bg-white/10 animate-pulse"
							style={{ height: `${20 + (i % 5) * 16}%` }}
						/>
						<div className="h-3 w-8 rounded bg-white/[0.07] animate-pulse" />
					</div>
				))}
			</div>
			<div className="w-px self-stretch bg-white/5" />
			<div className="w-64 grid grid-cols-2 gap-x-6 gap-y-3.5 content-center">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="flex items-center gap-2.5">
						<div className="w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse shrink-0" />
						<div className="h-3 rounded bg-white/10 animate-pulse" style={{ width: `${48 + (i % 3) * 16}px` }} />
						<div className="h-3 w-9 rounded bg-white/6 animate-pulse ml-auto" />
					</div>
				))}
			</div>
		</div>
	</div>
);

// ── Segmented bar ─────────────────────────────────────────────────────────────
interface Segment { name: string; pct: number }

interface SegmentedBarProps {
	segments: Segment[];
	shouldAnimate: boolean;
}

const SegmentedBar = ({ segments, shouldAnimate }: SegmentedBarProps) => {
	const segMap = useRef<Map<string, HTMLDivElement>>(new Map());
	const didAnim = useRef(false);
	const segKey = segments.map((s) => s.name).join(',');

	// Re-arm animation when the segment list changes (e.g. data refresh)
	useEffect(() => {
		didAnim.current = false;
	}, [segKey]);

	// Re-arm + collapse when shouldAnimate resets so bars expand again on re-entry
	useEffect(() => {
		if (!shouldAnimate) {
			didAnim.current = false;
			segMap.current.forEach(el => gsap.set(el, { width: '0%' }));
		}
	}, [shouldAnimate]);

	const setRef = useCallback(
		(name: string) => (el: HTMLDivElement | null) => {
			if (el) segMap.current.set(name, el);
			else segMap.current.delete(name);
		},
		[],
	);

	useEffect(() => {
		if (!shouldAnimate || didAnim.current) return;
		didAnim.current = true;

		segments.forEach((seg, i) => {
			const el = segMap.current.get(seg.name);
			if (!el) return;
			gsap.fromTo(
				el,
				{ width: '0%' },
				{
					width: `${seg.pct}%`,
					duration: 0.55,
					delay: i * 0.03,
					ease: 'power3.out',
					onComplete: () => { el.style.willChange = 'auto'; },
				},
			);
		});
	}, [shouldAnimate, segments]);

	return (
		<div
			className="relative w-full h-5 rounded-full overflow-hidden flex gap-0"
			style={{ background: 'rgba(255,255,255,0.04)' }}
			role="img"
			aria-label="Language usage breakdown"
		>
			{segments.map((seg, i) => {
				const color = getLangColor(seg.name);
				return (
					<div
						key={seg.name}
						ref={setRef(seg.name)}
						className="h-full relative group/seg transition-[filter] duration-200 hover:brightness-125"
						style={{
							width: shouldAnimate ? '0%' : `${seg.pct}%`,
							backgroundColor: color.solid,
							boxShadow: i > 0 ? 'inset 1px 0 0 rgba(0,0,0,0.35)' : undefined,
							willChange: shouldAnimate ? 'width' : 'auto',
						}}
						title={`${seg.name} ${seg.pct.toFixed(1)}%`}
					>
						<div
							className="absolute inset-0 opacity-0 group-hover/seg:opacity-100 transition-opacity duration-200"
							style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)' }}
						/>
					</div>
				);
			})}
		</div>
	);
};

// ── Vertical bar chart (desktop only) ────────────────────────────────────────
interface VerticalBarsProps {
	segments: Segment[];
	shouldAnimate: boolean;
}

const VerticalBars = ({ segments, shouldAnimate }: VerticalBarsProps) => {
	const barMap = useRef<Map<string, HTMLDivElement>>(new Map());
	const didAnim = useRef(false);
	const segKey = segments.map((s) => s.name).join(',');

	// Re-arm animation when the segment list changes (e.g. data refresh)
	useEffect(() => {
		didAnim.current = false;
	}, [segKey]);

	// Re-arm + collapse when shouldAnimate resets so bars grow again on re-entry
	useEffect(() => {
		if (!shouldAnimate) {
			didAnim.current = false;
			barMap.current.forEach(el => gsap.set(el, { height: '0%' }));
		}
	}, [shouldAnimate]);

	const setRef = useCallback(
		(name: string) => (el: HTMLDivElement | null) => {
			if (el) barMap.current.set(name, el);
			else barMap.current.delete(name);
		},
		[],
	);

	useEffect(() => {
		if (!shouldAnimate || didAnim.current) return;
		didAnim.current = true;
		segments.forEach((seg, i) => {
			const el = barMap.current.get(seg.name);
			if (!el) return;
			gsap.fromTo(
				el,
				{ height: '0%' },
				{
					height: `${seg.pct}%`,
					duration: 0.5,
					delay: i * 0.04,
					ease: 'power3.out',
					onComplete: () => { el.style.willChange = 'auto'; },
				},
			);
		});
	}, [shouldAnimate, segments]);

	return (
		<div className="flex items-end gap-1.5 h-56 w-full" aria-label="Language bar chart">
			{segments.map((seg) => {
				const color = getLangColor(seg.name);
				return (
					<div key={seg.name} className="flex flex-col items-center gap-1.5 flex-1 min-w-0 h-full justify-end group">
						<div
							ref={setRef(seg.name)}
							className="w-full rounded-t transition-[filter] duration-200 group-hover:brightness-125 relative"
							style={{
								height: shouldAnimate ? '0%' : `${seg.pct}%`,
								backgroundColor: color.solid,
								boxShadow: `0 0 6px 1px ${color.glow}`,
								willChange: shouldAnimate ? 'height' : 'auto',
							}}
							title={`${seg.name} ${seg.pct.toFixed(1)}%`}
						>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
								style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 60%)' }}
							/>
						</div>
						<span className="text-[10px] text-gray-500 group-hover:text-gray-200 transition-colors truncate w-full text-center font-mono leading-tight">
							{abbr(seg.name)}
						</span>
					</div>
				);
			})}
		</div>
	);
};

// ── Legend item ───────────────────────────────────────────────────────────────
interface LegendItemProps {
	name: string;
	pct: number;
	rank: number;
	shouldAnimate: boolean;
}

const LegendItem = ({ name, pct, rank, shouldAnimate }: LegendItemProps) => {
	const itemRef = useRef<HTMLDivElement>(null);
	// State (not ref) so React re-renders and removes the opacity:0 style after
	// GSAP finishes — prevents React and GSAP fighting over the opacity property.
	const [hasAnimated, setHasAnimated] = useState(false);
	const color = getLangColor(name);

	useEffect(() => {
		if (!shouldAnimate || hasAnimated || !itemRef.current) return;

		gsap.fromTo(
			itemRef.current,
			{ opacity: 0, y: 7 },
			{
				opacity: 1,
				y: 0,
				duration: 0.45,
				delay: 0.15 + rank * 0.055,
				ease: 'power2.out',
				onComplete: () => setHasAnimated(true),
			},
		);
	}, [shouldAnimate, rank, hasAnimated]);

	return (
		<div
			ref={itemRef}
			className="flex items-center gap-2.5 group cursor-default min-w-0"
			style={{ opacity: shouldAnimate && !hasAnimated ? 0 : undefined }}
		>
			<span
				className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-[1.35]"
				style={{ backgroundColor: color.solid, boxShadow: `0 0 4px 1px ${color.glow}` }}
				aria-hidden
			/>
			<span className="text-xs text-gray-300/90 font-medium group-hover:text-white transition-colors duration-150 truncate">
				{name}
			</span>
			<span className="text-[10px] text-gray-500 ml-auto tabular-nums font-mono shrink-0 group-hover:text-gray-300 transition-colors duration-150 pl-1.5">
				{pct.toFixed(1)}%
			</span>
		</div>
	);
};

// ── Main component ────────────────────────────────────────────────────────────
interface LanguagesProps {
	topLanguages?: Record<string, number> | null;
	loading?: boolean;
}

const Languages = ({ topLanguages: propTopLanguages, loading: propLoading = false }: LanguagesProps) => {
	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLHeadingElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	const isVisibleRef = useRef(false);
	const dataReadyRef = useRef(false);
	// Tracks header/card animation — fires once and never resets so the heading
	// stays visible even when bars/legend reset on scroll out.
	const headerCardFired = useRef(false);

	const [shouldAnimate, setShouldAnimate] = useState(false);

	const [internalTopLanguages, setInternalTopLanguages] = useState<Record<string, number> | null>(null);
	const [internalLoading, setInternalLoading] = useState(true);

	// Supports both prop-driven (parent passes data) and standalone (listens for
	// custom events) usage without duplicating any fetching logic.
	const topLanguages =
		propTopLanguages !== undefined ? propTopLanguages : internalTopLanguages;
	const loading =
		propTopLanguages === undefined && internalTopLanguages === null
			? internalLoading
			: propLoading;

	// Animation fires when both conditions are true: section is visible AND data
	// is ready. Either can arrive first, so both paths call this.
	// setShouldAnimate(true/false) replays bars/legend on each scroll entry.
	const tryTriggerAnimation = useCallback(() => {
		if (!isVisibleRef.current || !dataReadyRef.current) return;
		setShouldAnimate(true);
	}, []);

	useEffect(() => {
		const handleStats = onCustomEvent<{ topLanguages?: Record<string, number> }>(
			'github-stats-ready',
			(detail) => {
				if (detail?.topLanguages) {
					setInternalTopLanguages(detail.topLanguages);
					setInternalLoading(false);
					dataReadyRef.current = true;
					tryTriggerAnimation();
				}
			},
		);
		const handleError = () => setInternalLoading(false);

		window.addEventListener('github-stats-ready', handleStats);
		window.addEventListener('github-stats-error', handleError);
		return () => {
			window.removeEventListener('github-stats-ready', handleStats);
			window.removeEventListener('github-stats-error', handleError);
		};
	}, [tryTriggerAnimation]);

	// IntersectionObserver: trigger animation on enter, reset bars/legend on leave
	// so they re-animate every scroll. Header/card use headerCardFired so they stay.
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					isVisibleRef.current = true;
					tryTriggerAnimation();
				} else {
					isVisibleRef.current = false;
					setShouldAnimate(false);
				}
			},
			{ threshold: 0.08 },
		);
		const el = sectionRef.current;
		if (el) observer.observe(el);
		return () => observer.disconnect();
	}, [tryTriggerAnimation]);

	useEffect(() => {
		if (!loading && topLanguages && !dataReadyRef.current) {
			dataReadyRef.current = true;
			tryTriggerAnimation();
		}
	}, [loading, topLanguages, tryTriggerAnimation]);

	useEffect(() => {
		if (!shouldAnimate) return;

		// Header and card animate in once on first entry and stay visible —
		// they don't reset on scroll out so the heading never disappears.
		if (!headerCardFired.current) {
			headerCardFired.current = true;
			if (headerRef.current) {
				gsap.fromTo(headerRef.current,
					{ opacity: 0, y: -12 },
					{ opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
				);
			}
			if (cardRef.current) {
				gsap.fromTo(cardRef.current,
					{ opacity: 0, y: 20 },
					{ opacity: 1, y: 0, duration: 0.55, delay: 0.07, ease: 'power2.out' },
				);
			}
		}
	}, [shouldAnimate]);

	const segments = useMemo(() => {
		if (!topLanguages) return [];

		const all = Object.entries(topLanguages)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 8);

		const total = all.reduce((sum, [, v]) => sum + v, 0);

		return all.map(([name, v]) => ({
			name,
			pct: total > 0 ? (v / total) * 100 : 0,
		}));
	}, [topLanguages]);

	return (
		<section id="languages" ref={sectionRef} className="pt-10 pb-8 w-full">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<h2
					ref={headerRef}
					className="text-2xl sm:text-3xl font-bold mb-6 gradient-text text-center tracking-tight"
				>
					Most Used Languages
				</h2>

				<div className="max-w-2xl lg:max-w-3xl mx-auto">
					<div
						ref={cardRef}
						className="relative rounded-2xl p-px"
						style={{
							background:
								'linear-gradient(135deg, rgba(0,255,255,0.28) 0%, rgba(255,20,147,0.14) 50%, rgba(139,92,246,0.28) 100%)',
							boxShadow: '0 0 30px rgba(0,0,0,0.4), 0 0 60px rgba(0,255,255,0.02)',
						}}
					>
						<div
							className="relative rounded-[15px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 overflow-hidden"
							style={{ background: 'rgba(8,5,18,0.97)' }}
						>
							{[
								'top-2.5 left-2.5 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-sm',
								'top-2.5 right-2.5 border-t-2 border-r-2 border-fuchsia-500/40 rounded-tr-sm',
								'bottom-2.5 left-2.5 border-b-2 border-l-2 border-fuchsia-500/40 rounded-bl-sm',
								'bottom-2.5 right-2.5 border-b-2 border-r-2 border-cyan-400/40 rounded-br-sm',
							].map((cls, i) => (
								<span key={i} className={`pointer-events-none absolute w-4 h-4 ${cls}`} />
							))}

							<div
								className="pointer-events-none absolute inset-0 opacity-60"
								style={{
									background:
										'radial-gradient(ellipse 70% 50% at 5% 5%, rgba(0,255,255,0.03) 0%, transparent 60%),' +
										'radial-gradient(ellipse 55% 40% at 95% 95%, rgba(255,20,147,0.03) 0%, transparent 60%)',
								}}
							/>

							<div
								className="pointer-events-none absolute inset-0 opacity-[0.025]"
								style={{
									backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
								}}
							/>

							{loading || (!topLanguages && !segments.length) ? (
								<LanguagesSkeleton />
							) : segments.length === 0 ? (
								<p className="text-center text-gray-600 py-8 text-sm font-mono">
									No language data available.
								</p>
							) : (
								<>
									<div className="lg:hidden">
										<div className="mb-5">
											<SegmentedBar segments={segments} shouldAnimate={shouldAnimate} />
										</div>
										<div className="mb-4 h-px w-full bg-linear-to-r from-transparent via-white/8 to-transparent" />
										<div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
											{segments.slice(0, 6).map(({ name, pct }, i) => (
												<LegendItem key={name} name={name} pct={pct} rank={i} shouldAnimate={shouldAnimate} />
											))}
										</div>
									</div>

									<div className="hidden lg:flex lg:gap-6 lg:items-stretch">
										<div className="flex-1 min-w-0">
											<VerticalBars segments={segments} shouldAnimate={shouldAnimate} />
										</div>
										<div className="w-px bg-linear-to-b from-transparent via-white/10 to-transparent shrink-0" />
										<div className="w-44 shrink-0 flex flex-col gap-2.5 justify-center">
											{segments.map(({ name, pct }, i) => (
												<LegendItem key={name} name={name} pct={pct} rank={i} shouldAnimate={shouldAnimate} />
											))}
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Languages;
