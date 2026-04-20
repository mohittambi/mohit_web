# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

# Post 7 — Context windows are not a database: **context “storage leak”** math & cache economics (April 2026 framing)

**Canonical post:** `/blog/context-windows-caching-sessions`  
**Slug:** `context-windows-caching-sessions`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§7 Context Windows Are Not a Database** (outline items 1–7)  
**Purpose:** Kill the anti-pattern of **megabyte transcripts as source of truth**—with **Gemini-style long context + hourly cache storage** vs **Claude-style prompt cache (TTL + write/read economics)**, **summarization ROI**, and **TTL discipline** so “stuffing the window” reads as **high-interest debt**, not free RAM.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/context-windows-caching-sessions.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers

- All **model names**, **$/M**, **cliffs**, and **cache storage $/M/hr** are **April 2026 authoring placeholders**—replace with **live** Google / Anthropic / **Bedrock** pricing and **exact** cache billing rules before publish.  
- **Token counts for “1 MB text”** vary by tokenizer; **250k–300k tokens** is a **planning range**, not a constant.  
- **“Percent gap”** between S3 and context is a **bad headline metric** (mixes $/GB-month with $/request)—use **$/month for the same user story** and optionally **order-of-magnitude ratio** without fake “million %.”

---

## 1. Gemini 3.1 series — long context & caching (authoring table)

| Metric | Gemini 3.1 Flash (illustrative) | Gemini 3.1 Pro (illustrative) |
| :----- | :------------------------------ | :------------------------------ |
| **Base input** (<200k tokens) | $0.50 / 1M | $2.00 / 1M |
| **Long context** (>200k cliff) | $0.50 / 1M (flat in this draft) | **$4.00 / 1M (2× cliff)** |
| **Cached token read** | $0.05 / 1M | $0.20 / 1M |
| **Cache storage fee** | **$1.00 / 1M tok / hr** | **$4.50 / 1M tok / hr** |

**200k cliff (Pro):** long-context RAG that crosses the cliff pays an **invisibility tax**—surface it in **FinOps** review, not only in latency charts.

---

## 2. Quantifying the “1 MB session leak” (three scenarios — same user story)

**Assumptions for the parable:** **~0.3M tokens** ≈ **1 MB-class transcript** stuffed into **every** request; **100 requests/day** → **~3,000 calls/month**; **Gemini 3.1 Pro** long-context **$4/1M input** for the leak path; cache read **$0.20/1M**; cache storage **$4.50/M/hr**; **720 h/month** for “always-on” cache storage (tune to **real TTL** in production).

### Scenario A — leak (no cache, pay full long-context input every call)

- **Per call:** 0.3M × **$4.00/M** = **~$1.20**  
- **Monthly:** 3,000 × $1.20 = **~$3,600**

### Scenario B — “optimized” with context caching (authoring simplification)

**Important:** real invoices split **storage hours** × **cached token footprint** and **per-request cached read** differently—use this as **directional**, then model in the vendor calculator.

- **Storage (naive full-month reservation):** 0.3M × **$4.50/hr** × **720 h** ≈ **$972**  
- **Cached reads:** 0.3M × **$0.20/M** × 3,000 calls ≈ **$180**  
- **Total (draft):** **~$1,152 / month** (still enormous vs durable store)

### Scenario C — traditional durable store + RAG-shaped retrieval

- **S3 (ap-south-1)**, **1 MB** object footprint: order-of-magnitude **~$0.00002/month** storage (verify tier + requests).  
- **RAG per call:** e.g. **~2k tokens** into model per request—**$/call** depends on model tier; an authoring line like **~$0.008/call** must show **which model** and **input-only vs output**.

**Verdict for copy:** context-as-database is **orders of magnitude** more expensive than **S3 + selective retrieval** for the same *information*—the win is **architecture** (external state, chunking, summaries), not “bigger window.”

---

## 3. Summarization vs long context vs RAG — ROI framing

| Strategy | Cost factor | Best for |
| :------- | :---------- | :------- |
| **Context caching (Gemini-style)** | **High $/hr storage** + cheap(ish) hits | **Active** sessions, repetitive tool loops, **short TTL** hot prefixes |
| **Summarization** | **One-time output token** bill + validator passes | **Multi-day** memory; compress **300k → ~5k** “executive summary” **stored in DB** |
| **RAG (“the DB”)** | Retrieval latency + index ops | **Large corpora**, audit trails, **compliance**-grade retention |

**Principal “golden path” copy:** **Summarization-as-a-service** — pay the **output tax once** to shrink history, persist **validated** summary + pointers in **Postgres/S3**, and stop re-buying the same megabytes **per turn**.

**Plan alignment:** summarisation **failure** case (bad summary) belongs in outline **§3** per validation checklist.

**Summarization failure case:**
If a summary omits critical facts or introduces errors, the cost savings from compression are offset by downstream mistakes. Always validate summaries with schema checks and sample audits. Document a real or hypothetical failure case in the post.

**Token histogram/table prompt:**
Publish a before/after token histogram or table showing the effect of summarization or context compression on actual token usage and cost.

---

## 4. “Compression ROI” box (outline §3)

**Prompt for authors:** After every **N messages** (e.g. **10**), run a **bounded** summarization job:

- **Inputs:** rolling window transcript slice + prior summary checksum/version.  
- **Outputs:** new summary + **schema-validated** facts list (or “unknowns”).  
- **Economics:** compare **(N × full-window calls)** vs **(1 × summarize + N × small-window calls)** using **your** real token meters—publish **before/after token histogram** screenshot or table, not vibes.

---

## 5. Cache layers & TTL — Gemini hourly storage (outline §4)

**TTL discipline:** with **$4.50 / 1M tok / hr** (Pro), **24 h** for **1M cached tokens** is roughly **$4.50 × 24 = $108** **storage-line** intuition (verify billing semantics—some products bill in **shorter windows** or **minimum charges**).

- **1 h TTL** unused cache → most of a **24 h** reservation story is **waste** in naive mental models—**default short TTL**, extend only on **active sessions** (heartbeats), and **delete** cache on logout/session end.  
- **Mumbai:** same **FinOps** scrutiny as other posts—pair with **Post 4** egress if summaries cross AZ/collector paths.

**Hook (outline §1):** Prefer “**$3.6k/mo vs pennies of durable storage for the same 1 MB story**” over “million-percent gap”—finance readers trust **$/month**, not gimmick percentages.

---

## 6. Revised deep-dive — **Reasoning vs context** (Claude 4.7 vs Gemini 3.1)

Use this as **vendor-shaped contrast**, not a winner-take-all: **Google** optimizes **long reference + hourly cache**; **Anthropic** optimizes **prompt cache TTL** behavior suited to **repeated system/developer prefixes** on **chatty** loops.

### 6.1 Frontier rate card (per 1M tokens — illustrative)

| Model | Input | Output | Cache write | Cache read (hit) |
| :---- | :---- | :----- | :---------- | :--------------- |
| **Claude 4.7 Opus** (illustrative) | $15.00 | $75.00 | $18.75 | $1.50 |
| **Claude 4.7 Sonnet** (illustrative) | $3.00 | $15.00 | $3.75 | $0.30 |
| **Gemini 3.1 Pro** (illustrative) | $2.00 | $10.00 | $2.00* | $0.20 |
| **Gemini 3.1 Flash** (illustrative) | $0.50 | $3.00 | $0.50* | $0.05 |

\*Google: add **hourly cache storage** ($1.00–$4.50 / 1M tok / hr in this draft). Anthropic: **TTL-style** cache (default TTL often **short**—confirm at ship) with **write surcharge** on refresh.

### 6.2 Sprint cache vs marathon cache (principal distinction)

| Pattern | Favors | When it wins in **$** |
| :------ | :----- | :-------------------- |
| **Claude “sprint” cache** | Same **20k–100k** token prefix every **few seconds** across many users | **High-frequency** chat / tools; hits amortize writes quickly |
| **Gemini “marathon” cache** | **Huge** static reference (legal ledger, supply-chain doc) queried **sporadically** over **hours** | **Low-frequency** queries over **long TTL** if hourly storage beats re-uploading full context each time |

### 6.3 “1 MB session” with Claude 4.7 Sonnet (illustrative)

- **300k tokens**, standard input: 0.3 × **$3.00** = **~$0.90 / call**  
- **Cache hit** read: 0.3 × **$0.30** = **~$0.09 / call**  
- **Catch:** if user pauses **past cache TTL**, you pay **cache write** again (~**0.3 × $3.75 ≈ $1.12** in this draft)—**session cadence** becomes a **billing** input.

### 6.4 “Opus tax” (tie to Post 6 routing)

**300k tokens** to **Opus** without caching: 0.3 × **$15** = **~$4.50/request** input-only story—**every Enter** is a **budget event**.

---

## 7. Integration with **Post #6** (model routing / FinOps)

Ship these **together** when you want a coherent **principal** arc:

| Addition (Post 6 body / research) | Content |
| :-------------------------------- | :------ |
| **Reasoning vs cost quadrant** | Axes: **$ vs capability** — place **Gemini Lite/Flash** bottom-left (**utility**), **Claude Opus** top-right (**escalation**). |
| **Deterministic routing** | If signals indicate **regulatory / contractual conflict** (keywords, classifier, ticket type), **route** to **Opus**; else stay **Sonnet/Flash/Lite**. |
| **L3 escalation ladder** (align with `post-06` routing math) | **~85%** Lite/Flash (extraction/routing), **~10%** Sonnet (format/reason), **~5%** Opus (strategic / HTS conflict). Percentages are **starting points**—tie to **eval** + **$ guardrails**. |

Full routing tables and tagging live in **`docs/blog-research/post-06-llm-api-token-budgets-routing-finops.md`**.

---

## 8. Cache expiry comparison table (for Post 7 long-form)

| Dimension | Anthropic-style prompt cache | Google-style context cache |
| :-------- | :--------------------------- | :------------------------- |
| **Billing shape** | Write surcharge + cheap hits within **TTL** | **$/M token / hour** storage + cached read rates |
| **Best chat pattern** | **Continuous** high-frequency reuse of stable prefix | **Large** static blob queried **occasionally** over **hours** |
| **Principal one-liner** | *High-frequency chat → TTL cache can dominate.* | *Low-frequency big doc → hourly storage can dominate.* |

---

## 9. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **1** | Hook | **Context leak $ vs S3 pennies** (same user story); avoid bogus “million %.” |
| **2** | Prompt vs durable store | **Window ≠ database**; compliance/audit → **store**, not prompt. |
| **3** | Summarisation + verification | **“Compression ROI”** box; wrong-summary **failure** mode. |
| **4** | Cache layers | **Gemini hourly TTL** math; **1 h vs 24 h** waste intuition; Claude **TTL expiry** re-write cost. |
| **5** | Invalidation | Session end **deletes** cache; fact change **busts** summary version. |
| **7** | Closing | Reference architecture narrative + **Post 6** quadrant link. |

---

## 10. Pre-publish checklist

- [ ] Every $ example states **model**, **region/product path** (API vs Vertex), and **cache TTL** assumptions.  
- [ ] No implication that the **context window is durable storage**.  
- [ ] Summarisation section includes **validator failure** / rollback path.  
- [ ] Invalidation tied to **concrete triggers** (TTL, version bump, logout).  
- [ ] **“So what?” / Week 1 action plan** per `docs/BLOG_CONTENT_PLAN.md`.

---

## 11. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§7).  
- **Post body:** `data/blog/posts/context-windows-caching-sessions.ts` (implementation phase).  
- **Post 4:** egress / observability — `post-04-opentelemetry-ap-south-1-observability-bill.md`.  
- **Post 6:** routing + tagging — `post-06-llm-api-token-budgets-routing-finops.md`.
