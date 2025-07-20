import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	fallback: ['system-ui', 'arial']
});

// SEO metadata for the entire website
export const metadata: Metadata = {
	title: "AmitxD – Rust & Web Developer",
	description: "Crafting high-quality Rust backends and modern web frontends. Explore projects, tools, and my developer workflow.",
	keywords: [
		"Rust developer", "TypeScript", "Next.js", "Actix", "PostgreSQL",
		"Full-stack", "Python", "Open Source", "Developer Portfolio"
	],
	authors: [{ name: "AmitxD" }],
	openGraph: {
		title: "AmitxD – Rust & Web Developer",
		description: "Explore my projects, tech stack, and contributions in Rust, TypeScript, and more.",
		type: "website"
	},
	metadataBase: new URL('https://amitminer.github.io'),
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

					<main className="flex-grow">
						{children}
					</main>

					<Footer />
				</div>
			</body>
		</html>
	);
}
