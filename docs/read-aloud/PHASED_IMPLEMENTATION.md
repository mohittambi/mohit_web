# Read aloud: phased implementation & validation

**Goal:** Reliable **read aloud** on `/blog/[slug]`, visible **word highlight** during speech where the browser supports it, working **manual selection** (and `SelectionToolbar`), **previous/next chunk**, **play this section only** and **read from here to end**, and clear **pointer / cursor** affordances.

**Follow-up plan (full-page root, preserve selection, theme outline):** [PLAN_WITH_PHASE_VALIDATION.md](./PLAN_WITH_PHASE_VALIDATION.md) — implement **phase-by-phase** and tick **per-phase validation** before continuing.

---

## Implementation status (repository)

| Phase | Status | Evidence in repo |
| :--- | :----- | :--------------- |
| **0** | Criteria locked | Table below (A1–A6); manual browser matrix still required each release |
| **1** | **Done** | `app/globals.css` — `[data-read-aloud], [data-read-aloud] .blog-prose { user-select: text; }`; blog slug page — single **`<div data-read-aloud>`** root (see [PLAN_WITH_PHASE_VALIDATION.md](./PLAN_WITH_PHASE_VALIDATION.md) Phase 1) |
| **2** | **Done** | `ReadAloudController`: all controls are native `<button type="button">` with `title` + `aria-label`; shared `iconBtn` includes `cursor-pointer` and disabled `cursor-not-allowed` |
| **3** | **Done** | `speakGenRef` + `bumpSpeakGen()` on stop / start / navigation; **SkipBack** / **SkipForward** call `goToChunk(currentIdx ± 1)`; `currentIdx` state syncs UI disabled bounds |
| **4** | **Done** | **BookMarked** — `playThisSectionOnly()` (single chunk, restore full list after); **ListVideo** — `readFromHereToEnd()` (full rebuild, start at selection anchor or current index) |
| **5** | Ongoing | Run regression table before each release; speech remains **manual** in headless E2E |

**Build validation:** `npm run build` passes (TypeScript + Next) after controller + CSS changes.

**Canonical code**

- `components/blog/ReadAloudController.tsx` (`getArticle()` → `[data-read-aloud]`; preserve selection + section outline per plan)
- `app/blog/[slug]/page.tsx` (wrapper **`[data-read-aloud]`**)
- `components/blog/BlogPostBody.tsx` (`.blog-prose`)
- `app/globals.css` (`body` `user-select`, `[data-read-aloud]` override, `::selection`, `.read-aloud-section-active`)
- `components/blog/SelectionToolbar.tsx`

**Note:** Phase numbers in the tables **above** (0–5) are this file’s original rollout order. **[PLAN_WITH_PHASE_VALIDATION.md](./PLAN_WITH_PHASE_VALIDATION.md)** uses a newer phase split (full-page root, selection preserve, theme outline); follow that doc for the latest exit gates.

---

## Phase 0 — Baseline & acceptance criteria

Lock these before changing behaviour:

| ID | Criterion | Impl |
| :--- | :---------- | :--- |
| **A1** | While read‑aloud **plays**, spoken words are **visibly highlighted** where supported (document browser gaps). | Unchanged logic; **manual** per browser |
| **A2** | User can **drag-select** article text; `::selection` styling is visible. | **Done** — Phase 1 CSS |
| **A3** | `SelectionToolbar` still appears for selections **≥ 12** characters (existing rule in `SelectionToolbar.tsx`). | **Manual** verify |
| **A4** | **Previous / next** move to adjacent **chunk** without double audio or stuck inter-chunk timers. | **Done** — Phase 3 |
| **A5** | **Play one section** vs **read from here to end** — both behaviours implemented; **tooltips** describe each. | **Done** — Phase 4 |
| **A6** | **Pointer / cursor:** controls use clear affordances (`pointer` / `<button>` defaults); optional per-block control does not break text selection. | **Done** — Phase 2 |

**Browser matrix (minimum manual pass):** Chrome (baseline), Safari, Firefox — `SpeechSynthesis` **`word`** `onboundary` support varies.

---

## Phase 1 — Selection & word highlight (CSS)

### Problem

`body` sets `user-select: none` in `app/globals.css`. Article prose under `.blog-prose` **inherits** it unless overridden. That often **hides or weakens** programmatic `Selection.addRange()` highlights from `ReadAloudController` and blocks normal drag-select.

### Implementation

1. On **`[data-read-aloud]`** and **`[data-read-aloud] .blog-prose`**, set `user-select: text` and `-webkit-user-select: text`. **Shipped in** `app/globals.css`.
2. Scope stays **inside the read-aloud wrapper** so `body { user-select: none; }` remains for the rest of the site.
3. Re-test marketing/landing pages if you ever widen the rule beyond that subtree.

### Phase 1 validation

| Step | Action | Pass |
| :--- | :----- | :--- |
| **V1.1** | Open `/blog/<slug>`, drag across a paragraph | Selection visible (`::selection`). **→ [ ] manual** |
| **V1.2** | Start read aloud, observe several words | Highlight tracks audio in **Chrome**. **→ [ ] manual** |
| **V1.3** | Select ≥ 12 characters | `SelectionToolbar` appears. **→ [ ] manual** |
| **V1.4** | `CopyGuard` in `app/layout.tsx` | Shortcuts blocked; toolbar copy via `clipboard.writeText` still OK. **→ [ ] manual** |

---

## Phase 2 — Pointer & cursor UX

### Goals

- Read‑aloud **buttons** are obviously interactive (`<button>`, `title` / `aria-label`).
- Any new **skip** or **read section** control: `cursor: pointer` (default on buttons unless CSS resets).
- Avoid putting `cursor: pointer` on **all** paragraphs unless they are truly clickable (conflicts with selection).

### Implementation

1. Audit global styles for `button { cursor: … }` overrides.
2. New controls: explicit **`aria-label`** / **`title`**, **`type="button"`**, tab order **`tabIndex`** only if not native `<button>`.
3. Optional: `cursor: progress` on article during playback — usually **omit** unless product asks.

### Phase 2 validation

| Step | Action | Pass |
| :--- | :----- | :--- |
| **V2.1** | Hover read‑aloud controls | Pointer / hand affordance. **→ [ ] manual** |
| **V2.2** | Tab through toolbar + read aloud | `:focus-visible` ring visible, order sensible. **→ [ ] manual** |
| **V2.3** | Plain prose (no per-block play) | Default **I-beam** / text cursor; selection still works. **→ [ ] manual** |

---

## Phase 3 — Skip forward / backward (chunk navigation)

### Model

- **Chunks:** built in `startReading()` — list of `ParaChunk` in `chunksRef` (`ReadAloudController.tsx`).
- **Index:** `idxRef` + `speakChunk(idx)`; `utt.onend` schedules `speakChunk(idx + 1)` after `PAUSE_MS`.

### Implementation outline

1. **`cancelSpeechAndTimer()`** — `clearTimer()`, `speechSynthesis.cancel()`, optionally clear selection between skips.
2. **`goToChunk(nextIdx)`** — clamp to `[0, chunks.length - 1]`; cancel; set `stoppedRef` as needed; call `speakChunk(nextIdx)`.
3. **Race guard:** increment a **`speakGenRef`** on every navigation / `startReading`; in `onend` and the `PAUSE_MS` timeout, **ignore** stale callbacks if generation changed.
4. **UI:** Previous / Next (`lucide-react` e.g. `SkipBack`, `SkipForward`), **disabled** when no chunks or at bounds.
5. **Paused state:** Next/Prev should cancel + speak target chunk and set state to **playing**.

### Phase 3 validation

| Step | Action | Pass |
| :--- | :----- | :--- |
| **V3.1** | Playing, press **Next** mid-chunk | New chunk from start; no overlapping utterances. **→ [ ] manual** |
| **V3.2** | From chunk `0`, **Previous** | Disabled at first chunk. **→ [x] code** (disabled when `currentIdx <= 0`) |
| **V3.3** | Last chunk, **Next** | Disabled. **→ [x] code** (`currentIdx >= nChunks - 1`) |
| **V3.4** | Skip during **250 ms** gap between chunks | No duplicate `speakChunk` (`speakGenRef`). **→ [ ] manual** |

---

## Phase 4 — Play one section only vs read from here

Choose **one** primary behaviour (document in UI).

| Mode | Behaviour |
| :--- | :---------- |
| **4A — Single chunk** | User triggers “read this section” on one block → `chunksRef = [one chunk]` → `speakChunk(0)` → on end, **do not** chain `idx + 1`. |
| **4B — Read from here** | Build full chunk list; find index `k` for target element → `speakChunk(k)` → normal chain to end. |

### Implementation notes

- **Target element:** `event.target.closest(PARA_SELECTORS)` inside **`[data-read-aloud]`**.
- **`buildChunk(el)`** already exists — reuse for 4A.
- For 4B, reuse full scan from `startReading`, then find `i` where `chunks[i].el === el` (or `contains`).

### Phase 4 validation

| Step | Action | Pass |
| :--- | :----- | :--- |
| **V4.1** | **4A:** **BookMarked** — play once, then idle; full chunk list restored for next navigation | **→ [ ] manual** (restore in `utt.onend` + `idx >= length` path) |
| **V4.2** | **4B:** **ListVideo** — mid-article with selection or paused index | Reads through end in order. **→ [ ] manual** |
| **V4.3** | Empty post / no prose | `buildArticleChunks` returns `[]`; buttons no-op where applicable. **→ [x] code** |

---

## Phase 5 — Full regression (post‑implementation)

Run after **all** desired phases ship; record **Pass/Fail** and browser in the PR or release notes.

### Functional

| # | Check | Pass |
| :--- | :---- | :--- |
| **R1** | Read aloud: start, pause, resume, stop | ☐ manual |
| **R2** | Word highlight (Chrome) | ☐ manual |
| **R3** | Manual selection + toolbar | ☐ manual |
| **R4** | Prev / next chunk | ☐ manual |
| **R5** | Single-section / read-from-here | ☐ manual |
| **R6** | Rapid skip / stop — no console errors | ☐ manual |

### Accessibility

| # | Check | Pass |
| :--- | :---- | :--- |
| **A11** | New buttons have accessible names | ☐ |
| **A12** | All new controls keyboard-operable | ☐ |

### Cross-browser (document gaps; do not hide)

| Browser | Read aloud | Word highlight | Notes |
| :--- | :--------- | :------------- | :---- |
| Chrome | ☐ | ☐ | Baseline |
| Safari | ☐ | ☐ | `word` boundary may be weak |
| Firefox | ☐ | ☐ | Verify |

### Performance

| # | Check | Pass |
| :--- | :---- | :--- |
| **P1** | No per-boundary logging in hot paths | ☐ |
| **P2** | Navigate away / unmount: `cleanup()` runs | ☐ |

---

## Appendix — Code anchors (current)

| Topic | Location |
| :--- | :------- |
| Chunk build | `buildArticleChunks`, `startReading`, `readFromHereToEnd`, `playThisSectionOnly` in `ReadAloudController.tsx` |
| Inter-chunk delay | `PAUSE_MS` + `setTimeout` in `utt.onend` |
| Stale callback guard | `speakGenRef`, `bumpSpeakGen()`, capture `gen` in `speakChunk` / `onend` / timer |
| Word highlight | `selectWord` + `utt.onboundary` (`e.name === "word"`), with `baseOffset` when a chunk uses multiple utterances (`splitSpeakSegments`) |
| Intra-chunk pauses | `splitSpeakSegments` — weak/strong ms after delimiters; no split inside `pre`; see [README.md](./README.md) |
| Current chunk highlight | `.read-aloud-chunk-active` on `chunk.el` during full-post read; `.read-aloud-section-active` for “play this section only” |
| Article root query | `getArticle()` → `document.querySelector("[data-read-aloud]")` |
| Paragraph selectors | `PARA_SELECTORS` constant |
| Selection → chunk index | `chunkIndexFromSelection` |
| Restore after single section | `restoreIndexAfterSingleSection` |
| Nav UI index | `currentIdx` state (synced with `idxRef`) |

---

## E2E note

Headless **Playwright** often lacks real **`speechSynthesis`** or consistent **`word`** events — treat **speech** checks as **manual** unless you inject mocks. Automated tests can still cover **DOM**, **buttons disabled**, and **CSS** `user-select` on **`[data-read-aloud]`**.
