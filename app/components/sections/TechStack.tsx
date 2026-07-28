/**
 * TechStack Component
 *
 * Tailored technology stack showcase focusing on:
 * - Systems Programming (Rust, C++, Tokio, Async Rust, IPC, Networking)
 * - Backend & Infra (Actix Web, Axum, Express, Firecracker, Docker, Cloudflare, AWS)
 * - Databases (PostgreSQL, Redis, SQLite)
 * - Operating Systems & Tools (Arch Linux, Windows, Neovim, Zed, tmux, SSH)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	SiArchlinux,
	SiRust, SiPython, SiCplusplus, SiPhp, SiTypescript, SiGo,
	SiReact, SiNextdotjs, SiExpress, SiTauri,
	SiRedis, SiSqlite, SiPostgresql,
	SiDocker, SiCloudflare, SiGithubactions, SiNeovim,
	SiGit, FaWindows, FaAws
} from '../icons/index';
import { Server, Cpu, Zap, Layers, Network, Radio, Terminal } from 'lucide-react';
import { TechGroup, TechGroupProps, TechItemProps } from '@/app/lib/types';

// Constants
const ANIMATION_DELAY = 50;
const OBSERVER_THRESHOLD = 0.1;
const OBSERVER_ROOT_MARGIN = '50px';

// Tech groups data strictly matching defense-grade interview skills
const techGroups: TechGroup[] = [
	{
		title: "Languages",
		technologies: [
			{ name: 'Rust', icon: <SiRust />, color: 'text-amber-500' },
			{ name: 'Go', icon: <SiGo />, color: 'text-cyan-400' },
			{ name: 'C++', icon: <SiCplusplus />, color: 'text-sky-400' },
			{ name: 'TypeScript', icon: <SiTypescript />, color: 'text-blue-400' },
			{ name: 'Python', icon: <SiPython />, color: 'text-emerald-400' },
			{ name: 'PHP', icon: <SiPhp />, color: 'text-indigo-400' },
		]
	},
	{
		title: "Frontend",
		technologies: [
			{ name: 'Next.js', icon: <SiNextdotjs />, color: 'text-slate-100' },
			{ name: 'React', icon: <SiReact />, color: 'text-sky-400' },
			{ name: 'Tauri', icon: <SiTauri />, color: 'text-amber-400' },
		]
	},
	{
		title: "Backend",
		technologies: [
			{ name: 'Actix Web', icon: <Server />, color: 'text-amber-400' },
			{ name: 'Axum', icon: <Cpu />, color: 'text-orange-400' },
			{ name: 'Express.js', icon: <SiExpress />, color: 'text-slate-200' },
		]
	},
	{
		title: "Databases",
		technologies: [
			{ name: 'PostgreSQL', icon: <SiPostgresql />, color: 'text-sky-400' },
			{ name: 'Redis', icon: <SiRedis />, color: 'text-rose-500' },
			{ name: 'SQLite', icon: <SiSqlite />, color: 'text-cyan-400' },
		]
	},
	{
		title: "DevOps & Infrastructure",
		technologies: [
			{ name: 'Docker', icon: <SiDocker />, color: 'text-sky-400' },
			{ name: 'GitHub Actions', icon: <SiGithubactions />, color: 'text-blue-400' },
			{ name: 'AWS', icon: <FaAws />, color: 'text-amber-500' },
			{ name: 'Cloudflare', icon: <SiCloudflare />, color: 'text-orange-400' },
			{ name: 'Firecracker', icon: <Zap />, color: 'text-amber-400' },
		]
	},
	{
		title: "Systems Programming",
		technologies: [
			{ name: 'Tokio', icon: <Cpu />, color: 'text-amber-400' },
			{ name: 'Async Rust', icon: <SiRust />, color: 'text-orange-400' },
			{ name: 'Multithreading', icon: <Layers />, color: 'text-teal-400' },
			{ name: 'IPC & Networking', icon: <Network />, color: 'text-cyan-400' },
			{ name: 'gRPC & WebSockets', icon: <Radio />, color: 'text-emerald-400' },
		]
	},
	{
		title: "Operating Systems",
		technologies: [
			{ name: 'Arch Linux', icon: <SiArchlinux />, color: 'text-cyan-400' },
			{ name: 'Windows', icon: <FaWindows />, color: 'text-sky-400' },
		]
	},
	{
		title: "Developer Tools",
		technologies: [
			{ name: 'Git', icon: <SiGit />, color: 'text-orange-500' },
			{ name: 'Zed & Neovim', icon: <SiNeovim />, color: 'text-emerald-400' },
			{ name: 'tmux & SSH', icon: <Terminal />, color: 'text-slate-300' },
		]
	}
];

// Memoized tech item component
const TechItem = React.memo<TechItemProps>(({ tech, isLast }) => (
	<div id="tech-items" className={`flex flex-col items-center group ${!isLast ? 'border-r border-slate-800/60' : ''} py-1.5 px-0.5 sm:py-2 sm:px-1`}>
		<div
			className={`text-xl sm:text-2xl mb-1 ${tech.color} group-hover:scale-110 transition-transform duration-200`}
			style={{ willChange: 'transform' }}
		>
			{tech.icon}
		</div>
		<span className="text-[11px] sm:text-xs text-slate-300 font-medium text-center leading-tight">{tech.name}</span>
	</div>
));

TechItem.displayName = 'TechItem';

// Memoized tech group component
const TechGroupComponent = React.memo<TechGroupProps>(({
	group,
	isVisible,
	groupIndex
}) => (
	<div
		className={`p-3 sm:p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 transform hover:scale-[1.02] border border-slate-800/80 hover:border-slate-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
			}`}
		style={{
			transitionDelay: `${groupIndex * ANIMATION_DELAY}ms`,
			willChange: 'transform, opacity'
		}}
	>
		<h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 text-slate-100 text-center tracking-wide">{group.title}</h3>
		<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
			{group.technologies.map((tech, index) => (
				<TechItem
					key={tech.name}
					tech={tech}
					isLast={(index + 1) % 3 === 0 || index === group.technologies.length - 1}
				/>
			))}
		</div>
	</div>
));

TechGroupComponent.displayName = 'TechGroupComponent';

const TechStack = () => {
	const [isVisible, setIsVisible] = useState(false);
	const techStackRef = React.useRef<HTMLDivElement>(null);

	const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
		const [entry] = entries;
		if (entry.isIntersecting) {
			setIsVisible(true);
		}
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, {
			threshold: OBSERVER_THRESHOLD,
			rootMargin: OBSERVER_ROOT_MARGIN
		});

		const currentRef = techStackRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
			observer.disconnect();
		};
	}, [handleIntersection]);

	return (
		<section
			id="tech-stack"
			ref={techStackRef}
			className="py-16 w-full"
		>
			<div className="container mx-auto px-4 md:px-6">
				<h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
					Technology Stack
				</h2>

				<div className="max-w-7xl mx-auto">
					<div
						className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-800 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
							}`}
						style={{ willChange: 'transform, opacity' }}
					>
						{techGroups.map((group, groupIndex) => (
							<TechGroupComponent
								key={group.title}
								group={group}
								isVisible={isVisible}
								groupIndex={groupIndex}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default TechStack;
