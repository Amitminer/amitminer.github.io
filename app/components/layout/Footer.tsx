/**
 * Footer component that displays website footer content with dynamic elements.
 *
 * - Design with desktop detection
 * - Shows visitor counter only on desktop when scrolled to bottom
 * - Displays copyright year, love animation, and social links
 * - Includes open source project link
*/

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitHubIcon } from '../icons/index';
import { CurrentGithubLink, Name } from '@/app/utils/config';
import VisitorCounter from '../ui/VisitorCounter';

const Footer = () => {
	const currentYear = new Date().getFullYear();
	const [showCounter, setShowCounter] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	// Detect if user is on desktop
	useEffect(() => {
		const checkDevice = () => {
			setIsDesktop(window.innerWidth >= 768); // md breakpoint
		};

		checkDevice();
		window.addEventListener('resize', checkDevice);

		return () => window.removeEventListener('resize', checkDevice);
	}, []);

	// Detect if user is near bottom of page
	useEffect(() => {
		const handleScroll = () => {
			const bottomReached =
				window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
			setShowCounter(bottomReached);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<footer className="w-full bg-slate-950/80 border-t border-slate-900/80 mt-8 sm:mt-12 py-4 sm:py-6">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-2">
					<Link href="/" className="text-lg sm:text-xl font-bold gradient-text block text-center">
						{Name}
					</Link>

					<div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-400">
						<a
							href={CurrentGithubLink}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center space-x-1.5 hover:text-sky-400 transition-colors duration-300"
						>
							<GitHubIcon className="w-3.5 h-3.5" />
							<span>Open Source</span>
						</a>
						<span className="text-slate-700">•</span>
						<span>© {currentYear}</span>
					</div>

					{isDesktop && showCounter && (
						<div className="pt-1">
							<VisitorCounter />
						</div>
					)}
				</div>
			</div>
		</footer>
	);
};

export default Footer;
