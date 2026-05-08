/**
 * @file app/components/layout/Header.tsx
 * Header Component
 *
 * A responsive and interactive navigation header that provides site-wide navigation
 * and dynamic branding with smooth animations.
 *
 * Features:
 * - GSAP-powered sticky header with background blur and height transitions
 * - Dynamic logo carousel with typewriter effect for role transitions
 * - Interactive desktop navigation with a sliding active indicator pill
 * - Mobile menu with GSAP-staggered entry/exit animations
 * - Active section tracking via ScrollTrigger for scroll-sync navigation
 * - Responsive design with mobile-optimized visitor counter placement
 */
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import VisitorCounter from '../ui/VisitorCounter';
import { HeaderState, NavItem } from '@/app/lib/types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const navItems: NavItem[] = [
	{ label: 'About', href: '#about' },
	{ label: 'Projects', href: '#projects' },
	{ label: 'Tech Stack', href: '#tech-stack' },
	{ label: 'Github Stats', href: '#github-stats' },
	{ label: 'Languages', href: '#languages' },
	{ label: 'Contact', href: '#contact' },
];

const Header = () => {
	const [state, setState] = useState<HeaderState>({
		isMenuOpen: false,
		scrolled: false,
		activeSection: '',
	});

	const [logoText, setLogoText] = useState('AmitxD');
	const logoRoles = useMemo(() => ['Amitminer', 'Rust Enthusiast', 'Developer', '<_/>', 'Rustacean', 'Open-Source', 'Hello! :D'], []);
	const roleIndexRef = useRef(0);

	// Refs for GSAP animations
	const headerRef = useRef<HTMLElement>(null);
	const logoRef = useRef<HTMLAnchorElement>(null);
	const navRef = useRef<HTMLElement>(null);
	const mobileToggleRef = useRef<HTMLButtonElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLSpanElement>(null);
	const navLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
	const bgRef = useRef<HTMLDivElement>(null);
	const menuOpenTlRef = useRef<gsap.core.Timeline | null>(null);

	// Logo Typewriter/Carousel Effect
	useEffect(() => {
		const interval = setInterval(() => {
			if (!logoRef.current) return;

			// Fade out and move up slightly
			gsap.to(logoRef.current, {
				opacity: 0,
				y: -5,
				duration: 0.3,
				onComplete: () => {
					roleIndexRef.current = (roleIndexRef.current + 1) % logoRoles.length;
					setLogoText(logoRoles[roleIndexRef.current]);

					// Fade in and come back to position
					gsap.to(logoRef.current, {
						opacity: 1,
						y: 0,
						duration: 0.3,
						ease: 'back.out(1.7)'
					});
				}
			});
		}, 4000);

		return () => clearInterval(interval);
	}, [logoRoles]);

	// Entrance animation on mount: Using matchMedia for responsive-aware timing
	useEffect(() => {
		const mm = gsap.matchMedia();

		mm.add({
			isDesktop: "(min-width: 1024px)",
			isMobile: "(max-width: 1023px)"
		}, (context) => {
			const { isDesktop } = context.conditions as gsap.Conditions;
			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// Common: Logo entrance
			tl.fromTo(
				logoRef.current,
				{ opacity: 0, x: -20 },
				{ opacity: 1, x: 0, duration: 0.5 }
			);

			if (isDesktop) {
				// Desktop: Stagger the nav links
				tl.fromTo(
					navLinkRefs.current.filter(Boolean),
					{ opacity: 0, y: -10, scale: 0.9 },
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 0.4,
						stagger: 0.05,
						ease: 'back.out(1.2)'
					},
					'-=0.35'
				);
			} else {
				// Mobile: Snappy pop for the toggle
				tl.fromTo(
					mobileToggleRef.current,
					{ opacity: 0, scale: 0.5 },
					{
						opacity: 1,
						scale: 1,
						duration: 0.4,
						ease: 'back.out(1.7)'
					},
					'-=0.35'
				);
			}
		}, headerRef);

		return () => mm.revert();
	}, []);

	// Scroll-based header background via GSAP (replaces className toggling)
	useEffect(() => {
		const ctx = gsap.context(() => {
			ScrollTrigger.create({
				start: 'top+=20 top',
				onEnter: () => {
					gsap.to(bgRef.current, {
						opacity: 1,
						duration: 0.35,
						ease: 'power2.out',
					});
					gsap.to(headerRef.current, {
						paddingTop: '12px',
						paddingBottom: '12px',
						duration: 0.35,
						ease: 'power2.out',
					});
				},
				onLeaveBack: () => {
					gsap.to(bgRef.current, {
						opacity: 0,
						duration: 0.35,
						ease: 'power2.out',
					});
					gsap.to(headerRef.current, {
						paddingTop: '20px',
						paddingBottom: '20px',
						duration: 0.35,
						ease: 'power2.out',
					});
				},
			});
		});

		return () => ctx.revert();
	}, []);

	// Active section tracker
	useEffect(() => {
		const handleScroll = () => {
			const sections = document.querySelectorAll('section[id]');
			sections.forEach((section) => {
				const el = section as HTMLElement;
				const top = el.offsetTop - 100;
				if (
					window.scrollY >= top &&
					window.scrollY < top + el.offsetHeight
				) {
					const id = section.getAttribute('id') || '';
					setState((prev) => {
						if (prev.activeSection === id) return prev;
						return { ...prev, activeSection: id };
					});
				}
			});
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Animate the active indicator pill to slide under the correct nav link
	useEffect(() => {
		if (!indicatorRef.current || !navRef.current) return;
		const idx = navItems.findIndex(
			(item) => item.href.slice(1) === state.activeSection
		);
		if (idx === -1) {
			gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
			return;
		}
		const linkEl = navLinkRefs.current[idx];
		if (!linkEl) return;
		const navRect = navRef.current.getBoundingClientRect();
		const linkRect = linkEl.getBoundingClientRect();
		gsap.to(indicatorRef.current, {
			opacity: 1,
			x: linkRect.left - navRect.left,
			width: linkRect.width,
			duration: 0.35,
			ease: 'power3.out',
		});
	}, [state.activeSection]);

	// Mobile menu open/close with GSAP
	useEffect(() => {
		const menu = mobileMenuRef.current;
		if (!menu) return;

		if (menuOpenTlRef.current) menuOpenTlRef.current.kill();
		const links = menu.querySelectorAll('a');

		if (state.isMenuOpen) {
			menu.style.display = 'block';
			menu.style.pointerEvents = 'auto';
			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
			menuOpenTlRef.current = tl;
			tl.fromTo(
				menu,
				{ opacity: 0, y: -12 },
				{ opacity: 1, y: 0, duration: 0.3 }
			).fromTo(
				links,
				{ opacity: 0, y: -8 },
				{ opacity: 1, y: 0, duration: 0.25, stagger: 0.05 },
				'-=0.15'
			);
		} else {
			const tl = gsap.timeline({
				defaults: { ease: 'power2.in' },
				onComplete: () => {
					if (menu) menu.style.display = 'none';
				},
			});
			menuOpenTlRef.current = tl;
			tl.to(menu, { opacity: 0, y: -8, duration: 0.25 });
		}
	}, [state.isMenuOpen]);

	// Click-outside + Escape key handlers
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const t = e.target as HTMLElement;
			if (state.isMenuOpen && !t.closest('nav') && !t.closest('button')) {
				setState((prev) => ({ ...prev, isMenuOpen: false }));
			}
		};
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && state.isMenuOpen)
				setState((prev) => ({ ...prev, isMenuOpen: false }));
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [state.isMenuOpen]);

	const toggleMenu = useCallback(() => {
		setState((prev) => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
	}, []);

	return (
		<header
			ref={headerRef}
			className="fixed top-0 left-0 w-full z-50"
			style={{ paddingTop: '20px', paddingBottom: '20px' }}
		>
			{/* Animated background layer — always present, opacity driven by GSAP */}
			<div
				ref={bgRef}
				className="absolute inset-0 bg-secondary/90 backdrop-blur-sm shadow-lg"
				style={{ opacity: 0, pointerEvents: 'none' }}
				aria-hidden="true"
			/>

			<div className="relative container mx-auto px-4 lg:px-6 flex justify-between items-center">
				{/* Logo */}
				<Link
					ref={logoRef}
					href="/"
					className="text-xl sm:text-2xl font-bold gradient-text hover:opacity-80 transition-opacity whitespace-nowrap"
					aria-label="Home"
					style={{ opacity: 0 }}
				>
					{logoText}
				</Link>

				{/* Desktop Navigation */}
				<nav
					ref={navRef}
					className="hidden lg:flex items-center space-x-4 xl:space-x-8 relative"
					aria-label="Main navigation"
				>
					{/* Sliding active indicator */}
					<span
						ref={indicatorRef}
						className="absolute bottom-1.5 h-0.5 bg-pink-500 rounded-full"
						style={{ opacity: 0, width: 0, x: 0 } as React.CSSProperties}
						aria-hidden="true"
					/>

					{navItems.map(({ label, href }, i) => (
						<Link
							key={label}
							href={href}
							ref={(el) => { navLinkRefs.current[i] = el; }}
							className={`nav-link transition-colors duration-200 whitespace-nowrap ${state.activeSection === href.slice(1)
								? 'text-pink-400'
								: 'text-gray-300 hover:text-white'
								}`}
							style={{ opacity: 0 }}
							aria-current={
								state.activeSection === href.slice(1) ? 'page' : undefined
							}
						>
							{label}
						</Link>
					))}
				</nav>

				{/* Mobile Menu Toggle */}
				<button
					ref={mobileToggleRef}
					className="lg:hidden relative text-white focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg p-1 transition-transform active:scale-95"
					onClick={toggleMenu}
					style={{ opacity: 0 }}
					aria-expanded={state.isMenuOpen}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					{/* Animate the icon swap */}
					<span
						className="block transition-transform duration-200"
						style={{
							transform: state.isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
						}}
					>
						{state.isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</span>
				</button>
			</div>

			{/* Mobile Menu — display toggled by GSAP, not className */}
			<div
				id="mobile-menu"
				ref={mobileMenuRef}
				className="lg:hidden bg-secondary/95 backdrop-blur-sm absolute w-full"
				style={{ display: 'none', opacity: 0 }}
			>
				<nav
					className="flex flex-col items-center py-4 space-y-4"
					aria-label="Mobile navigation"
				>
					{navItems.map(({ label, href }) => (
						<Link
							key={label}
							href={href}
							className={`nav-link font-medium transition-colors duration-200 ${state.activeSection === href.slice(1)
								? 'text-cyan-400'
								: 'text-gray-400 hover:text-cyan-300 active:text-cyan-300'
								}`}
							onClick={() =>
								setState((prev) => ({ ...prev, isMenuOpen: false }))
							}
							aria-current={
								state.activeSection === href.slice(1) ? 'page' : undefined
							}
						>
							{label}
						</Link>
					))}

					<div className="w-full flex justify-end pr-6 -mt-2 scale-[0.85] text-gray-400">
						<VisitorCounter />
					</div>
				</nav>
			</div>
		</header>
	);
};

export default Header;
