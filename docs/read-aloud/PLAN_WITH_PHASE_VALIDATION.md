# Read aloud & blog selection — phased plan **with per-phase validation**

**How to use this document**

1. Implement **one phase at a time** in order.  
2. Complete **every validation row for that phase** (tick `[x]`) **before** starting the next phase.  
3. If a phase fails validation, **fix or revert** before proceeding.  
4. Record **browser + date** on manual rows when you sign off a release.

**Scope:** Full-post read-aloud root, **selectable** hero + body + TOC where applicable, **“read from here”** selection semantics, **“play this section only”** preserving **user `::selection`** when appropriate, **theme-aligned** active-section affordance, and **no regressions** to existing play/pause/stop/prev/next.

**Stop vs preserve (product default):** **Stop** always clears selection and resets suppress/outline (Phase 2 §5). Natural end of single-section play may **preserve** selection when playback started with a non-empty user selection in the root.

**Primary files**

| File | Role |
| :--- | :--- |
| `app/blog/[slug]/page.tsx` | DOM: where `data-read-aloud` attaches |
| `app/globals.css` | `user-select`, `::selection`, `.read-aloud-section-active` |
| `components/blog/ReadAloudController.tsx` | `getArticle()`, chunks, speech, selection policy |
| `docs/read-aloud/PHASED_IMPLEMENTATION.md` | Earlier feature checklist (keep in sync after changes) |

---

## Phase 0 — Baseline (no code change)

**Objective:** Confirm current behaviour so regressions are obvious after changes.

### Tasks

- [ ] **P0.T1** Open `/blog/<any-slug>` in Chrome; note where text **cannot** be selected today (e.g. hero vs body).  
- [ ] **P0.T2** Run **Read aloud**, **Pause**, **Resume**, **Stop** — works.  
- [ ] **P0.T3** **Prev / Next** while playing — no double speech.  
- [ ] **P0.T4** **Read from here** with caret in a paragraph — starts from expected chunk.  
- [ ] **P0.T5** **Play this section only** — plays one chunk; note whether **user selection** is **replaced** by word-follow (expected issue today).

### Phase 0 validation (exit gate)

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P0.V1** | Baseline behaviour documented in PR or notes | ☐ |
| **P0.V2** | `npm run build` green on `main` before branch | ☐ |

---

## Phase 1 — Single read-aloud DOM root (hero + body + TOC)

**Objective:** One subtree contains everything `buildArticleChunks` and selection helpers should treat as the “post page,” and **hero text** inherits `user-select: text` like the body.

### Design

- Wrap **all post content after** `<ReadingProgress />` in **one** element:  
  `<div data-read-aloud>` … `</div>`  
  (hero gradient block + divider + `px-6` body row **including** `BlogTOC`).
- Remove **`data-read-aloud`** from the inner `<article>` so there is **exactly one** root.

### Tasks

- [x] **P1.T1** Edit `app/blog/[slug]/page.tsx`: add wrapper; move attribute off inner `<article>`.  
- [x] **P1.T2** Edit `components/blog/ReadAloudController.tsx`:  
  `getArticle()` → `document.querySelector("[data-read-aloud]")`  
  (no longer `article[data-read-aloud]`).  
- [x] **P1.T3** Edit `app/globals.css`: replace  
  `article[data-read-aloud], article[data-read-aloud] .blog-prose`  
  with  
  `[data-read-aloud], [data-read-aloud] .blog-prose`  
  for `user-select: text` / `-webkit-user-select: text`.  
- [x] **P1.T4** Update `docs/read-aloud/README.md` and **Appendix** in `PHASED_IMPLEMENTATION.md` to say `[data-read-aloud]` (not `article[…]`).

### Phase 1 validation (exit gate — **block Phase 2 until complete**)

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P1.V1** | **DOM:** Exactly **one** `[data-read-aloud]` on blog slug page | ☐ |
| **P1.V2** | **Select:** User can drag-select **title** in hero **and** a **paragraph** in body | ☐ |
| **P1.V3** | **Read aloud** still finds chunks; audio plays from start | ☐ |
| **P1.V4** | **Read from here** with selection in body still resolves chunk index | ☐ |
| **P1.V5** | `npm run build` | [x] 2026-04-20 |

---

## Phase 2 — “Play this section only”: preserve user selection

**Objective:** When the user has a **real** text selection inside `[data-read-aloud]`, **do not** let per-word `selectWord` replace it; on **natural** end of single-chunk playback, **do not** `removeAllRanges()` if we preserved selection.

### Design

1. **Helper:** `hasUserTextSelectionInArticle(root: Element): boolean`  
   - `getSelection()`, `rangeCount`, `!isCollapsed`, trimmed `toString()`, `commonAncestorContainer` contained in `root`.

2. **Ref:** `suppressWordHighlightRef`  
   - Set **`true`** in `playThisSectionOnly` **only when** `hasUserTextSelectionInArticle(article)` is true **before** starting speech.  
   - Set **`false`** in `startReading`, `goToChunk`, `readFromHereToEnd`, and `cleanup`.

3. **`utt.onboundary`:** if `suppressWordHighlightRef.current` → **return** (skip `selectWord`).

4. **`removeAllRanges()`** on completion paths (`idx >= chunks.length`, single-section `onend`):  
   - `const preserve = suppressWordHighlightRef.current`  
   - `suppressWordHighlightRef.current = false`  
   - `if (!preserve) getSelection()?.removeAllRanges()`

5. **`cleanup` (Stop):**  
   - **Product default:** always `removeAllRanges()` + `suppressWordHighlightRef = false` (predictable reset).  
   - If product later chooses “keep selection on Stop,” document that as a **separate** phase.

### Tasks

- [x] **P2.T1** Add helper + refs + `onboundary` guard.  
- [x] **P2.T2** Wire `playThisSectionOnly` to set `suppressWordHighlightRef` from helper.  
- [x] **P2.T3** Adjust completion paths to conditional `removeAllRanges`.  
- [x] **P2.T4** Reset ref in all non–single-section entry points.

### Phase 2 validation (exit gate)

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P2.V1** | Select text inside a **`<p>`**, **Play this section only** — **selection unchanged** during playback | ☐ |
| **P2.V2** | Same, after section **ends naturally** — selection **still** present | ☐ |
| **P2.V3** | **No selection** (caret only) — word-follow **still works** (suppress false) | ☐ |
| **P2.V4** | Full **Read aloud** article — word-follow unchanged from pre–Phase 2 | ☐ |
| **P2.V5** | **Stop** mid single-section — speech stops; **selection cleared** (per default §5) | ☐ |
| **P2.V6** | `npm run build` | [x] 2026-04-20 |

---

## Phase 3 — Active section outline (theme aesthetics)

**Objective:** While **“this section only”** plays, show a **subtle** frame on the spoken block using **design tokens** (no random hex).

### Design

**CSS** (`app/globals.css`):

```css
.read-aloud-section-active {
  outline: 2px solid var(--ring);
  outline-offset: 0.25rem;
  border-radius: var(--radius-md);
}
```

**TS:** Ref `sectionOutlineElRef`; in `playThisSectionOnly` after resolving `one`, remove class from previous ref, add class to `one.el`. Clear class in `cleanup`, single-section `onend`, and when starting **full** flows (`startReading`, `goToChunk`, `readFromHereToEnd`).

### Tasks

- [x] **P3.T1** Add CSS class.  
- [x] **P3.T2** Add `clearReadAloudSectionOutline()` helper; call from all exit paths.  
- [x] **P3.T3** Apply outline when entering single-section play.

### Phase 3 validation (exit gate)

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P3.V1** | **Light** theme: outline readable, not harsh | ☐ |
| **P3.V2** | **Dark** theme: same | ☐ |
| **P3.V3** | After section end / Stop — **no** stray outline on DOM | ☐ |
| **P3.V4** | `npm run build` | [x] 2026-04-20 |

---

## Phase 4 — Documentation & cross-check

**Objective:** Repo docs match shipped behaviour; future readers know **Stop vs preserve** policy.

### Tasks

- [x] **P4.T1** Update `docs/read-aloud/README.md` (root element, files touched).  
- [x] **P4.T2** Update `docs/read-aloud/PHASED_IMPLEMENTATION.md` — Implementation status + appendix (`getArticle`, CSS selector, selection preserve).  
- [x] **P4.T3** Add a one-line pointer in this file’s header or `README` to **Stop clears selection** (Phase 2 default).

### Phase 4 validation (exit gate)

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P4.V1** | No stale `article[data-read-aloud]` references in docs | [x] |
| **P4.V2** | `CLAUDE.md` directory blurb still points at `docs/read-aloud/` (update if paths/names changed) | [x] |

---

## Phase 5 — Release sign-off (cross-browser)

**Objective:** Ship only after matrix is honest about Safari/Firefox limits.

### Validation matrix

| ID | Check | Chrome | Safari | Firefox |
| :--- | :---- | :----- | :----- | :------ |
| **P5.R1** | Full read aloud + word highlight | ☐ | ☐ | ☐ |
| **P5.R2** | Preserve selection + single section | ☐ | ☐ | ☐ |
| **P5.R3** | Read from here + selection | ☐ | ☐ | ☐ |
| **P5.R4** | SelectionToolbar (≥12 chars) | ☐ | ☐ | ☐ |
| **P5.R5** | Prev / next + gap skip | ☐ | ☐ | ☐ |

**Notes column (required for Safari/Firefox):** e.g. “`word` boundary sparse — selection UX still OK.”

### Phase 5 exit gate

| ID | Check | Pass |
| :--- | :---- | :--- |
| **P5.V1** | All P5.R* rows filled or explicitly **N/A** with reason | ☐ |
| **P5.V2** | `npm run build` on release branch | ☐ |

---

## Rollback (per phase)

| Phase | Rollback action |
| :--- | :-------------- |
| **1** | Revert `page.tsx` wrapper; restore `data-read-aloud` on `<article>`; revert `getArticle()` + CSS selector. |
| **2** | Remove helper/refs + restore unconditional `selectWord` / `removeAllRanges`. |
| **3** | Remove CSS class + all `classList` / ref usage. |

---

## Implementation log

| Date | Notes |
| :--- | :---- |
| 2026-04-20 | **P1–P4 code + docs:** single `[data-read-aloud]` root on blog slug page; `getArticle()` matches wrapper; CSS + `.read-aloud-section-active`; `hasUserTextSelectionInArticle` + `suppressWordHighlightRef` + conditional `removeAllRanges` on single-section natural end; outline cleared on cleanup / full-play starts / completion. **`npm run build` green** (P1.V5, P2.V6, P3.V4). **Manual** rows (P0, P1.V1–V4, P2.V1–V5, P3.V1–V3, P5) still require browser sign-off. |

## Traceability (optional but useful)

When opening a PR, paste **phase IDs** completed (e.g. “P1.V1–P1.V5 ✅”) in the PR description so reviewers can map commits to this file.
