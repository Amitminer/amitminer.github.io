# 🧑‍💻 Portfolio Website

This is my personal developer portfolio built using **Next.js**, styled with **Tailwind CSS**, and integrated with a dynamic GitHub API backend.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/amitminer/amitminer.github.io.git](https://github.com/amitminer/amitminer.github.io.git)
cd amitminer.github.io
npm install
````

### 2\. Set Up Environment Variables

Create the `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values:

```
NEXT_PUBLIC_BACKEND_URL=[https://your-backend-domain.com/api/github](https://your-backend-domain.com/api/github)
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_formspree_id_here
```

-----

### 3\. Backend Setup (Required)

> 📦 GitHub Stats & Projects require a backend API.

To enable dynamic GitHub stats and repositories:

1.  Clone the backend repo:
    👉 https://github.com/amitxd75/github-api-backend

2.  Follow its `README.md` to deploy it:

      * Locally (for dev)
      * Or via Netlify Functions (recommended)

Once deployed, use that backend URL as `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

-----

### 4\. Run Development Server

```bash
npm run dev
```

Visit your local site at:
📍 http://localhost:3000

-----

## 📡 API Backend

Backend Repo → [github-api-backend](https://github.com/amitxd75/github-api-backend)
Set it up properly, deploy to your server or Netlify, and configure `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

This enables real-time GitHub stats, repo data, and caching.
