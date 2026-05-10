/**
 * Portfolio Personalization Configuration
 *
 * This file contains all the personal information, social links, and section content
 * displayed throughout the portfolio. Update these values to customize the site.
 */

// --- Basic Information ---
export const Name = "AmitxD";
export const FullName = "Amit Kumar";
export const Email = process.env.NEXT_PUBLIC_EMAIL || "yourmail@gmail.com";
export const Location = "India";

// --- Hero Section ---
export const HeroRoles = [
	"Self-taught developer building cool stuff",
	"Focused on backend and performance",
	"Rust enthusiast and Linux user",
	"Obsessed with optimization and clean code",
];

// --- About Section ---
export const AboutContent = {
	firstParagraph: "Hey, I'm Amit, also known as AmitxD or Amitminer. I'm a self-taught developer from India driven by a genuine obsession with understanding how things work at a fundamental level, not just making them work.",
	secondParagraph: "I specialize in systems programming with a focus on performance, modularity and low-level control. Memory management, concurrency and architectural efficiency are where I spend most of my time. Rust is my primary language of choice for work that demands precision and reliability at scale."
};

// --- Header Component ---
export const HeaderRoles = [
	'Hello! :D',
	'Amitminer',
	'Rust Enthusiast',
	'Developer',
	'<_/>',
	'Rustacean',
	'Open-Source'
];

// --- Social Media Links ---
const socialLinks = [
	{ url: 'https://github.com/Amitminer', username: 'Amitminer' },
	{ url: 'https://linkedin.com/in/amitxd', username: 'amitxd' },
	{ url: 'https://x.com/amitminerX', username: 'amitminerX' },
	{ url: 'https://instagram.com/amitxd75', username: 'amitxd75' },
	{ url: 'https://discord.com/users/amit_xd', username: 'amit_xd' }
];

export const GithubLink = socialLinks[0].url;
export const GithubUsername = socialLinks[0].username;
export const LinkedinLink = socialLinks[1].url;
export const XLink = socialLinks[2].url;
export const InstagramLink = socialLinks[3].url;
export const DiscordLink = socialLinks[4].url;

// --- Support & Monetization ---
export const BuyMeACoffeeLink = process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME ? `https://buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}` : null;
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || '';

// --- SEO & Verification ---
export const GoogleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

// --- Portfolio Metadata ---
export const CurrentGithubLink = "https://github.com/Amitminer/amitminer.github.io/";
export const PortfolioURL = "https://amitminer.github.io";

// --- Backend API ---
export const BackendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/github';
