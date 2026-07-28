/**
 * About Component
 *
 * A dynamic and interactive "About Me" section that features:
 * - Typewriter effect for text animation
 * - Intersection Observer for scroll-based animations
 * - Floating particles and decorative elements
 * - Design with gradient effects
 * - Skeleton loading state
 */

'use client';

import { TypewriterState } from '@/app/lib/types';
import { Name, FullName, AboutContent } from '@/app/utils/config';
import { useEffect, useRef, useState, useCallback } from 'react';

// Constants
const TYPING_DELAY = 2; // ms between characters for the first paragraph
const SECOND_TYPING_DELAY = 2; // ms between characters for the second paragraph
const CURSOR_BLINK_DELAY = 500; // ms between cursor blinks
const LOADING_DELAY = 400; // ms for the loading state before animations begin

// === Skeleton Loading Component ===
const SkeletonLoader = () => (
	<div className="max-w-3xl mx-auto bg-slate-900/40 rounded-xl p-6 md:p-8 backdrop-blur-xs border border-slate-800">
		{/* Title Skeleton */}
		<div className="h-8 w-48 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-lg animate-pulse mb-8 mx-auto" />

		{/* First Paragraph Skeleton */}
		<div className="space-y-3 mb-6">
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-3/4" />
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-full" />
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-5/6" />
		</div>

		{/* Second Paragraph Skeleton */}
		<div className="space-y-3">
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-2/3" />
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-full" />
			<div className="h-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded animate-pulse w-4/5" />
		</div>
	</div>
);

const About = () => {
	// === Refs and State Management ===
	const aboutRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [typewriterState, setTypewriterState] = useState<TypewriterState>({
		currentIndex: 0,
		secondIndex: 0,
		showCursor: true
	});

	// === Effects ===

	/**
	 * Intersection Observer Effect
	 * Triggers animations when the section comes into view
	 */
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					entry.target.classList.add('slide-up');
					setTimeout(() => setIsLoading(false), LOADING_DELAY);
				}
			},
			{ threshold: 0.1 }
		);

		const currentRef = aboutRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, []);

	/**
	 * Cursor Blinking Animation
	 */
	useEffect(() => {
		const interval = setInterval(() => {
			setTypewriterState(prev => ({ ...prev, showCursor: !prev.showCursor }));
		}, CURSOR_BLINK_DELAY);

		return () => clearInterval(interval);
	}, []);

	/**
	 * First Paragraph Typewriter Effect
	 */
	useEffect(() => {
		if (isVisible && typewriterState.currentIndex < AboutContent.firstParagraph.length) {
			const timeout = setTimeout(() => {
				setTypewriterState(prev => ({
					...prev,
					currentIndex: prev.currentIndex + 1
				}));
			}, TYPING_DELAY);

			return () => clearTimeout(timeout);
		}
	}, [isVisible, typewriterState.currentIndex]);

	/**
	 * Second Paragraph Typewriter Effect
	 */
	useEffect(() => {
		const isFirstParagraphComplete = typewriterState.currentIndex >= AboutContent.firstParagraph.length;

		if (isVisible && isFirstParagraphComplete && typewriterState.secondIndex < AboutContent.secondParagraph.length) {
			const timeout = setTimeout(() => {
				setTypewriterState(prev => ({
					...prev,
					secondIndex: prev.secondIndex + 1
				}));
			}, SECOND_TYPING_DELAY);

			return () => clearTimeout(timeout);
		}
	}, [isVisible, typewriterState.currentIndex, typewriterState.secondIndex]);

	// === Helper Functions ===

	/**
	 * Renders text with typewriter effect and special highlighting
	 */
	const renderTextWithTypewriter = useCallback((text: string, currentIdx: number) => {
		return text.split('').map((char, index) => {
			const isRevealed = index < currentIdx;
			const isHighlighted =
				(text.slice(index, index + Name.length) === Name) ||
				(text.slice(index, index + FullName.length) === FullName);

			let className = 'transition-all duration-300 ';
			if (isRevealed) {
				className += isHighlighted ? 'text-sky-400 font-bold opacity-100' : 'text-foreground opacity-100';
			} else {
				className += 'text-muted-foreground/30 opacity-50';
			}

			return (
				<span
					key={index}
					className={className}
					style={{ transitionDelay: isRevealed ? `${index * 2}ms` : '0ms' }}
				>
					{char}
				</span>
			);
		});
	}, []);

	// === Animation State Checks ===
	const isFirstParagraphComplete = typewriterState.currentIndex >= AboutContent.firstParagraph.length;
	const isSecondParagraphComplete = typewriterState.secondIndex >= AboutContent.secondParagraph.length;
	const showFirstCursor = !isFirstParagraphComplete && typewriterState.showCursor;
	const showSecondCursor = isFirstParagraphComplete && !isSecondParagraphComplete && typewriterState.showCursor;

	// === JSX ===
	return (
		<section
			id="about"
			ref={aboutRef}
			className="py-20 w-full relative overflow-hidden"
		>
			<div className="container mx-auto px-4 md:px-6 relative z-10">
				{/* Section Title with Gradient Effect */}
				<h2
					className={`text-3xl md:text-4xl font-bold mb-12 gradient-text text-center transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
						}`}
				>
					About me
				</h2>

				{/* Show Skeleton or Content */}
				{isLoading ? (
					<SkeletonLoader />
				) : (
					<div
						className={`max-w-3xl mx-auto bg-slate-900/60 rounded-2xl p-6 md:p-8 backdrop-blur-md
              border border-slate-800 hover:border-slate-700 transition-all duration-500
              transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
							}`}
						style={{ transitionDelay: '0.2s' }}
					>
						{/* First Paragraph with Typewriter Effect */}
						<div className="text-base leading-relaxed relative">
							{renderTextWithTypewriter(AboutContent.firstParagraph, typewriterState.currentIndex)}
							{showFirstCursor && (
								<span className="text-sky-400 font-bold animate-pulse ml-1">|</span>
							)}
						</div>

						{/* Second Paragraph with Typewriter Effect */}
						<div className="text-base leading-relaxed relative mt-4">
							{renderTextWithTypewriter(AboutContent.secondParagraph, typewriterState.secondIndex)}
							{showSecondCursor && (
								<span className="text-sky-400 font-bold animate-pulse ml-1">|</span>
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default About;
