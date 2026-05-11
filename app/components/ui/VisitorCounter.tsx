'use client';
/**
 * VisitorCounter Component - with Session Storage
 *
 * Fast visitor counter that:
 * - Uses sessionStorage (no cookies needed!)
 * - Handles API auto-increment properly
 * - Instant loading with smart caching
 * - Minimal API calls
 */
import { GithubUsername } from '@/app/utils/config';
import { Users } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

const SESSION_KEY = `visitor_${GithubUsername}`;

const getSessionData = (): { count: number } | null => {
	try {
		const data = sessionStorage.getItem(SESSION_KEY);
		return data ? JSON.parse(data) : null;
	} catch { return null; }
};

const setSessionData = (count: number): void => {
	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify({ count }));
	} catch { }
};

const VisitorCounter = () => {
	const [count, setCount] = useState<number | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const hasRun = useRef(false);
	const counterId = GithubUsername;

	/**
	 * Fast count fetch - API auto-increments, so we handle it properly
	 * Note: This API is not my own and may break at any time. I am dependent on it.
	 */
	const fetchCount = useCallback(async (): Promise<void> => {
		// Set updating state inside async function
		setIsUpdating(true);
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000);

			const response = await fetch(`https://counterpro.vercel.app/api/count/id/${counterId}`, {
				signal: controller.signal,
				headers: { 'Accept': 'application/json' }
			});
			clearTimeout(timeoutId);

			if (response.ok) {
				const data = await response.json();
				const apiCount = data?.count || 0;
				// API auto-incremented, so this is our new count
				setCount(apiCount);
				setSessionData(apiCount);
			}
		} catch {
			// API failed — keep showing cached value already set from sessionStorage
		} finally {
			setIsUpdating(false);
		}
	}, [counterId]);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const cached = getSessionData();
		if (cached) {
			// Already visited this session — show cached count, skip API call
			setTimeout(() => setCount(cached.count), 0);
			return;
		}

		const id = setTimeout(fetchCount, 0);
		return () => clearTimeout(id);
	}, [fetchCount]);

	return (
		<div
			className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300 transition-all duration-200 scale-[0.95]"
			aria-label={count !== null ? `${count.toLocaleString()} total visitors` : 'Loading visitor count'}
		>
			<Users className={`text-cyan-400 w-4 h-4 shrink-0 ${isUpdating ? 'animate-pulse' : ''}`} />
			<span className="tabular-nums">
				{count !== null ? `${count.toLocaleString()} visitors` : '... visitors'}
			</span>
		</div>
	);
};

export default VisitorCounter;
