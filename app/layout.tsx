import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import { Name, FullName, PortfolioURL, GoogleSiteVerification } from '@/app/utils/config';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	fallback: ['system-ui', 'arial']
});

// SEO metadata for the entire website
export const metadata: Metadata = {
	metadataBase: new URL(PortfolioURL),

	title: {
		default: `${Name} (${FullName}) - Rust, Backend & Full-Stack Developer`,
		template: `%s | ${Name}`,
	},

	description: `${Name} is a self-taught developer from India building performant Rust backends, Next.js apps, Tauri desktop tools, CLI utilities, encryption software, and open-source developer tooling.`,
	keywords: 'AmitxD, AmitMiner, Amit Kumar, Rust developer, backend developer, full-stack developer, systems programming, performance optimization, Next.js developer, TypeScript developer, React developer, Actix Web, Tauri, CLI tools, FFmpeg, PostgreSQL, Redis, Docker, Linux, open source',

	authors: [{ name: FullName, url: PortfolioURL }],
	creator: Name,
	publisher: Name,
	category: 'technology',

	alternates: {
		canonical: PortfolioURL,
	},

	openGraph: {
		title: `${Name} - Rust, Backend & Full-Stack Developer`,
		description:
			'Projects and experiments across Rust systems programming, high-performance backends, Next.js applications, Tauri desktop tools, CLI automation, and open-source developer workflows.',
		url: PortfolioURL,
		siteName: `${Name} Portfolio`,
		type: 'website',
		locale: 'en_US',
	},

	twitter: {
		card: 'summary',
		title: `${Name} - Rust, Backend & Full-Stack Developer`,
		description:
			'Rust backends, Next.js apps, Tauri tools, CLI utilities, encryption projects, and open-source developer tooling.',
		creator: '@amitminerX',
	},

	verification: {
		google: GoogleSiteVerification,
	},
};

// Root layout component that wraps all pages
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body className={inter.className}>
				<div className="flex flex-col min-h-screen">
					<Header />

					<main className="grow">
						{children}
					</main>

					<Footer />
				</div>
			</body>
		</html>
	);
}
