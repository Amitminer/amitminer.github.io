# Project Instructions - AmitxD Portfolio

## Tech Stack
- **Package Manager**: [Bun](https://bun.sh/) (Mandatory: do not use npm/pnpm/yarn)
- **Framework**: Next.js 16.2.5 (App Router)
- **Library**: React 19.2.6
- **Styling**: Tailwind CSS 4, Lucide React, GSAP for animations
- **Tools**: ESLint 9+, TypeScript 6+, PostCSS 8+

## Development Workflows

### Standard Commands
- `bun dev` - Start development server
- `bun run build` - Create production build
- `bun run lint` - Run ESLint (targets the `app` directory)
- `bun install` - Install dependencies

### Deployment
- Deployed to **GitHub Pages** via GitHub Actions.
- Custom Dockerfile exists using `oven/bun:alpine`.

## Coding Conventions & Best Practices

### Hydration & SSR
- **Hydration Mismatch Prevention**: Always initialize client-side-only state (like `isDesktop` or window-dependent values) as `false`/`null` and update them inside a `useEffect` after mount.
- **Async Updates**: To satisfy React 19 linting, wrap `setState` calls that trigger cascading renders in `requestAnimationFrame`.

### Performance
- **Image Optimization**: Use WebP format for assets. Next.js image qualities [75, 80] are explicitly configured in `next.config.mjs`.
- **Impure Functions**: Avoid calling `Math.random()` or `Date.now()` directly during render. Move them to `useEffect` or static constants.

### Component Structure
- **Static Components**: Declare reusable sub-components (like Skeleton Loaders) outside the main component body to prevent state resets on every render.

## Contact & APIs
- **Formspree**: Requires `NEXT_PUBLIC_FORMSPREE_FORM_ID`. Use `'contact'` as a build-time fallback.
- **Turnstile**: Cloudflare Turnstile is used for security on the contact form.
- **GitHub Stats**: Custom backend URL configured in `.env.example`.
