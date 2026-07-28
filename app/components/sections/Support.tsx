/**
 * Support Component
 * Displays donation options with an animated button and dropdown for supporting the creator.
 * - Supports Buy Me a Coffee and UPI payment options
 */
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Heart, Coffee, Copy, Check } from 'lucide-react';
import { BuyMeACoffeeLink, UPI_ID } from '@/app/utils/config';

interface ExtendedSupportState {
	isHovered: boolean;
	copied: boolean;
	showOptions: boolean;
}

const Support = () => {
	const supportRef = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<ExtendedSupportState>({
		isHovered: false,
		copied: false,
		showOptions: false,
	});

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (
				supportRef.current &&
				!supportRef.current.contains(event.target as Node)
			) {
				setState((prev) => ({ ...prev, showOptions: false }));
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, []);

	const handleMouseEnter = () => setState((prev) => ({ ...prev, isHovered: true }));
	const handleMouseLeave = () => setState((prev) => ({ ...prev, isHovered: false }));

	const toggleOptions = () => setState((prev) => ({ ...prev, showOptions: !prev.showOptions }));

	const handleCoffeeClick = () => {
		if (BuyMeACoffeeLink) {
			window.open(BuyMeACoffeeLink, '_blank');
		}
		setState((prev) => ({ ...prev, showOptions: false }));
	};

	const copyUpiId = async () => {
		try {
			await navigator.clipboard.writeText(UPI_ID);
			setState((prev) => ({ ...prev, copied: true, showOptions: false }));
			setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 2000);
		} catch (err) {
			console.error('Failed to copy UPI ID:', err);
		}
	};

	return (
		<section
			id="support"
			ref={supportRef}
			className="py-16 w-full bg-linear-to-b from-secondary/10 to-secondary/40"
		>
			<div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
				<h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300">
					Support My Work
				</h2>
				<p className="text-sm sm:text-base mb-12 text-slate-300 leading-relaxed">
					Building and maintaining stuff solo takes time (and caffeine 😅).<br />
					If you find my projects useful, a small coffee goes a long way!
				</p>

				{/* Payment Options */}
				<div className="flex justify-center">
					<div className="relative w-full max-w-[240px] sm:max-w-sm">
						{/* Main Support Button */}
						<Button
							variant="amber"
							size="lg"
							onClick={toggleOptions}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							className="flex items-center justify-between gap-2 sm:gap-3 w-full h-10 sm:h-13 px-3.5 sm:px-6 py-2 sm:py-4 rounded-full font-bold active:scale-[0.98] transition-all duration-300"
						>
							<span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-950/15 flex items-center justify-center shrink-0">
								<Heart
									className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-950 transition-transform duration-300 ${state.isHovered ? 'scale-110' : ''}`}
								/>
							</span>
							<span className="text-xs sm:text-base font-bold text-slate-950">Support My Work</span>
							<span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-950/15 flex items-center justify-center shrink-0">
								<Coffee
									className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-950 transition-transform duration-300 ${state.isHovered ? 'scale-110' : ''}`}
								/>
							</span>
						</Button>

						{/* Options Dropdown */}
						{state.showOptions && (
							<div className="absolute top-full mt-3 left-0 right-0 mx-auto w-full bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-2">
								<div className="flex flex-col gap-1.5">
									{/* Buy Me a Coffee Option */}
									<button
										onClick={handleCoffeeClick}
										className="w-full flex items-center justify-between p-3.5 text-left text-slate-100 hover:bg-white/5 rounded-xl transition-all duration-200 group border border-transparent hover:border-amber-500/30"
									>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
												<Coffee className="h-4 w-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
											</div>
											<span className="font-semibold text-sm sm:text-base">Buy Me a Coffee</span>
										</div>
										<span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
									</button>

									{/* UPI Option */}
									<button
										onClick={copyUpiId}
										className="w-full flex items-center justify-between p-3.5 text-left text-slate-100 hover:bg-white/5 rounded-xl transition-all duration-200 group border border-transparent hover:border-emerald-500/30"
									>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
												{state.copied ? (
													<Check className="h-4 w-4 text-emerald-400" />
												) : (
													<Copy className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
												)}
											</div>
											<span className="font-semibold text-sm sm:text-base">
												{state.copied ? 'UPI ID Copied!' : 'Copy UPI ID'}
											</span>
										</div>
										<span className="text-xs text-cyan-400">{state.copied ? '✓' : 'Copy'}</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<p className="mt-8 text-sm text-gray-400">
					Your support fuels more open-source contributions.
				</p>
			</div>
		</section>
	);
};

export default Support;
