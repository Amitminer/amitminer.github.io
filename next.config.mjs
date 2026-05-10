/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
	// Static export for GitHub Pages; omit when deploying to a Node server
	...(isGithubPages && { output: 'export' }),
	// allowedDevOrigins: ['192.168.0.105'], // Local development
	// Image optimization
	images: {
		// Static export cannot use the built-in image optimizer (server feature)
		unoptimized: isGithubPages,
		remotePatterns: [
			{ protocol: 'https', hostname: 'avatars.githubusercontent.com' },
			{ protocol: 'https', hostname: 'githubusercontent.com' },
			{ protocol: 'https', hostname: 'opengraph.githubassets.com' },
			{ protocol: 'https', hostname: 'images.weserv.nl' }
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/webp'],
		minimumCacheTTL: 60,
		qualities: [75, 80],
	},

	// Development + production options
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,
	productionBrowserSourceMaps: false,

	// Security headers — Node/server only; skipped in static-export mode
	...(!isGithubPages && {
		async headers() {
			return [
				{
					source: '/:path*',
					headers: [
						{ key: 'X-DNS-Prefetch-Control', value: 'on' },
						{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
						{ key: 'X-XSS-Protection', value: '1; mode=block' },
						{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
						{ key: 'X-Content-Type-Options', value: 'nosniff' },
						{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
						{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					],
				},
			];
		},
	}),
};

export default nextConfig;
