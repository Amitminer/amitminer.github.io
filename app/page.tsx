import Hero from '@/app/components/sections/Hero';
import About from '@/app/components/sections/About';
import Skills from '@/app/components/sections/Skills';
import GitHubStats from '@/app/components/sections/GitHubStats';
import Projects from '@/app/components/sections/Projects';
import Languages from '@/app/components/sections/Languages';
import Contact from '@/app/components/sections/Contact';
import Support from '@/app/components/sections/Support';

/**
 * Renders the main landing page with all primary sections stacked vertically.
 *
 * This component serves as the entry point for the site, displaying the hero banner, about section, skills, GitHub statistics, project portfolio, languages, contact information, and support options in a centered, full-width layout.
 */
export default function Home() {
  return (
    // Flex container to vertically stack all sections and center them
    <div className="flex flex-col items-center w-full">
      {/* Hero/Banner section */}
      <Hero />
      
      {/* About me section */}
      <About />
      
      {/* Skills section */}
      <Skills />
      
      {/* GitHub statistics section (e.g., activity, commits, etc.) */}
      <GitHubStats />
      
      {/* Projects portfolio section */}
      <Projects />
      
      {/* Languages I speak or code in */}
      <Languages />
      
      {/* Contact form or info section */}
      <Contact />

      {/* Support section for contributions or feedback */}
      <Support />
    </div>
  );
}
