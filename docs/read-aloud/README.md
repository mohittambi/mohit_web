# Blog read aloud — documentation index

Client-side **read aloud** for long-form blog posts (`Web Speech API`), **word-level selection highlight** (where the browser fires `word` boundaries), **manual text selection**, **previous/next section**, **read from here to end**, and **play this section only**.

| Document | Purpose |
| :-------- | :------ |
| [PHASED_IMPLEMENTATION.md](./PHASED_IMPLEMENTATION.md) | Phases 0–5, **implementation status**, validation matrix (automated vs manual) |
| [PLAN_WITH_PHASE_VALIDATION.md](./PLAN_WITH_PHASE_VALIDATION.md) | **Phased plan + per-phase exit gates** — full-page `[data-read-aloud]`, selection preserve, theme outline; validate **before** each next phase |

**Code (implemented)**

- `components/blog/ReadAloudController.tsx` — chunks, `speakGenRef` navigation guard, **SkipBack / SkipForward**, **ListVideo** (from here), **BookMarked** (this section only), play / pause / stop; `getArticle()` → **`[data-read-aloud]`**; single-section **outline** + **selection preserve** for play-this-section (see [PLAN_WITH_PHASE_VALIDATION.md](./PLAN_WITH_PHASE_VALIDATION.md)). **Intra-chunk pauses:** long prose blocks are split on weak delimiters (`,`, `;`, `:`, em dash) and conservative sentence ends (`!` / `?` / `.` before space or end); tunable `PAUSE_WEAK_MS` / `PAUSE_STRONG_MS` / `MIN_SEGMENT_CHARS`. **`pre` / code blocks** are not split. **Pause / resume:** if playback stops while **between** sub-segments or during the inter-chunk gap (timers cleared on pause), **Resume** restarts the **current chunk** from its **first** segment (same as pre-delimiter behaviour for mid-gap resume).
- `app/blog/[slug]/page.tsx` — one **`<div data-read-aloud>`** wraps hero + body row (incl. TOC) after `<ReadingProgress />`; inner `<article>` has no duplicate attribute.
- `components/blog/BlogPostBody.tsx` — `.blog-prose` body.
- `app/globals.css` — **`[data-read-aloud]`** + `.blog-prose` **`user-select: text`**, read-aloud **`.read-aloud-section-active`** (outer outline) and **`.read-aloud-chunk-active`** (inset ring + tint) (overrides `body` `user-select: none` inside the read-aloud subtree).
- `components/blog/SelectionToolbar.tsx` — share/copy on text selection (≥ 12 chars).

**Product default:** **Stop** clears the text selection (`removeAllRanges()`); natural end of “play this section only” may **preserve** selection when the user had a non-empty selection inside the root (see plan Phase 2).

**Navigation & resume:** **Prev / Next** work whenever chunk data is still in memory (**Stop** clears chunks and resets). **Read aloud** from idle with saved chunks **resumes from the remembered index** if you stopped mid-article; if playback had reached the **last chunk**, **Read aloud** starts a **fresh pass** from the top (same as opening a new session). During full-post read, the active block uses **`.read-aloud-chunk-active`** (light accent-on-bg tint, soft inset ring, **padding** so text clears the ring); “play this section only” keeps **`.read-aloud-section-active`** (outer outline).

After each release, refresh **manual** checks in [PHASED_IMPLEMENTATION.md](./PHASED_IMPLEMENTATION.md) (Chrome / Safari / Firefox).
