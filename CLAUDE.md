@AGENTS.md

# Mohit Tambi — Personal Portfolio Website

## Overview

Premium personal portfolio for Mohit Tambi, targeting Staff / Principal Engineer roles.
Built to impress CTOs, Hiring Managers, and Founders without exposing sensitive employer data.

**Live dev:** `npm run dev` → <http://localhost:3002> (or next available port)
**Build:** `npm run build`
**Deploy:** `vercel --prod`

---

## Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4 + CSS Variables
- **Animations** — Framer Motion v12
- **Dark mode** — `next-themes` (class strategy, default dark)
- **Icons** — `lucide-react` v1+ (no `Github`/`Linkedin` — removed upstream; use `SocialIcons.tsx`)
- **Fonts** — Plus Jakarta Sans (UI) + JetBrains Mono (code) via `next/font/google` — see `docs/THEME.md`
- **Forms** — `react-hook-form` (mailto action, no backend)

---

## Directory Structure

```text
app/
  layout.tsx          Root layout: fonts, ThemeProvider, SEO metadata
  page.tsx            Composes all 9 sections in order
  globals.css         Tailwind v4 @theme, design tokens, marquee keyframes
  docs/THEME.md       Colours, fonts, dark mode, token checklist
  docs/read-aloud/    Blog read aloud: phased impl + validation (`README.md`)

components/
  layout/
    Navbar.tsx        Fixed top nav, scroll blur, Logo, mobile hamburger
    Footer.tsx        Social links, copyright
  sections/
    Hero.tsx          Full-viewport hero, stats strip, CTAs
    About.tsx         Authority positioning, 4 pillars
    CaseStudies.tsx   Accordion cards (4 projects)
    TechStack.tsx     Scrolling marquee + tab-based expertise (no boxy cards)
    Writing.tsx       Medium article cards with extracted insights
    AIMultiplier.tsx  AI-as-multiplier 4-tile section
    OpenTo.tsx        Subtle availability section
    Contact.tsx       Calendly link + contact form (mailto)
  ui/
    Logo.tsx          SVG MT monogram (distributed-node triangle metaphor)
    ThemeProvider.tsx next-themes client wrapper
    ThemeToggle.tsx   Dark/light toggle
    Badge.tsx         Inline tag component
    Card.tsx          Surface card with optional hover state
    SectionHeader.tsx Label + title + description block
    SocialIcons.tsx   GithubIcon, LinkedinIcon, MediumIcon as inline SVGs

data/
  caseStudies.ts      4 project case studies (problem/constraints/solution/tech/outcomes)
  techStack.ts        Legacy data file — TechStack.tsx uses inline CATEGORIES array
  articles.ts         Medium article metadata + key insights

public/
  logos/              12 brand SVGs from cdn.simpleicons.org
                      (nodejs, typescript, aws, postgresql, redis, docker,
                       githubactions, terraform, opentelemetry, grafana,
                       anthropic, graphql)
  resume.pdf          ← REPLACE with actual resume before deploying
```

---

## Design System

### CSS Variables (theme tokens)

```text
Light mode (Blueprint teal on pale UI)   Dark (Foundry Grey + Circuit Cyan)
--bg: #f8f9fa                            --bg: #1a1a1b
--surface: #eff1f4                      --surface: #242426
--border-color: #e5e7eb                 --border-color: #333334
--text: #1a1a1b                         --text: #f3f4f6
--accent: #00929f                        --accent: #00f0ff
--accent-hover: #007a85                  --accent-hover: #00c8d6
```

Dark mode: `next-themes` adds `.dark` to `<html>`.
The Tailwind custom variant `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css` enables all `dark:` utilities.

---

## Customisation Guide

### Replace placeholder content

| File | What to change |
| ---- | -------------- |
| `public/resume.pdf` | Replace with actual resume PDF |
| `Contact.tsx` line ~47 | Replace Calendly URL placeholder |
| `Contact.tsx` line ~53 | Verify email address |
| `data/caseStudies.ts` | Add real metrics where safe |
| `data/articles.ts` | Add new Medium articles |

### Add a new case study

Add an entry to `data/caseStudies.ts` matching the `CaseStudy` interface.
The accordion in `CaseStudies.tsx` renders it automatically.

### Add a new tech logo

Place the SVG in `public/logos/`, then add a logo item with `file: "/logos/name.svg"` to the
relevant category in the `CATEGORIES` array inside `TechStack.tsx`.
Items with `size: "xl"` or `"lg"` render as image logos; `"md"` and `"sm"` render as text badges.

### Add a new article

Add an entry to `data/articles.ts`.
Include 2–3 `insights` strings for the callout quote display in the Writing section.

---

## Known Limitations

- `public/resume.pdf` is a placeholder — must be replaced before going live
- Calendly URL in `Contact.tsx` is a placeholder (`calendly.com/er-mohittambi`)
- Contact form uses `mailto:` — opens the user's email client, no backend required
- No headshot photo yet — add to `public/` and wire into `About.tsx` if desired

---

## Build & Deploy

```bash
npm run dev      # local dev with Turbopack hot reload
npm run build    # production build (check for errors before deploying)
vercel --prod    # deploy to Vercel (zero config, auto-detects Next.js)
```
