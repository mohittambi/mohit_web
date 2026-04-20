# Tactile engineering UI — detailed plan & review

This document turns the **“brutalist instrument panel / principal command center”** recommendation into an actionable rollout for **moh_web**. It assumes **no autoplay audio**, **surgical haptics**, **sharp geometry + visible structure**, **monospace for technical chrome**, and **diagrams over decorative imagery** — aligned with `docs/THEME.md` and the visual discipline already described in `docs/BLOG_CONTENT_PLAN.md`.

---

## 1. Goals & non-goals

### Goals

| Goal | Measurable outcome |
|------|---------------------|
| **Memorable visual identity** | A visitor can describe the site in one sentence (“sharp grid, technical type, no fluffy SaaS chrome”) without seeing the logo. |
| **Authority without gimmicks** | No surprise sound; motion reads **decisive** (instant or clearly purposeful), not “marketing smooth.” |
| **Structural honesty** | Section boundaries and controls read as **engineered layout** (borders/grid), not implied blobs of whitespace + shadow. |
| **Blog as proof** | Hero visuals for posts are **diagrams** (Excalidraw / Mermaid / exports), not stock photography — consistent with existing blog planning. |

### Non-goals (explicit)

- **Background music or ambient loops** — blocked/unwelcome in professional contexts; autoplay policies add fragility.
- **UI click / keyboard Foley** — high latency sensitivity and maintenance cost; defer unless you later add an **opt-in** “sound” toggle with Web Audio (out of scope for first pass).
- **Replacing long-form readability** — body copy stays a **technical sans** (**IBM Plex Sans**, primary choice per §10); monospace **extends** to nav labels, dates, metrics, key labels — not whole paragraphs.

---

## 2. Current baseline (repo audit)

Use this as the **before** snapshot so diffs stay intentional.

| Area | Today | Plan tension |
|------|--------|----------------|
| **Fonts** | `Plus Jakarta Sans` (UI/body today), `JetBrains Mono` (`--font-code`) — `app/layout.tsx`, `app/globals.css` | **Switch body to IBM Plex Sans** (§10); extend mono into nav, dates, KPI numbers. |
| **Radii** | `--radius-sm` … `--radius-xl` (0.375rem–1rem) used across UI | **Locked:** **0px** on outer containers/cards; **2px** on interactive inner controls (buttons, inputs, chips). |
| **Elevation** | `--shadow-sm`, `--shadow-md`, hero radial gradients (`.hero-gradient`) | **Remove radial hero gradients.** Flat surfaces + **subtle structural grid**; borders over shadows; shadows **rare** (e.g. modal only). |
| **Nav / CTA** | `Navbar`: `rounded-md` CTA, `transition-colors` hovers | Binary hovers (`[ Link ]`, invert fill) + **sharp** buttons; optional `font-mono` on nav. |
| **Icons** | `lucide-react` already in use | Keep; prefer **stroke** icons, `currentColor`, inline or co-located SVGs — **no new hotlinked** icon CDNs for core chrome. |
| **Motion** | `framer-motion` in dependencies; sections use motion | **Keep** framer-motion; **strip slow entrance** (no sweeps/fades **> ~0.3s**). Interactions **0.15s–0.2s**, stiff/linear “snap” easing. |
| **Blog assets** | `docs/THEME.md` + `docs/BLOG_CONTENT_PLAN.md` already push Excalidraw/Mermaid + `public/blog/{slug}/` | **Content freeze on new visuals** until **Phase C** ships (§10) — then author diagrams against **final** theme hexes/borders. |

---

## 3. Design system deltas (single source of truth)

**Canonical files:** `app/globals.css` (tokens + global utilities), optional small additions in `components/ui/*` primitives.

### 3.1 Shape language (locked)

- **Outer containers, cards, section frames:** **`border-radius: 0`** — keeps the architectural grid sharp.
- **Interactive inner controls** (buttons, inputs, chips, compact toggles): **`2px`** radius — enough affordance on mobile that controls read as **switches**, not accidental glitches.
- **Read-aloud / code highlights:** optional **`--radius-ui-soft`** (small, documented) only where highlight rings need separation from body copy — not the default card language.

### 3.2 Surfaces & grid (locked)

- **Prefer** `border border-[var(--border-color)]` (or tokenised `border-border`) between sections and panels **instead of** large shadow stacks.
- **Hero:** **no radial gradients** — remove `.hero-gradient` soft lighting. Use **flat** background + **subtle `repeating-linear-gradient`** (faint blueprint / graph-paper grid, ~1px structural lines) to expose the canvas.
- **Elsewhere:** avoid busy graph paper behind long **blog prose**; grid is for hero/marketing density, not article reading width.

### 3.3 Typography roles (concrete mapping)

| Content | Font | Notes |
|---------|------|--------|
| Body paragraphs, long blog | `font-sans` (**IBM Plex Sans**) | Technical UI density; drop Plus Jakarta (too round/warm for this aesthetic). Keep `blog-prose` readability tuning. |
| Nav links, footer links | `font-mono` + `text-sm` / `text-xs` | Tighten line-height; may need `tracking-tight` tuning. |
| Dates, read time, difficulty chips | `font-mono` | Aligns with “instrument readout.” |
| KPI strings (`7M+`, `$9K`, uptime) | `font-mono` | Already plausible in `PlatformMetrics` / hero — wire explicitly. |
| Inline code & file paths | `font-mono` | Existing. |

### 3.4 Colour & contrast (locked direction)

- **Drop indigo/violet** — reads generic B2B SaaS; not the instrument panel.
- **Base:** neutral **light/dark scale**; dark anchor **Foundry Grey** **`#1A1A1B`** (and derived surfaces/borders — tokenise in Phase A).
- **Single high-voltage accent** — colour is **state/alert**, not decoration. Pick **one** of **Terminal Green**, **Circuit Blue**, or **Safety Amber** during the Phase A token pass; lock **hex + hover** after **WCAG contrast** checks on `--bg` / `--surface`.
- Keep **semantic tokens** (`--bg`, `--surface`, `--border-color`, `--accent`, …) — brutalist does **not** mean accessibility regressions.
- **Hover “invert”** on links: ensure **focus-visible** remains distinct (`*:focus-visible`); test keyboard-only navigation after hover experiments.

### 3.5 Texture (noise overlay)

- Add a **single** fixed SVG noise layer (very low opacity, `pointer-events-none`) on `<body>` or a wrapper — **static** image, no animation (respects reduced motion and avoids GPU churn).
- Tune separately for **light** and **dark** (opacity differs).

### 3.6 Motion policy (locked)

| Pattern | Guidance |
|---------|----------|
| Entrance / scroll reveals | **Remove** slow, sweeping fades — nothing **> ~0.3s**; prefer **instant** first paint where possible. |
| Interactions (expand, toggle, drawer) | **0.15s–0.2s**; **linear** or stiff easing — **snap into socket**, not float. Keep `framer-motion` but **restrict** variants/durations accordingly. |
| Hover on text links | **Instant** colour/bg flip or bracket text; avoid long color tweens on default nav. |
| `prefers-reduced-motion: reduce` | Extend to new motion; respect in `globals.css` and component-level `framer-motion` props. |

---

## 4. Haptics (Android-first, silent fail elsewhere)

### 4.1 Behaviour (locked — surgical only)

Vibration applies **only** to meaningful **commit / state-change** actions — **nothing else** (avoid exhausting the user).

| Control | Action |
|---------|--------|
| **Primary CTA** | “Schedule a Call” |
| **Theme toggle** | Light ↔ Dark |
| **Architecture compare** | Lambda vs ECS toggle |

- **Pattern:** short pulse, e.g. `15` ms, or `[10, 30, 10]` for a “mechanical” double tick — pick one during implementation and stay consistent.

### 4.2 Implementation rules

- Feature-detect: `typeof navigator !== "undefined" && "vibrate" in navigator && typeof navigator.vibrate === "function"`.
- Call `navigator.vibrate(...)` inside **`pointerdown` / `click`** handlers (user gesture context).
- **Do not** rely on haptics for critical feedback — iOS Safari does not implement Web Vibration; desktop never vibrates.
- Respect **`prefers-reduced-motion`**: skip vibration when reduced motion is set (optional but consistent with “calm UI” ethics).

### 4.3 Centralisation

- Small **`useHapticTap()`** or **`hapticPrimary()`** helper in `lib/` or `hooks/` to avoid scattering magic numbers.

---

## 5. Sound

- **Ship:** silence by default.
- **Future (optional):** user-triggered, **muted until opt-in** UI sounds — only if you build an explicit Settings / “Enhance clicks” toggle; not v1.

---

## 6. Images & SVGs

| Asset type | Rule |
|------------|------|
| **Icons** | Continue **Lucide**; inline critical icons where theme colouring matters; avoid new external icon URLs for layout chrome. |
| **Hero / marketing illos** | Prefer **diagrams**, abstract geometry, or authored SVG — not generic stock. |
| **Blog** | Follow **`docs/BLOG_CONTENT_PLAN.md`**: Excalidraw + Mermaid, shared palette, assets under `public/blog/{slug}/`. **Until Phase C ships:** no **new** diagram authoring — see §10.7. |

---

## 7. Phased rollout (recommended order)

Phases reduce thrash: **tokens first**, then **shell** (nav/footer), then **home sections**, then **blog**, then **haptics + noise**.

### Phase A — Tokens & primitives (foundation)

- **Fonts:** swap `next/font` **Plus Jakarta Sans** → **IBM Plex Sans** (`app/layout.tsx`); keep **JetBrains Mono** for `--font-code`.
- **Colour:** replace indigo/violet scale with **neutral surfaces** + **Foundry Grey** dark base **`#1A1A1B`** (tokenise `--bg` / `--surface` / `--border-color` accordingly).
- **Accent:** lock **one** high-voltage accent (Terminal Green / Circuit Blue / Safety Amber) + `--accent-hover`, `--ring`, `--accent-muted`, `--accent-glow` — remove generic purple feel.
- **Radii:** `--radius-*` → **0** for outer/card; **2px** for interactive controls (document as `--radius-control` or Tailwind arbitrary scale).
- **Hero:** delete **radial** hero gradient usage; add **flat + subtle CSS grid** (`repeating-linear-gradient`) per §3.2.
- **Shadow vocabulary:** demote defaults; document when shadow is allowed (e.g. modal only).
- **`Card`**, **`Badge`**, shared buttons: **borders-first**, sharp outer shells.
- **`docs/THEME.md`:** IBM Plex + cold palette + radius/motion rules.

**Exit criteria:** One-page pass (home stub) — **flat**, **grid-backed hero**, **no violet**, **IBM Plex** body, cards **0px** / controls **2px**, borders visible without hunting hex in components. **Accent hex:** pick **one** hue (§10.2) and finalize **WCAG** `--accent` / `--accent-hover` / `--ring` (AA where text sits on accent or near small UI).

### Phase B — Global chrome

- **`Navbar` / mobile drawer:** mono nav labels; binary or bracket hovers; sharp CTA; remove long color transitions on links.
- **`Footer`:** same typography rules; dividers explicit.

**Exit criteria:** Keyboard nav + focus rings still visible; mobile sheet still usable.

### Phase C — Home sections (density & metrics)

- **`Hero`, `PlatformMetrics`, `TechStack`, `CaseStudies`, `Contact`:** apply monospace to metrics and technical labels; replace shadow-heavy cards with bordered panels.
- **`framer-motion`:** enforce §10.4 — **no** entrance **> ~0.3s**; interactions **0.15s–0.2s**, linear/stiff easing.

**Exit criteria:** Home still scores well on **readability** (not cramped); metrics scan as “instrument readouts”; motion feels **snapped**, not floaty.

**Diagram content:** **Unfreeze** new Excalidraw/Mermaid work **after** this phase passes exit criteria (per §10.7).

### Phase D — Blog surfaces

- **Index + post header:** dates, read time, tags in mono; optional subtle section borders.
- **`BlogPostBody`:** prose remains sans; diagrams remain the hero visual language.
- **`ReadAloudController`:** ensure new radius tokens don’t fight chunk highlight styles; adjust `--radius-ui-soft` if needed.

**Exit criteria:** Long posts remain comfortable; diagram-first identity unchanged.

### Phase E — Texture & haptics

- Noise overlay (light/dark tuned).
- Haptic helper wired to the **three** controls in §10.6 (CTA, theme toggle, Lambda/ECS compare).

**Exit criteria:** No layout shift from noise layer; no errors on iOS/desktop; vibration only on supported Android Chrome and only on those three actions.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| **Over-tight monospace** hurts scannability | Limit mono to chrome + numbers; keep `blog-prose` sans. |
| **Zero radius feels “broken”** on mobile touch targets | **Locked mitigation:** **2px** on buttons/inputs/chips; **0px** on outer shells only; keep **≥44px** tap targets. |
| **Binary hovers feel jarring** | Pair with clear focus styles; optional `transition-none` only on hover, not focus. |
| **Noise hurts readability or performance** | Very low opacity; static asset; disable under `prefers-reduced-motion` if users report distraction. |
| **Scope creep** | Track “shadow removal” and “mono adoption” as separate checklists per file. |

---

## 9. Testing checklist (manual)

- [ ] Light + dark: borders visible, no accidental low-contrast dividers.
- [ ] Keyboard: tab through nav, CTA, theme toggle, blog index, contact form.
- [ ] `prefers-reduced-motion`: no marquee or long fades where we added reduced-motion guards.
- [ ] Android Chrome: haptic fires **only** on §10.6 targets (CTA, theme toggle, Lambda/ECS compare); iOS/desktop: **no** `vibrate` errors.
- [ ] Lighthouse / accessibility spot-check: focus visible, tap target size.

---

## 10. Locked decisions (Phase A unblocked)

Authoritative answers — **principal-level command center**, not generic SaaS.

| # | Topic | Decision |
|---|--------|-----------|
| **1** | **Sharpness ceiling** | **0px** on **outer** layout frames, cards, section shells. **2px** on **inner** interactive controls (buttons, inputs, chips, compact toggles) so mobile targets read as deliberate **switches**, not broken layout. |
| **2** | **Accent philosophy** | **Remove indigo/violet.** Move to a **cold neutral** light/dark scale + **one** high-voltage accent (**Terminal Green**, **Circuit Blue**, or **Safety Amber** — pick **one** accent family in Phase A and tokenise hex + hover + ring). Colour = **state / alert / active**, not decoration. Dark anchor: **Foundry Grey `#1A1A1B`** (with derived `--surface`, `--border-color`). |
| **3** | **Hero treatment** | **Remove radial hero gradients** (`.hero-gradient`). **Flat** background + subtle **`repeating-linear-gradient`** blueprint / structural grid (~1px). High-density schematic, not soft studio lighting. |
| **4** | **Framer Motion** | **Keep** `framer-motion`. **Strip** slow entrance fades/sweeps (**nothing > ~0.3s**). Interaction motion **0.15s–0.2s**, **linear / stiff** easing — **snap**, not float. |
| **5** | **Body font** | **IBM Plex Sans** for UI + long-form body (via `next/font`). **Drop Plus Jakarta Sans** — too warm/round for this aesthetic. **JetBrains Mono** unchanged for `--font-code`. *(Fallback stance: Inter only if Plex loading or subset issues block ship.)* |
| **6** | **Haptics** | **Surgical only.** **`navigator.vibrate`** on: **(a)** primary CTA “Schedule a Call”, **(b)** theme toggle, **(c)** Lambda vs ECS architecture compare toggle. **No other** controls. |
| **7** | **Blog / diagrams** | **Content freeze on new diagram assets** (Excalidraw, Mermaid exports, palette-matched figures) until **Phase C** UI is shipped. Then author visuals using **final** theme hex codes and borders so diagrams **merge** with the reading layer. |

**Accent (locked, Phase A):** Same hue family, **mode-specific luminance**: **dark** `#00F0FF` (circuit cyan); **light** `#00929F` (blueprint teal, ~`hsl(185 90% 30%)`) for contrast on pale UI — `--accent` / `--ring` in `app/globals.css`. No secondary marketing palette outside grayscale + accent.

---

## 11. Suggested review workflow

1. ~~**You** answer §10~~ — **§10 locked** (above).
2. **Phase A** PR: Plex + palette + radius + hero grid + `docs/THEME.md` + primitive components — small, reviewable.
3. **Spot-check** home + one blog post in both themes.
4. Proceed **B → E**; **haptics + noise last** (Phase E) so structure ships first.
5. **After Phase C:** resume **blog diagram** production per `docs/BLOG_CONTENT_PLAN.md`.

---

*This plan is tied to the current codebase (Tailwind v4 `@theme inline`, `globals.css` tokens). §10 is locked — see table in §10.*
