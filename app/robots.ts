import type { MetadataRoute } from 'next'
import { PortfolioURL } from '@/app/utils/config'

// Configure robots.txt for search engine crawlers
export const dynamic = 'force-static'

// Define the robots.txt configuration
export default function robots(): MetadataRoute.Robots {
	return {
		// Allow all user agents to access all pages
		rules: {
			userAgent: '*',
			allow: '/',
		},
		// Point to the sitemap
		sitemap: `${PortfolioURL}/sitemap.xml`,
	}
}
