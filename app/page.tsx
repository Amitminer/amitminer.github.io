import Hero from '@/app/components/sections/Hero';
import About from '@/app/components/sections/About';
import TechStack from '@/app/components/sections/TechStack';
import GitHubStats from '@/app/components/sections/GitHubStats';
import Projects from '@/app/components/sections/Projects';
import Languages from '@/app/components/sections/Languages';
import Contact from '@/app/components/sections/Contact';
import Support from '@/app/components/sections/Support';

// The main Home component which renders the landing page
export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero/Banner section */}
      <Hero />
      
      {/* About me section */}
      <About />
      
      {/* Technology Stack section */}
      <TechStack />
      
      {/* GitHub statistics section (e.g., activity, commits, etc.) */}
      <GitHubStats />
      
      {/* Projects portfolio section */}
      <Projects />
      
      {/* Top Programming Languages section */}
      <Languages />
      
      {/* Contact form or info section */}
      <Contact />

      {/* Support section for contributions or feedback */}
      <Support />
    </div>
  );
} 
