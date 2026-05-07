/**
 * Languages Component
 * Displays the user's top programming languages from GitHub using the GitHub Stats API.
 * - Immediate image display with loading overlay
 * - Preloading strategy
 * - Caching with cache-busting only on errors
 * - Progressive enhancement
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { GithubUsername, TopLanguagesApiUrl } from '@/app/utils/Links';
import Image from 'next/image';

// ===== SUB COMPONENTS  =====

// Compact loading indicator
const LoadingOverlay = () => (
	<div className="absolute inset-0 bg-gray-800/80 backdrop-blur-xs rounded-lg flex items-center justify-center">
		<div className="flex items-center space-x-3">
			<RefreshCw className="w-5 h-5 animate-spin text-[#00FFFF]" />
			<span className="text-gray-300 text-sm">Loading...</span>
		</div>
	</div>
);

// Compact error display
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
	<div className="absolute inset-0 bg-gray-800/90 rounded-lg flex flex-col items-center justify-center space-y-3">
		<AlertCircle className="w-8 h-8 text-red-400" />
		<p className="text-gray-300 text-sm text-center px-4">{error}</p>
		<button
			onClick={onRetry}
			className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
		>
			Retry
		</button>
	</div>
);

// ===== MAIN COMPONENT =====

const Languages = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [cacheBuster, setCacheBuster] = useState<string>('');

	const languagesRef = useRef<HTMLDivElement>(null);
	const retryCountRef = useRef(0);
	const abortedRef = useRef(false);
	const maxRetries = 2;

	// Generate URL only once unless there's an error (cache-busting via state)
	const imageUrl = `${TopLanguagesApiUrl}${cacheBuster}`;

	// ===== INTERSECTION OBSERVER =====
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (languagesRef.current) {
			observer.observe(languagesRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// ===== IMAGE PRELOAD =====
	// Preload image when component mounts, with exponential backoff on error
	useEffect(() => {
		abortedRef.current = false;
		retryCountRef.current = 0;

		const tryLoad = () => {
			if (abortedRef.current) return;

			const img = new window.Image();
			// Use cache-busting only on retries
			const url = TopLanguagesApiUrl + (retryCountRef.current > 0 ? `&t=${Date.now()}` : '');
			img.src = url;

			img.onload = () => {
				if (abortedRef.current) return;
				// Update cache buster in state so <Image> src stays in sync
				if (retryCountRef.current > 0) {
					setCacheBuster(`&t=${Date.now()}`);
				}
				setIsLoading(false);
				setImageLoaded(true);
				setError(null);
			};

			img.onerror = () => {
				if (abortedRef.current) return;
				retryCountRef.current += 1;
				if (retryCountRef.current <= maxRetries) {
					// Exponential backoff: 1s, 2s — avoids hammering a down API
					setTimeout(tryLoad, retryCountRef.current * 1000);
				} else {
					// Give up — no more requests until user clicks Retry
					setError('Unable to load language stats');
					setIsLoading(false);
				}
			};
		};

		tryLoad();

		return () => {
			// Abort any pending retries on unmount to prevent setState on unmounted component
			abortedRef.current = true;
		};
	}, []);

	const handleRetry = () => {
		// Reset all state and refs before re-attempting
		retryCountRef.current = 0;
		abortedRef.current = false;
		setIsLoading(true);
		setError(null);
		setImageLoaded(false);
		setCacheBuster('');

		const tryLoad = () => {
			if (abortedRef.current) return;

			const img = new window.Image();
			const url = TopLanguagesApiUrl + (retryCountRef.current > 0 ? `&t=${Date.now()}` : '');
			img.src = url;

			img.onload = () => {
				if (abortedRef.current) return;
				if (retryCountRef.current > 0) {
					setCacheBuster(`&t=${Date.now()}`);
				}
				setIsLoading(false);
				setImageLoaded(true);
				setError(null);
			};

			img.onerror = () => {
				if (abortedRef.current) return;
				retryCountRef.current += 1;
				if (retryCountRef.current <= maxRetries) {
					// Exponential backoff: 1s, 2s
					setTimeout(tryLoad, retryCountRef.current * 1000);
				} else {
					setError('Unable to load language stats');
					setIsLoading(false);
				}
			};
		};

		tryLoad();
	};

	return (
		<section
			id="languages"
			ref={languagesRef}
			className={`pt-20 pb-12 w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
				}`}
		>
			<div className="container mx-auto px-4 md:px-6">
				<h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
					Top Languages
				</h2>

				<div className="max-w-4xl mx-auto text-center pt-4 pb-0">
					<div className="relative w-full max-w-100 md:max-w-115 lg:max-w-125 mx-auto p-0.5 rounded-xl bg-linear-to-br from-cyan-400/60 to-pink-500/60 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 group">
						<div className="rounded-[10px] overflow-hidden bg-[#0d1117]">
							<Image
								src={imageUrl}
								alt={`${GithubUsername}'s Top Languages`}
								width={500}
								height={195}
								className={`w-full h-auto rounded-[10px] transition-transform duration-300 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-60'
									}`}
								style={{
									backgroundColor: '#1f2937',
								}}
								unoptimized
							/>
						</div>

						{/* Overlays */}
						{isLoading && !imageLoaded && <LoadingOverlay />}
						{error && <ErrorDisplay error={error} onRetry={handleRetry} />}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Languages;
