# 🧑‍💻 Portfolio Website

Welcome to my personal portfolio — a fast, minimal, and modern site built with **Next.js**, styled using **Tailwind CSS**, and powered by a custom **GitHub API backend**.

🔗 **Live Preview**: [amitminer.github.io](https://amitminer.github.io/)  
📁 **Backend Repo**: [github-api-backend](https://github.com/amitxd75/github-api-backend)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Amitminer/amitminer.github.io.git
cd amitminer.github.io
bun install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values — every variable is documented with instructions inside `.env.example`.

### 3. Backend Setup

> 📦 GitHub Stats & Projects require a running backend.

1. Clone → [github-api-backend](https://github.com/amitxd75/github-api-backend)
2. Deploy locally or via Netlify Functions (see its README)
3. Set the URL as `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

### 4. Run

```bash
bun dev
```

📍 [http://localhost:3000](http://localhost:3000)

---

## 🌍 GitHub Pages Deployment

Secrets are set in repo → **Settings → Secrets and variables → Actions**.

The workflow (`deploy.yml`) handles the build automatically on every push to `main`. It sets `GITHUB_PAGES=true` to activate static export mode in `next.config.mjs`.

---

## 🐳 Docker

```sh
docker build -t my-portfolio-app .
docker run -p 3000:3000 --env-file .env.local my-portfolio-app
```

> Keep `GITHUB_PAGES=false` in `.env.local` for Docker deployments.
