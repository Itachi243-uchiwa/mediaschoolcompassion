

## Private Online Training Platform — V1

### Overview
A password-protected video course platform called "Formation Canva Pro — Église" with dark theme, orange accents, progress tracking via localStorage, and 9 pre-filled modules.

### Pages & Flow

1. **Password Gate** — Full-screen dark page with centered logo/title, password input, orange "Access" button, shake animation on wrong password, localStorage persistence

2. **Home Page** — Hero banner with title/description/CTA, global progress bar (X/9 videos watched — X%), 2-column grid of module cards (1-col mobile)

3. **Module Detail Page** — Back button, module info, list of video lessons with thumbnails, duration, description, watched status checkbox, orange checkmarks

4. **Video Player Page** — Back button, YouTube embed iframe (placeholder URL), video title/duration/description, "Mark as watched" button

### Key Features
- Single shared password: `canva2025`
- All progress in localStorage — no backend
- Real-time progress bars (global + per-module)
- 9 modules (Module 0–7 + Bonus), each with 1 video and placeholder descriptions
- Dark theme (#0A0A0A), orange accent (#F97316), Inter font
- Fully responsive

### File Structure
- `src/data/courseData.ts` — All module/video data
- `src/contexts/ProgressContext.tsx` — Progress state via localStorage
- `src/pages/PasswordGate.tsx` — Password screen
- `src/pages/Home.tsx` — Home with hero + module grid
- `src/pages/ModuleDetail.tsx` — Module video list
- `src/pages/VideoPlayer.tsx` — Video player + mark watched
- `src/components/ProgressBar.tsx` — Reusable progress bar
- `src/components/ModuleCard.tsx` — Module card component

