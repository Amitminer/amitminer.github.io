import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
	title: 'Blogs | AmitxD Portfolio',
	description: 'Articles and insights on Rust, systems programming, and software engineering.',
};

export default function BlogsPage() {
	return (
		<main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
			<div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
				<h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
					Blogs
				</h1>
				<p className="text-slate-400 text-xs sm:text-sm mb-6">
					Articles & technical notes coming soon.
				</p>
				<Link
					href="/"
					className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-all text-xs font-semibold active:scale-[0.98]"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back to Home</span>
				</Link>
			</div>
		</main>
	);
}
