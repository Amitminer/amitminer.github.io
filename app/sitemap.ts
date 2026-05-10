import type { MetadataRoute } from 'next'
import { PortfolioURL } from '@/app/utils/config'

// Generates the sitemap for the website.
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			// The URL of the homepage.
			url: PortfolioURL,
			// The last modified date of the homepage.
			lastModified: new Date(),
		},
	]
}
