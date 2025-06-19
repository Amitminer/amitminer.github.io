import Hero from "@/app/components/sections/Hero"
import About from "@/app/components/sections/About"
import TechStack from "@/app/components/sections/TechStack"
import GitHubStats from "@/app/components/sections/GitHubStats"
import Projects from "@/app/components/sections/Projects"
import Languages from "@/app/components/sections/Languages"
import Contact from "@/app/components/sections/Contact"
import Support from "@/app/components/sections/Support"
import AnimatedSections from "@/app/components/sections/AnimatedSections"

export default function Home() {
  return (
    <AnimatedSections>
      {/* Hero/Banner section */}
      <div className="animated-section">
        <Hero />
      </div>

      {/* About me section */}
      <div className="animated-section">
        <About />
      </div>

      {/* Technology Stack section */}
      <div className="animated-section">
        <TechStack />
      </div>

      {/* GitHub statistics section */}
      <div className="animated-section">
        <GitHubStats />
      </div>

      {/* Projects portfolio section */}
      <div className="animated-section">
        <Projects />
      </div>

      {/* Top Programming Languages section */}
      <div className="animated-section">
        <Languages />
      </div>

      {/* Contact form or info section */}
      <div className="animated-section">
        <Contact />
      </div>

      {/* Support section for contributions */}
      <div className="animated-section">
        <Support />
      </div>
    </AnimatedSections>
  )
}
