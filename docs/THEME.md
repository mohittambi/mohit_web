> **⚠️ MIGRATION IN PROGRESS (April 2026): "Tactile Engineering" UI**
> We are actively migrating away from SaaS-friendly defaults (indigo accents, rounded corners, soft shadows, Plus Jakarta Sans).
>
> **Current strict rules for all new commits:**
> 1. **Shape:** `0px` radius for structural containers; max `2px` for interactive controls. No drop shadows; use 1px borders for elevation.
> 2. **Typography:** `IBM Plex Sans` (or `Inter` fallback) for body. `JetBrains Mono` strictly reserved for technical chrome (nav, dates, metrics, code).
> 3. **Color:** Base is Foundry Grey (`#1A1A1B`). No violet/indigo.
> 4. **Motion:** No slow fades. Maximum duration `0.15s` linear snaps.
> *Do not introduce new SVG/diagram assets until Phase C of the UI rollout is complete.*

# Theme & typography

This site uses **CSS custom properties** (variables) for colours and layout tokens, **Tailwind CSS v4** `@theme inline` so utilities (`bg-background`, `text-foreground`, `font-sans`, `font-mono`) stay aligned with those variables, and **next-themes** with the `class` strategy (`.dark` on `<html>`).

---

## Fonts

| Role | Stack | Source |
|------|--------|--------|
| **UI & body** | IBM Plex Sans | `next/font/google` → `--font-display` on `<html>` |
| **Code & mono** | JetBrains Mono | `next/font/google` → `--font-code` on `<html>` |

- **Body** uses IBM Plex Sans for technical UI density; long-form blog uses the same stack with `blog-prose` tuning in `globals.css`.
- **`font-mono`** (Tailwind) resolves to JetBrains Mono for nav, dates, metrics, inline code, and technical labels — not for body paragraphs.

Files:

- `app/layout.tsx` — loads fonts and applies `className={\`${display.variable} ${code.variable}\`}` on `<html>`.
- `app/globals.css` — `@theme inline` maps `--font-sans` / `--font-mono` to those variables; `body` sets `font-family`.

To change fonts later: swap the `next/font/google` imports in `layout.tsx`, keep the same `--font-display` / `--font-code` variable names (or update both layout and `@theme` in `globals.css`).

---

## Colour tokens

Variables are defined on `:root` (light) and `.dark` (dark). Components should prefer **`var(--token)`** or Tailwind semantic colours where wired (e.g. `bg-background` if you map them in `@theme`).

| Token | Light intent | Dark intent |
|-------|----------------|--------------|
| `--bg` | Page background | Page background |
| `--surface` | Cards, nav blur, raised panels | Elevated surfaces |
| `--border-color` | Hairlines, dividers | Hairlines, dividers |
| `--text` | Primary copy | Primary copy |
| `--muted` | Secondary copy, captions | Secondary copy |
| `--accent` | **Blueprint teal** `#00929F` (~`hsl(185, 90%, 30%)`) — legible on light UI | **Circuit cyan** `#00F0FF` — terminal / instrument glow on Foundry Grey |
| `--accent-hover` | Darker teal (`#007584`) | Lighter cyan (`#66F7FF`) |
| `--accent-glow` | Teal-tinted wash | Cyan wash |
| `--accent-muted` | Teal-tinted surfaces | Cyan-tinted surfaces |
| `--success` | Status “live” dot, positive cues | Brighter green for dark UI |
| `--danger` | Error / destructive emphasis (sparingly) | Softer red on dark |

### Radius & shadow (both modes)

| Token | Use |
|-------|-----|
| `--radius-sm`, `--radius-lg`, `--radius-xl` | **`0`** — structural shells, cards, panels |
| `--radius-md` | **`2px`** — buttons, inputs, chips, compact controls |
| `--shadow-sm`, `--shadow-md` | **Deprecated for elevation** — prefer `1px` `border-color` borders; tokens kept transparent for legacy classnames |
| `--ring` | Matches `--accent`; used by global `*:focus-visible` |

**Dark base:** `--bg` on `.dark` is Foundry Grey **`#1A1A1B`** (see `globals.css`). **Accent:** **`#00F0FF`** in dark mode; **light mode** uses **`#00929F`** so links and rings stay WCAG-legible on pale backgrounds (same hue family, lower luminance).

**Rule of thumb:** do not hard-code hex colours in components unless it is a one-off chart or third-party logo. Add a new token in `globals.css` if a pattern repeats.

---

## Layout & shape tokens

| Token | Typical use |
|-------|-------------|
| `--radius-sm` | Structural (0) |
| `--radius-md` | Interactive controls (**2px**) |
| `--radius-lg` | Structural shells (**0**) |
| `--radius-xl` | Structural (**0**) |
| `--shadow-sm`, `--shadow-md` | Unused for elevation — use borders |
| `--ring` | Focus ring (**Circuit Blue**) |

Use via `var(--radius-lg)` in custom CSS, or extend Tailwind `@theme` with `--radius-*` if you want `rounded-[length:var(--radius-lg)]`-style utilities consistently.

---

## Dark mode

- **Provider:** `components/ui/ThemeProvider.tsx` — `next-themes`, `attribute="class"`, `defaultTheme="light"`, `enableSystem`.
- **Selector:** `.dark { ... }` in `globals.css` overrides the tokens above.
- **Toggle:** `components/ui/ThemeToggle.tsx`.

Adding a new colour: set it under both `:root` and `.dark` unless it is identical in both modes.

---

## Blog reading layer

- Wrapper class **`blog-prose`** on `BlogPostBody` sets comfortable line height and slight negative tracking for long articles. Tweak in `globals.css` under the `/* Blog */` comment.

---

## Files checklist

| Concern | File |
|---------|------|
| Tokens, `@theme`, base styles | `app/globals.css` |
| Font loading | `app/layout.tsx` |
| Theme class on `<html>` | `components/ui/ThemeProvider.tsx` |
| Focus outline default | `globals.css` (`*:focus-visible`) |
| Canonical blog URLs (LinkedIn seeds, cross-links) | `data/blog/site.ts` (`SITE_ORIGIN`, `blogPostUrl`) — keep origin aligned with `app/layout.tsx` `metadataBase` |

Career-layer **distribution / reference** lines live in `data/blog/career/{slug}.ts` as `linkedInThread` (data field name is legacy). On the post they render under **“References & links”** with **labeled hyperlinks** (not raw URL text)—include real `blogPostUrl(...)` plus external docs where they help.

**Blog figures (plan):** target **5–12** diagrams/images per shipped post; use **Excalidraw** (primary, sketch architecture) + **Mermaid** (sequences/state machines) with a shared palette—see **`docs/BLOG_CONTENT_PLAN.md`** → *Visual assets & diagram consistency*. Assets live under `public/blog/{slug}/`.

**Blog index:** `/blog` uses `components/blog/BlogIndexWithTags.tsx` — compact tag strip (tags from on-site posts only), filters on-site posts and Medium cards by tag (OR). Each on-site card surfaces **`readTime`** + **`difficulty`** (`Foundational` | `Intermediate` | `Deep dive` from `data/blog/posts/*.ts`) before the description. **Further reading:** optional `further_reading` sections merge from `data/blog/further-reading.ts` (after `read_next`) and render as titled external links plus context notes in `BlogPostBody.tsx`. **Comments:** `components/blog/BlogComments.tsx` on each post — Giscus if `NEXT_PUBLIC_GISCUS_*` is set, else mailto form; see `docs/COMMENTS.md`.

---

## Accessibility

- Focus uses `outline` + `outline-offset` tied to `--accent` (see `globals.css`).
- `prefers-reduced-motion` is respected in section-level animations (e.g. AI cards); add the same media query when introducing new motion.

---

*Last updated alongside the tactile migration: IBM Plex Sans, Foundry Grey dark base, **light** blueprint teal `#00929F` / **dark** circuit cyan `#00F0FF`, sharp radii.*
