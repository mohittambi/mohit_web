# Theme & typography

This site uses **CSS custom properties** (variables) for colours and layout tokens, **Tailwind CSS v4** `@theme inline` so utilities (`bg-background`, `text-foreground`, `font-sans`, `font-mono`) stay aligned with those variables, and **next-themes** with the `class` strategy (`.dark` on `<html>`).

---

## Fonts

| Role | Stack | Source |
|------|--------|--------|
| **UI & body** | Plus Jakarta Sans | `next/font/google` → `--font-display` on `<html>` |
| **Code & mono** | JetBrains Mono | `next/font/google` → `--font-code` on `<html>` |

- **Body** uses the display stack for all prose and UI. It is slightly tighter and more distinctive than Inter while staying highly readable.
- **`font-mono`** (Tailwind) resolves to JetBrains Mono for hero watermarks, inline code, and technical labels.

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
| `--accent` | Links, labels, focus ring base | Links, labels |
| `--accent-hover` | Hover state for accent | Hover state for accent |
| `--accent-glow` | Hero / ambient gradients | Hero / ambient gradients |
| `--accent-muted` | Tinted backgrounds (badges, chips) | Tinted backgrounds |
| `--success` | Status “live” dot, positive cues | Brighter green for dark UI |
| `--danger` | Error / destructive emphasis (sparingly) | Softer red on dark |

### Radius & shadow (both modes)

| Token | Use |
|-------|-----|
| `--radius-sm` … `--radius-xl` | Corner radii in custom CSS or inline `rounded-[var(--radius-lg)]` |
| `--shadow-sm`, `--shadow-md` | Card elevation when you want tokens instead of Tailwind defaults |
| `--ring` | Matches accent; used by global `*:focus-visible` |

**Rule of thumb:** do not hard-code hex colours in components unless it is a one-off chart or brand logo. Add a new token in `globals.css` if a pattern repeats.

---

## Layout & shape tokens

| Token | Typical use |
|-------|-------------|
| `--radius-sm` | Small chips, inputs |
| `--radius-md` | Buttons, small cards |
| `--radius-lg` | Cards, sections |
| `--radius-xl` | Hero panels, modals |
| `--shadow-sm` | Resting cards |
| `--shadow-md` | Hover / lifted cards |
| `--ring` | Focus ring colour (matches accent) |

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

**Blog index:** `/blog` uses `components/blog/BlogIndexWithTags.tsx` — compact tag strip (tags from on-site posts only), filters on-site posts and Medium cards by tag (OR). **Comments:** `components/blog/BlogComments.tsx` on each post — Giscus if `NEXT_PUBLIC_GISCUS_*` is set, else mailto form; see `docs/COMMENTS.md`.

---

## Accessibility

- Focus uses `outline` + `outline-offset` tied to `--accent` (see `globals.css`).
- `prefers-reduced-motion` is respected in section-level animations (e.g. AI cards); add the same media query when introducing new motion.

---

*Last updated alongside the Plus Jakarta Sans + JetBrains Mono refresh and expanded semantic tokens.*
