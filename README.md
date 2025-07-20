# 🧑‍💻 Portfolio Website

This is my personal developer portfolio built using **Next.js**, styled with **Tailwind CSS**, and integrated with a dynamic GitHub API backend.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/amitminer/amitminer.github.io.git](https://github.com/amitminer/amitminer.github.io.git)
cd amitminer.github.io
pnpm install
```

### 2. Set Up Environment Variables

Create the `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values. See the [Environment Variables](#environment-variables) section below for the complete list of required variables.

-----

### 3. Backend Setup (Required)

> 📦 GitHub Stats & Projects require a backend API.

To enable dynamic GitHub stats and repositories:

1.  Clone the backend repo:
    👉 https://github.com/amitxd75/github-api-backend

2.  Follow its `README.md` to deploy it:

      * Locally (for dev)
      * Or via Netlify Functions (recommended)

Once deployed, use that backend URL as `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

-----

### 4. Run Development Server

```bash
pnpm dev
```

Visit your local site at:
📍 http://localhost:3000

-----

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=https://github-api-backend.netlify.app/api/github
NEXT_PUBLIC_LOCAL_BACKEND_URL=http://localhost:8000/api/github

# GitHub API Token (optional, for enhanced rate limits)
GITHUB_TOKEN=

# Formspree Form ID for contact form
NEXT_PUBLIC_FORMSPREE_FORM_ID=

# Cloudflare Turnstile Site Key for anti-spam protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

## 📡 API Backend

Backend Repo → [github-api-backend](https://github.com/amitxd75/github-api-backend)
Set it up properly, deploy to your server or Netlify, and configure `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

This enables real-time GitHub stats, repo data, and caching.

## 🚀 Docker

You can now run this app using Docker for easy deployment and local development.

### Build the Docker image
```sh
docker build -t my-portfolio-app .
```

### Run the Docker container
```sh
docker run -p 3000:3000 --env-file .env my-portfolio-app
```

- The app will be available at [http://localhost:3000](http://localhost:3000)
- Make sure to set up your `.env` file with the required environment variables before running.
