# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

# Post 5 — Prompt engineering for engineers: few-shot **unit economics** and “prompt as contract”

**Canonical post:** `/blog/prompt-engineering-for-engineers`  
**Slug:** `prompt-engineering-for-engineers`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§5 Prompt Engineering for Engineers** (outline items 1–7)  
**Purpose:** Treat prompts as **production interfaces** with **recurring token cost**—especially few-shot blocks—plus **accuracy vs burn**, **prompt drift** failure modes, and where **schemas / fine-tuning** enter the ROI story.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/prompt-engineering-for-engineers.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers (read before any $ lands in the live post)

- **Model names and rates** in §1 are **April 2026 authoring placeholders** for narrative structure—**replace** with **current** provider SKUs and **public list prices** (or your **Bedrock** contract line) at publish time.  
- **API $/token** is usually **global**, not region-specific; **ap-south-1** here frames **margin pressure** (B2B SaaS, tight COGS), not a different token meter.  
- **Fine-tune vs prompt** crossover (§4) depends on **amortization**, **hosting**, **eval cost**, and **refresh cadence**—present as a **decision framework**, not a single threshold.

---

## 1. Illustrative pricing table (April 2026 — replace at ship)

| Provider | Model (placeholder label) | Input ($/1M tokens) | Output ($/1M tokens) | Caching / batch note |
| :------- | :------------------------- | :------------------ | :------------------- | :------------------- |
| **OpenAI** | GPT-5 Mini (illustrative) | $0.25 | $2.00 | e.g. batch / cache % — verify SKU |
| **Anthropic** | Claude 4.6 Sonnet (illustrative) | $3.00 | $15.00 | e.g. prompt cache hit % — verify policy |
| **Google** | Gemini 3.1 Flash (illustrative) | $0.50 | $3.00 | context cache — verify |
| **Google** | Gemini 3.1 Lite (illustrative) | $0.25 | $1.50 | “high volume” lane — verify |

---

## 2. Accuracy vs burn — few-shot token “tax”

**Scenario:** **Senseahead-style** supply-chain extractor; **HTS** from noisy invoices.

| Prompt shape | Input tokens per call (authoring) |
| :------------ | :-------------------------------- |
| **Zero-shot** | **300** |
| **5-shot** | **1,800** (**+1,500** example overhead) |

**Ratio:** **1,800 / 300 = 6×** input tokens → **6×** input **$** (same model, same price, ignoring output for this slice).

### Correcting absolute $ / month (common slip)

At **$3 / 1M input tokens** (illustrative Sonnet-class input):

| Volume | Zero-shot (300 tok/call) | 5-shot (1,800 tok/call) | Delta |
| :----- | :----------------------- | :---------------------- | :---- |
| **~1k calls/month** | 0.3M tok → **~$0.90** | 1.8M tok → **~$5.40** | **6×** |
| **1M calls/month** | 300M tok → **~$900** | 1.8B tok → **~$5,400** | **6×** |

If a draft shows **$0.90 vs $5.40** “for 1M extractions,” that is **off by 1000×** on volume—either fix the **call count** or fix the **$**. The **6×** story is what you want for ROI copy.

**Principal insight (for prose):** if five examples move accuracy **94% → 96%**, you are buying **~2 points** with **~6×** input token cost on this toy geometry—often a **bad trade** unless examples are **doing structural work** no schema can replace. Alternatives to spell in the same subsection: **structured outputs (JSON Schema)**, **constrained decoding**, **RAG over exemplars** (pay once per session), **distillation / fine-tune** when volume crosses your breakeven (§4).

**Example prompt:**
Add a worked example for schema-based extraction (e.g., JSON Schema validation) to illustrate how structured outputs can reduce token cost and improve reliability.

---

## 3. Silent failures of few-shotting (“prompt drift”)

Use these as **architecture** bullets, not ML Twitter lore—tie each to **eval** and **versioning**.

| Risk | What goes wrong | Mitigation (headlines) |
| :--- | :-------------- | :-------------------- |
| **Majority label bias** | Class distribution in examples **steers** the marginal case. | Balance classes; add **counterexamples**; track per-class error in eval. |
| **Recency bias** | Last example overweighted; order becomes **implicit spec**. | Fixed slot order; **AB** order in harness; don’t “append one more” ad hoc. |
| **Token bloat** | “Just add an example” compounds; **margin** and **latency** suffer. | **Token budget** in CI (§5); **cost review** on prompt diffs like infra. |
| **PII / secrets in examples** | Examples copied from prod → **leakage** and **compliance** debt. | Synthetic or redacted fixtures; block prod dumps in PR checks. |

---

## 4. Few-shot vs fine-tune — crossover framing (closing / figure)

**Goal:** a **chart or table**, not vibes—axes should be **monthly request volume**, **input tokens per request** (with vs without few-shot), **fine-tune amortization** (one-time + refresh), and **hosting** if you self-host a small model.

**Qualitative claim to earn in copy:** above **~100k requests/month** (order-of-magnitude), a **small / “nano”** fine-tuned model **can** beat a **bloated pro prompt** on **$/correct extraction**—only after you add **line items** for: training job, eval regression, redeploy on data drift, and **output tokens** still billed on hosted APIs.

**Bedrock tie-in (from plan):** same **contract** (schema, tool JSON, validator) can sit behind **model-specific** encodings—few-shot layout and delimiter style differ **Claude vs Llama** families; **don’t** bake six examples into the only copy of your spec.

---

## 5. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert from this research |
| :-------- | :---- | :-------------------------- |
| **4** | Few-shot design: diversity, ordering, anti-pattern examples | **“ROI of an example”** — token count → **$/month** at two volumes (1k vs 1M) to kill the double-division bug; **6×** for 300 vs 1,800 tokens; link to **bias** and **recency**. |
| **5** | Testing: golden outputs, rubrics, semantic similarity | **Token budgets in CI/CD** — assert `prompt_token_count` (or provider usage fields) in eval pipeline; **+20%** prompt growth triggers **cost review** like bundle size. |
| **7** | Closing: minimal template repo structure | Add **few-shot vs fine-tune crossover** figure/table alongside repo bullets; **Week 1 action plan** checklist (Sprint Planning) per `docs/BLOG_CONTENT_PLAN.md`. |

---

## 6. Pre-publish checklist

- [ ] All model names and **$/1M** figures reconciled with **live** provider or **Bedrock** pages.  
- [ ] Any **$ / month** example states **calls/month** and **tokens/call** explicitly.  
- [ ] Few-shot section includes **PII** warning (plan validation checklist).  
- [ ] Testing section names **≥2 measurable signals** (e.g. token count + exact-match rate, or token + rubric score).  
- [ ] No promise of “no hallucinations”; mitigation only.

---

## 7. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§5).  
- **Post body:** `data/blog/posts/prompt-engineering-for-engineers.ts` (implementation phase).  
- **Adjacent FinOps post:** §6 `llm-api-token-budgets` — link when you discuss attribution and dashboards.
