import type { Metadata, Viewport } from "next";
import { Name, PortfolioUrl, SiteDescription, SiteTitle } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(PortfolioUrl),
  title: {
    default: SiteTitle,
    template: `%s | ${SiteTitle}`,
  },
  description: SiteDescription,
  authors: [{ name: Name, url: PortfolioUrl }],
  creator: Name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SiteTitle,
    description: SiteDescription,
    url: PortfolioUrl,
    siteName: SiteTitle,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: SiteTitle,
    description: SiteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="m-0 bg-bg text-ink antialiased selection:bg-[#171717] selection:text-[#f7f7f5]">
        {children}
      </body>
    </html>
  );
}
