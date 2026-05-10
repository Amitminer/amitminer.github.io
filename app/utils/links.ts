const socialLinks = [
	{
		id: 1,
		url: 'https://github.com/Amitminer',
		username: 'Amitminer'
	},
	{
		id: 2,
		url: 'https://linkedin.com/in/amitxd',
		username: 'amitxd'
	},
	{
		id: 3,
		url: 'https://x.com/amitminerX',
		username: 'amitminerX'
	},
	{
		id: 4,
		url: 'https://instagram.com/amitxd75',
		username: 'amitxd75'
	},
	{
		id: 5,
		url: 'https://discord.com/users/amit_xd',
		username: 'amit_xd'
	}
];

export const GithubLink = socialLinks[0].url;
export const GithubUsername = socialLinks[0].username;
export const LinkedinLink = socialLinks[1].url;
export const XLink = socialLinks[2].url;
export const InstagramLink = socialLinks[3].url;
export const DiscordLink = socialLinks[4].url;
export const BuyMeACoffeeLink = process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME ? `https://buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}` : null;
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || '';

export const CurrentGithubLink = "https://github.com/Amitminer/amitminer.github.io/";
export const BackendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/github';
