import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

// SEO metadata for the entire website
export const metadata: Metadata = {
  title: 'AmitxD | Developer Portfolio',
  description: 'Self-taught developer passionate about creating innovative solutions',
};

/**
 * Provides the root layout structure for all pages, including global styles, header, footer, and main content area.
 *
 * @param children - The page content to be rendered within the main section of the layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
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
