import Image from "next/image";
import Link from "next/link";
import { AnimatedContent } from "@/components/animated-content";
import { ContactForm } from "@/components/contact-form";
import { GitHubIcon, LinkedinIcon } from "@/components/icons";
import { ProjectsSection } from "@/components/projects-section";
import { GithubLink, LinkedinLink, Name } from "@/lib/config";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[880px] flex-col px-5 py-10 sm:px-8 sm:py-16 md:px-12 md:py-20">
      <AnimatedContent>
        <header
          data-animate="header"
          className="flex items-center justify-between pb-8 sm:pb-12"
        >
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-ink no-underline transition-opacity hover:opacity-75 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-lg"
            aria-label="amitxd.in home"
          >
            amitxd.in
          </Link>
        </header>

        <section
          className="flex flex-col items-center text-center pt-8 pb-16 sm:pt-14 sm:pb-24"
          aria-labelledby="intro-title"
        >
          <div
            data-animate="hero-pfp"
            className="relative mb-7 size-24 select-none overflow-hidden rounded-full border border-line sm:mb-8 sm:size-28 md:size-32 lg:size-36"
          >
            <Image
              src="/pfp.webp"
              alt={Name}
              width={144}
              height={144}
              priority
              decoding="async"
              draggable={false}
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 144px"
              className="pointer-events-none size-full select-none object-cover [-webkit-user-drag:none]"
            />
          </div>

          <div data-animate="hero-text">
            <h1
              id="intro-title"
              className="m-0 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-6xl md:text-7xl"
            >
              Hey, I&apos;m Amit.
            </h1>
            <p className="mt-6 max-w-[40rem] text-base leading-relaxed tracking-[-0.01em] text-pretty text-muted sm:mt-7 sm:text-lg md:text-xl lg:text-[1.3rem]">
              I make things with code.
              <br />
              Mostly Rust and Linux stuff, systems, performance, and low-level
              tools.
            </p>
          </div>

          <div
            data-animate="hero-buttons"
            className="mt-7 flex flex-wrap items-center justify-center gap-3.5 sm:mt-8 sm:gap-4"
          >
            <a
              href={GithubLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-line bg-line/20 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/50 hover:bg-line/40 hover:shadow-[0_4px_16px_rgba(255,255,255,0.06)] active:translate-y-0 active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-base focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <GitHubIcon className="size-4 fill-current transition-transform duration-200 group-hover:scale-110 sm:size-4.5" />
              <span>GitHub</span>
              <span className="text-xs text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:text-sm">
                ↗
              </span>
            </a>
            <a
              href={LinkedinLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-line bg-line/20 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/50 hover:bg-line/40 hover:shadow-[0_4px_16px_rgba(255,255,255,0.06)] active:translate-y-0 active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-base focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <LinkedinIcon className="size-4 fill-current transition-transform duration-200 group-hover:scale-110 sm:size-4.5" />
              <span>LinkedIn</span>
              <span className="text-xs text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:text-sm">
                ↗
              </span>
            </a>
          </div>
        </section>

        <section
          id="projects"
          data-animate="section"
          className="mb-16 scroll-mt-10 sm:mb-24"
          aria-labelledby="projects-title"
        >
          <ProjectsSection />
        </section>

        <section
          id="interests"
          data-animate="section"
          className="mb-16 scroll-mt-10 sm:mb-24"
          aria-labelledby="interests-title"
        >
          <h2
            id="interests-title"
            className="mb-6 text-sm font-medium tracking-tight text-muted sm:mb-8 sm:text-base md:text-lg"
          >
            Interests
          </h2>
          <p className="m-0 max-w-[42rem] text-sm leading-relaxed text-pretty text-muted sm:text-base md:text-lg lg:text-xl">
            Systems programming in Rust and C, Linux internals, OS kernel
            development, and lightweight desktop tooling.
          </p>
        </section>

        <section
          id="contact"
          data-animate="section"
          className="mb-16 scroll-mt-10 sm:mb-24"
          aria-labelledby="contact-heading"
        >
          <ContactForm />
        </section>
      </AnimatedContent>

      <footer className="mt-auto border-t border-line pt-6 text-xs text-faint sm:text-sm sm:pt-8">
        <span>
          © {new Date().getFullYear()} {Name}
        </span>
      </footer>
    </main>
  );
}
