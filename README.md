# Abinesh V — Portfolio

A light-themed React portfolio. The hero shows a 3D developer coding at his desk, who turns to greet visitors with "Hi 👋" when the page opens.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · GSAP 3 + ScrollTrigger · Three.js + React Three Fiber + Drei · Lucide icons

---

## 1. Run it locally (Windows)

Install **Node.js 20 or newer** (LTS) from https://nodejs.org, then in **PowerShell**:

```powershell
cd path\to\abinesh-portfolio
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173/Abinesh-profolio-website/`).

Production build and local preview:

```powershell
npm run build
npm run preview
```

The build output goes to `dist\`.

---

## 2. Things to personalise

| What | Where |
| --- | --- |
| **Email address** (currently a placeholder — Email buttons show "coming soon" until you change it) | `src/data/profile.js` → `email` |
| **Profile photo** | Save as `public/images/abinesh-profile.jpg` (portrait, ~800×1000, < 300 KB) |
| **Contact form** (saves to Supabase `contact_to_me`) | `.env` locally, GitHub repository variables for deploys — see section 4 |
| Skills | `src/data/skills.js` |
| Experience timeline | `src/data/experience.js` (add a company = add an object) |
| Projects, status labels, links | `src/data/projects.js` — set `url` only when a public link exists |
| Analytics / testing workflows | `src/data/workflows.js` |
| Hero poster image (instant first frame / fallback) | `public/images/hero-scene.webp` |

---

## 3. How the hero works

The hero is a live 3D workspace modelled on the reference art. It's built entirely in code with React Three Fiber, so there are no model files to download.

- **Character** (`src/components/3d/DeveloperCharacter.jsx`):
  - Swept hair made of tapered locks, big eyes with blinking lids and moving irises, brows, and a closed and an open smile.
  - Rosy cheeks, and an open brown hoodie over a black tee.
  - The arms use 2-bone IK (they position the elbows automatically from where the hands need to be), and each finger curls separately.
  - Change colours in the `LOOK` object at the top of the file, e.g. skin, hair or hoodie.
- **Workspace** (`src/components/3d/DeveloperScene.jsx`):
  - A window with blinds, and a back monitor running a live, self-typing code editor (`codeScreen.js`).
  - Shelves, plants, a desk lamp with warm light, a steaming mug and books.
  - A laptop with its lid facing the visitor, plus a cool screen glow on his face.
- **Greeting** (GSAP timeline in `src/sections/Hero.jsx`, once per page load):
  - He looks up at the visitor, smiles, raises his hand and waves, and the "HI 👋 Hey, I'm Abinesh!" bubble fades up.
  - He then lowers his hand, looks back at the laptop and starts typing.
- **Coding loop:**
  - Irregular finger taps and short thinking pauses, where his eyes glance away and his hands lift.
  - Random blinks, sometimes double; breathing; and small head movements.
  - The monitor only types while he's typing.
- **Performance:**
  - A pre-rendered poster (`public/images/hero-scene.webp`) shows instantly, and Three.js fades in over it once it loads.
  - The 3D chunk is lazy-loaded, and rendering stops when the hero is off screen.
  - Tablets and phones get a lighter mode: no shadow maps and a lower pixel ratio.
- **Fallbacks:**
  - No WebGL, data-saver or a very low-memory device: the poster is shown and the greeting bubble still appears.
  - Reduced motion: a static coding pose, no wave, and the bubble shows briefly.

To regenerate the poster after changing the scene, take a screenshot of the hero canvas with the browser set to reduced motion. Save it as `public/images/hero-scene.webp`.

---

## 4. Contact form → Supabase

The form posts directly to Supabase's REST API (`POST /rest/v1/contact_to_me`). It maps the fields like this:

| Form field | Column |
| --- | --- |
| Full Name | `contact_name` |
| Email Address | `contact_email` |
| Message | `description` |

`id` and `created_at` are left to the database.

**Code:**
- `src/config/supabase.js` is the only file that reads the URL and key.
- `src/lib/contactApi.js` handles validation and the request. Headers: `apikey` = publishable key, `Content-Type: application/json`, `Prefer: return=minimal`.
- The publishable key is not a JWT, so it is **not** sent as `Authorization: Bearer`. This follows Supabase's guidance for the new keys.

**Form behaviour:**
- Required fields and email format are validated.
- While sending, the button shows a spinner and a synchronous guard blocks double submits.
- Success is shown only on HTTP 201, and then the form clears.
- On failure the entered text is kept and a clear error is shown (rejected, offline, timeout, rate-limited).
- A hidden honeypot field catches simple bots.

### 4a. Local configuration
`.env` (already created and git-ignored):
```
VITE_SUPABASE_URL=https://phclbwfkfqfogvlcoxpw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
`.env.example` documents the same keys with placeholders. After changing `.env`, restart `npm run dev`.

### 4b. Database security — run once (required)
Open **Supabase Dashboard → SQL Editor** and run `supabase/contact_to_me_security.sql`. It:
1. Lists the current columns and policies, so you can check what's already there.
2. Enables Row Level Security. Never disable it.
3. Adds one **INSERT-only** policy for `anon`. It checks the lengths and the email format server-side.
4. Adds **no** SELECT, UPDATE or DELETE policies, so visitors can't read or change any messages.
5. Restricts column privileges: the public roles may insert only the 3 content columns.
6. Optionally adds a rate limit of 3 messages per email address per 10 minutes.

If step 1 shows an older policy that allows SELECT or ALL for `anon`/`public`, drop it by name, as the file explains.

You still see every message in **Table Editor**, because the dashboard bypasses RLS.

### 4c. Verify it end to end
1. `npm run dev`, open the site, and submit the form. You should see the green "Thank you" message.
2. Supabase → Table Editor → `contact_to_me`: the new row should be there.
3. Confirm visitors can't read the table. In PowerShell:
   ```powershell
   curl.exe "https://phclbwfkfqfogvlcoxpw.supabase.co/rest/v1/contact_to_me?select=*" -H "apikey: sb_publishable_v3iA9V8aooDPhjA-Fff1fQ_5aJa55Oa"
   ```
   The expected result is `[]` or a permission error. It must **not** return messages.
4. Submit with an invalid email. The form blocks it before any request is sent.

### Spam options
- **Included:** a honeypot field, server-side validation in the policy, and an optional per-email rate limit trigger.
- **If spam becomes a problem:** add Cloudflare Turnstile or hCaptcha. Supabase can't verify a CAPTCHA on a plain table insert, so this requires moving the insert into a Supabase Edge Function that verifies the token first. The form only needs its URL changed.

---

## 5. Deploy to GitHub Pages (same repo: `Abinesh-profolio-website`)

The Vite `base` is already set to `/Abinesh-profolio-website/` in `vite.config.js`, and a GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

### Step A — back up the current site (nothing is deleted)

```powershell
git clone https://github.com/abinesh1702/Abinesh-profolio-website.git
cd Abinesh-profolio-website
git checkout -b legacy-static-site
git push -u origin legacy-static-site
git checkout main
```

Your existing HTML site is now saved on the `legacy-static-site` branch.

### Step B — replace `main` with the new project

```powershell
# remove the old files from main (they remain on legacy-static-site)
git rm -r --quiet .
# copy everything from the new project folder EXCEPT node_modules and dist
robocopy "C:\path\to\abinesh-portfolio" . /E /XD node_modules dist
git add .
git commit -m "New React portfolio"
git push origin main
```

(`robocopy` returns exit code 1 when files were copied — that's success.)

### Step C — add the Supabase values for the build (one time)

GitHub → repository → **Settings → Secrets and variables → Actions → Variables tab → New repository variable**:

- `VITE_SUPABASE_URL` = `https://phclbwfkfqfogvlcoxpw.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = your `sb_publishable_…` key

The workflow passes these to `npm run build`. Without them the form shows "not connected yet" instead of failing.

### Step D — switch Pages to GitHub Actions (one time)

GitHub → repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow runs on every push to `main`. Watch it under the **Actions** tab; when it's green the site is live at
https://abinesh1702.github.io/Abinesh-profolio-website/

### Rolling back

Settings → Pages → Source: *Deploy from a branch* → `legacy-static-site` / root.

---

## 6. Project structure

```
src/
  components/      Navbar, Footer, SectionHeading, AnimatedButton, SkillCard,
                   ProjectCard, ProjectVisual, ExperienceTimeline, BrandIcons
  components/3d/   DeveloperScene, DeveloperCharacter, codeScreen
  sections/        Hero, About, Skills, Experience, Projects, Analytics,
                   Automation, ImmersiveTech, Contact
  config/          supabase.js (URL + publishable key from env)
  lib/             contactApi.js (validation + REST insert)
  hooks/           useGSAPAnimations.js (shared reveal system, motion prefs)
  data/            profile, skills, experience, projects, workflows
  styles/          index.css (Tailwind theme tokens + utilities)
public/
  images/          abinesh-profile.jpg  ← add your photo
                   hero-scene.webp (hero poster)
supabase/
  contact_to_me_security.sql  ← run once in the SQL Editor
```
