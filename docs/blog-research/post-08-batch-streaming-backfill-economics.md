# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

# Post 8 — Batch vs streaming (embeddings & eval): **first-time backfill** economics (April 2026 framing)

**Canonical post:** `/blog/batch-vs-streaming-embeddings`  
**Slug:** `batch-vs-streaming-embeddings`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§8 Batch vs Streaming for Embeddings and Eval Harnesses** (outline items 1–6)  
**Purpose:** Treat **batch APIs** as the **throughput / discount** lane (often **50–80%** off vs synchronous) at the cost of **latency (minutes–24h)**—and surface the **first-time “cache write” tax**: you cannot hit a cache that does not exist yet, so **pipeline $** must be modeled as **total cost of ownership**, including **checkpointing** and **partial resume**.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/batch-vs-streaming-embeddings.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers

- All **$/1M** rows are **April 2026 authoring placeholders**—confirm **Batch API** pricing, **cache write/read** multipliers, and **regional** SKUs (Vertex vs direct API vs Bedrock) before publish.  
- **“50% batch discount”** is a **story-level** aggregate—real invoices mix **input**, **output**, **cache**, and **minimum job charges**.  
- **Tokenizer drift (Claude 4.7 vs 4.6):** the **~35%** more-tokens claim is an **authoring warning**—measure on **your** corpus before promising savings.

---

## 1. First-time batch rates (per 1M tokens — illustrative)

**Narrative:** batch lane applies a **~50%** discount vs the synchronous list price in this draft; **first-time** work still pays **cache write**-shaped premiums until **subsequent** reads can hit **cached** prefixes.

| Provider | Model (placeholder) | First-time input (cache write, batch-shaped) | Output (batch) | Subsequent input (cache hit, batch-shaped) |
| :------- | :-------------------- | :------------------------------------------- | :------------- | :------------------------------------------- |
| **Anthropic** | Claude 4.7 Sonnet | **$1.87** | **$7.50** | **$0.15** |
| **Anthropic** | Claude 4.7 Opus | **$3.12** | **$12.50** | **$0.25** |
| **Google** | Gemini 3.1 Pro | **$1.10** | **$6.00** | **$0.10** |
| **Google** | Gemini 3.1 Flash | **$0.27** | **$1.50** | **$0.02** |

**Footnote in draft table:** Sonnet **$1.87** described as **1.25× base × 0.5** (batch); hit **$0.15** as **0.1× base × 0.5**—replace with **vendor line items** at ship.

### Tokenizer tax (Anthropic 4.7)

Claude **4.7** tokenizer changes can yield **up to ~35% more tokens** for the **same raw text** vs **4.7→4.6** expectations—**effective $/document** can **rise** even when **list $/M** falls. **Regression:** tokenize a **stratified sample** of production docs before committing batch **SLAs**.

---

## 2. Checkpointing at scale — principal blueprint (resilience)

**Problem:** a **100M-token** backfill is **multi-hour**; a crash at **90%** must not force a **full** duplicate bill.

| Layer | Practice |
| :---- | :------- |
| **JSONL manifests** | One **JSON object per line** = **atomic** unit of work for both Anthropic and Google batch shapes (verify exact schema at ship). |
| **Idempotency keys** | Stable `request_id` per line, e.g. **`sha256(document_id + chunk_index)`** (or ULID)—must match **vector store upsert** natural key. |
| **Orchestration** | **Temporal** (or equivalent) drives **batch job state**: submitted → running → partial → succeeded / compensating. |
| **State persistence** | **Backfill metadata** table (**DynamoDB** / Postgres): `batch_id`, `input_file_uri`, `output_uri`, `model_version`, `pinned_dataset_hash`, `submitted_at`, `terminal_at`. |
| **Resume / delta** | On failure, **diff** `batch_output.jsonl` (completed `request_id`s) vs `input.jsonl`; **re-submit only missing lines**—never blind full-file retry. |

**Plan alignment:** satisfies checklist **idempotency keys or natural keys for vector writes** when you map JSONL lines to **embedding upserts**.

**Failed-line retry example:**
Add a worked example showing how to handle failed-line retries in a batch embedding job. For example, after a partial failure, diff the completed output and input manifests, and only resubmit missing lines to avoid duplicate billing.

---

## 3. Batch vs streaming — inflection table (for long-form)

| Dimension | Streaming (near–real-time) | Batch (asynchronous) |
| :-------- | :------------------------- | :------------------- |
| **Latency** | Often **&lt; ~2 s** per call / short tail | **Minutes–24 h** job SLA (vendor-dependent) |
| **Cost (Mumbai framing)** | **~100%** of synchronous “interactive” meter in this story | **~50%** (authoring) of comparable synchronous—**define SKU** |
| **Caching value** | **High** once prefixes are warm; good for **chat** (e.g. Impli) | **Low on first pass**—**write tax** dominates until cache exists; great for **backfills** (Senseahead-scale ledger) |
| **Best for** | User-facing paths, tight SLO | **Re-index**, **re-embed**, **nightly eval** |

**Principal insight — eval harness:** run a **pinned** **~1,000-prompt** regression on **Batch** nightly. Authoring economics: **~$15 (Sonnet batch)** vs **~$30 (streaming)** per run → **~$15/day** → **~$5,400/year** on **testing alone** in the toy model—**only** if your token counts and discounts match; still a **credible order-of-magnitude** for **FinOps** storytelling.

---

## 4. “First-time write tax” subsection (outline §2 — Batch)

**Copy beats:**

- Batch is **not** “free compute”—it is **deferred** compute with a **discount** and a **latency budget**.  
- **First-time** backfills pay **full write-shaped** economics for **cold** prefixes—**no cache hits** yet. **Second pass** (or **streaming** traffic after warm) is where **cache read** rates dominate—see **`post-07-context-windows-cache-economics.md`**.  
- **Total pipeline cost** = **batch inference** + **storage (S3 manifests)** + **orchestrator** + **vector DB write units** + **failed-line retries**—put it in one **FinOps** slide.

---

## 5. Eval harness — “pinnable dataset” pattern (outline §5)

- **Pin** `dataset_version` (hash of golden inputs) **and** `model_version` / **adapter id** in metadata—**eval without pins is noise**.  
- **Weekly** (or nightly) **Batch** job: input JSONL = **golden set**; output = **structured scores** + **diff artifact** stored next to manifest for audit.  
- **Regression gate:** CI blocks release if **batch eval** job from **pinned** snapshot regresses beyond threshold—**SLA for eval runtime** is now a **batch SLA**, not p99 API latency.

---

## 6. Closing — resume strategy snippet (outline §6)

Illustrative **partial retry** logic (adapt to your SDK and storage layout):

```python
def request_ids_completed(output_jsonl_path: str) -> set[str]:
    done: set[str] = set()
    with open(output_jsonl_path, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = json.loads(line)
            rid = rec.get("custom_id") or rec.get("request_id")
            if rid and rec.get("error") is None:
                done.add(rid)
    return done


def filter_delta(input_jsonl_path: str, done: set[str]) -> list[dict]:
    pending: list[dict] = []
    with open(input_jsonl_path, encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            rid = rec["custom_id"]
            if rid not in done:
                pending.append(rec)
    return pending


# pending → write delta_input.jsonl → submit new batch job with same model + dataset pins
```

Mirror in **Node** with readline / `fs.promises` streams for **large** files.

---

## 7. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **1** | Hook | Tie **double-indexed vectors** / retry storm to **missing checkpointing** and **non-idempotent** batch replay. |
| **2** | Batch: partitioning, checkpoints | **First-time write tax**; JSONL atomics; **Temporal**; **Backfill metadata** table; **delta resume**. |
| **3** | Streaming | Latency vs cost; when **micro-batches** still beat naive per-doc streaming at scale. |
| **4** | Mixed systems | **Warm cache** via batch backfill → **serve** streaming; avoid **torn reads** between index versions. |
| **5** | Eval harness | **Pinnable dataset** + nightly **Batch**; **$15 vs $30** story with assumptions. |
| **6** | Closing | **Resume snippet** + rule: **start batch-first** for backfills even if product is **streaming-first** UX. |

---

## 8. Pre-publish checklist

- [ ] Batch vs streaming trade-off states **latency vs cost** explicitly (plan checklist).  
- [ ] **Idempotency** for **vector writes** tied to **request_id** / natural key.  
- [ ] Eval harness **pins data + model** and explains **why**.  
- [ ] **“So what?” / Week 1 action plan** per `docs/BLOG_CONTENT_PLAN.md`.

---

## 9. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§8).  
- **Post body:** `data/blog/posts/batch-vs-streaming-embeddings.ts` (implementation phase).  
- **Cache economics:** `docs/blog-research/post-07-context-windows-cache-economics.md` (write vs hit, first-time tax vocabulary).
