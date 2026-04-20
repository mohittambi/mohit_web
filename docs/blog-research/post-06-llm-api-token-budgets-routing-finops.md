# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

# Post 6 — LLM API usage & token budgets: **model routing** FinOps (April 2026 framing)

**Canonical post:** `/blog/llm-api-token-budgets`  
**Slug:** `llm-api-token-budgets`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§6 LLM API Usage** (outline items 1–7)  
**Purpose:** Frame LLMs as **tiered compute**: **routing** cheap utility models for the bulk of traffic, **frontier** models for the tail, plus **instrumentation and dashboards** that leadership can trust—without logging secrets into the warehouse.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/llm-api-token-budgets.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers

- **Model tiers and $/1M** in §1 are **April 2026 authoring placeholders**—replace with **live** OpenAI / Google / Anthropic / **Bedrock** public pricing (or your enterprise agreement) before publish.  
- **“Blended $/M tokens”** in §2 is **not** standard billing—define it from **your** typical **input vs output token ratio** per workflow. The **72% savings** ratio is what travels; recompute **absolute $** whenever blend assumptions change.  
- **ap-south-1** is mostly **margin scrutiny + egress path** context; **list $/token** is often **global**, but **DTO**, **private connectivity**, and **where inference runs** are not.

---

## 1. Illustrative API rate card (per 1M tokens — verify at ship)

| Model tier (placeholder label) | Input ($/1M) | Output ($/1M) | Best for (copy) |
| :------------------------------- | :----------- | :------------ | :-------------- |
| **GPT-5.4 Pro** (illustrative) | $30.00 | $180.00 | High-stakes logic, complex coding |
| **GPT-5.4 Standard** (illustrative) | $2.50 | $15.00 | Creative writing, advanced reasoning |
| **Gemini 3.1 Pro** (illustrative) | $2.00 | $12.00 | Long-context RAG (verify context window claims) |
| **Gemini 3.1 Flash** (illustrative) | $0.50 | $3.00 | Real-time chat, tool use |
| **Gemini 3.1 Lite** (illustrative) | **$0.25** | **$1.50** | **Classification, extraction, routing** |

**Principal stance:** “**Pro-only**” defaults are a **FinOps liability** once volume exists; **routing** is the economic architecture move.

---

## 2. “80/20” routing math (authoring scenario — recompute blends)

**Assumption:** **10 million tokens/month** total LLM traffic (define: sum of billed input+output, or input-only—pick one and stick to it in the article).

### Scenario A — naive (100% “Standard-class” frontier path)

- **100%** on **GPT-5.4 Standard** (illustrative), using an authoring **blended effective rate** of **$17.50 / M tokens** for this toy model.  
- **Cost:** 10 × **$17.50** = **~$175 / month**.

### Scenario B — routed (“gatekeeper” + tail on Standard)

- **80%** of tokens → **Gemini 3.1 Lite** at authoring **blended ~$1.75 / M**.  
- **20%** of tokens → **GPT-5.4 Standard** at **~$17.50 / M**.

| Segment | Tokens | Rate ($/M) | $ / month |
| :------ | -----: | ---------: | --------: |
| Lite | 8M | $1.75 | **~$14** |
| Standard | 2M | $17.50 | **~$35** |
| **Total** | 10M | — | **~$49** |

- **Savings vs A:** **(175 − 49) / 175 ≈ 72%** — user’s “approaching **80%**” if the cheap lane is **even lighter** (e.g. Flash-Lite-class SKU) or Standard share shrinks **after** eval gates.

**Copy guardrails:**

- Show **one** worked table with **explicit** blend definition (e.g. “assume 3:1 input:output and table §1 list prices”).  
- Mention **router cost**: a thin Lite/Bedrock call per request adds tokens—usually **second-order** to mis-routing everything to Pro, but **not zero**.

---

## 3. Instrumentation — the tagging layer (“metadata blueprint”)

To attribute spend and tune routing, **middleware** (or gateway) should emit a **consistent dimension set**—**implementable** per plan checklist.

| Dimension | Example | Notes |
| :-------- | :------ | :---- |
| **Feature** | `feature:supply-chain-extraction` | Stable catalog id, not free text. |
| **Tenant / customer** | `tenant:enterprise-a` | Align with **billing** entity where possible. |
| **Workflow / intent** | `workflow:intent/hts-classification` | Drives routing table keys. |
| **Model chosen** | `model:gemini-3.1-lite` | Post-decision log. |
| **Outcome** | `outcome:success \| validation_fail \| user_abort` | Feeds **value** metrics, not only cost. |

**Headers vs logs:** e.g. `x-tenant-id`, `x-feature-id`, `x-workflow-id`—**propagate** into structured logs and **metrics labels**; avoid duplicating **payloads** into observability backends (plan: **privacy — what not to log**).

**Principal insight — value per token:** do not only chart **total $**. Track **cost per successful feature action** (e.g. successful extraction that passed schema validation) so a **$0.10** “expensive” model call that **unblocks revenue** reads differently from a **$0.001** call that **burns trust** via silent failure. Pair with the plan’s **ethical** note: if routing degrades UX, **say so** in product copy—do not silently swap models without disclosure where it matters.

**Privacy/PII logging note:**
When instrumenting LLM API usage, ensure that no sensitive user data or PII is logged in metrics, traces, or dashboards. Mask or omit payloads and use only metadata for attribution.

---

## 4. Regional nuance — Mumbai and data paths

- **DTO / path:** At very large **context** volume, **egress** from **ap-south-1** VPCs to third-party APIs can add a **small** percentage “tax” versus inference that stays on a **regional** footprint—**measure** with flow logs and billing dimensions; treat **~2–3%** as illustrative, not a constant.  
- **Optimization angle:** run **Gemini** via **Vertex AI in `ap-south-1`** (or equivalent regional inference) so **bulk traffic** stays on provider backbone paths you can **contract and monitor**, instead of defaulting all traffic to a **distant** global endpoint when latency and egress matter.

---

## 5. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert from this research |
| :-------- | :---- | :-------------------------- |
| **2** | Instrumentation: what to log per call | **Metadata blueprint** — mandatory dimensions + optional header names; **no payload/PII** in cost warehouses; link to routing keys. |
| **4** | Routing: task taxonomy → model map | **80/20 table** + naive vs routed $; **gatekeeper** pattern; “router saves more than a month of micro-prompt tweaks” **only** when backed by this math + eval. |
| **6** | Dashboards: dimensions finance and engineering agree on | **Unit economics dashboard** — **cost per successful feature action**, not only rising spend bars; cohort by tenant/feature/model. |
| **3** | Budgets: soft vs hard; degradation UX | Tie **routing** to **soft caps** and explicit **degradation** when budgets trip (plan ethical note). |

Cross-link **Post 5** few-shot burn: `docs/blog-research/post-05-prompt-engineering-few-shot-unit-economics.md` (prompt size vs **routing** to cheap models).

Cross-link **Post 7** (`post-07-context-windows-cache-economics.md`): **reasoning vs context** economics, **Claude vs Gemini** caching shapes, **Opus as L3 escalation**, **reasoning-vs-cost quadrant**, and **deterministic routing** (e.g. regulatory / contractual conflict → escalate).

---

## 6. Pre-publish checklist

- [ ] Blended **$/M** derivations shown or linked to a spreadsheet export.  
- [ ] **Caching** section (plan §5) still covers **invalidation** when user state changes—routing does not remove cache risk.  
- [ ] **Privacy:** no raw prompts in shared dashboards; **hashed** or **sampled** only where needed.  
- [ ] Routing table includes **when to revisit** (model upgrades, eval drift)—plan §4.  
- [ ] **“So what?” / Week 1 action plan** per cross-post workflow in `docs/BLOG_CONTENT_PLAN.md`.

---

## 7. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§6).  
- **Post body:** `data/blog/posts/llm-api-token-budgets.ts` (implementation phase).  
- **Adjacent:** Post 5 research (`post-05-…`) for prompt token tax vs routing savings.
