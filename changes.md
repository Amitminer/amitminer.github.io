# 🔖 Release v1.0.1 – Stable Portfolio Release

This is the **first stable release** of my personal portfolio site.  
As mentioned earlier – **this is a static project**, so don't expect frequent updates or maintenance.

---

## ✅ Fixes & Improvements

- Fixed minor linter issues and security flaws (e.g., forgot to disconnect `IntersectionObservers` 😅).
- Removed the **Skills** component – it was slow due to fetching, compiling, and calculating percentages.
- Added **skeleton loaders** to all sections for a cleaner and more professional look.
- Introduced a new **Tech Stacks** section replacing Skills — it showcases tools and technologies I'm familiar with.
- Enhanced **About** section:
  - Improved the typewriter effect.
  - Now the next paragraph appears **earlier** (without waiting for typing to fully complete), but stays **faded** until the first paragraph finishes rendering — improves pacing without hurting the experience.
---

## ✨ New Features

- **Visitor Counter**:
  - Shown in the **footer** (desktop) and **header** (mobile).
  - Counts total unique visitors.
  - Caching implemented for performance and to prevent abuse.

- **GitHub Stats**:
  - UI tweaks and layout fixes.
  - Reduced load time with caching.
  - Removed less useful stats; added things like account join date.

- **Top Languages**:
  - Fixed size and layout for all devices.
  - Added subtle border for improved visual separation.

- **Projects Section**:
  - UI and performance improvements.
  - Tab bar redesigned.
  - Project details now load correctly.
  - Increased limit to show more than 6 recent projects.

---

## 🎨 UI/UX Enhancements

- Light theme touch added (based on user suggestion).
- Subtle animated background added.
- Contact box and social link styles slightly revamped.
- Minor visual improvements and hover tweaks across the site.
- Added internal comments and light documentation for better maintainability.

---

Thanks for checking out my portfolio! 🙂
