# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.
# For AWS limits/pricing, see [official AWS documentation](https://docs.aws.amazon.com/).

# Post 3 — Idempotent webhooks: Mumbai (`ap-south-1`) storage, WRU tax, and correctness vs cost

**Canonical post:** `/blog/idempotent-webhooks-outboxes-dlq`  
**Slug:** `idempotent-webhooks-outboxes-dlq`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§3 Designing Idempotent Webhooks** (outline items 1–9)  
**Purpose:** Move the reader from **compute** (Post 2) to the **storage and request-unit** layer: how **idempotency**, **outbox**, and **cleanup** show up on the **DynamoDB bill** in **ap-south-1**, and when **Streams + TTL** is a defensible optimization vs a **transactional outbox** in the same table.

**Workflow:** Finish and verify this doc first; then implement in `data/blog/posts/idempotent-webhooks-outboxes-dlq.ts` and related narrative/career files per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 1. Thesis (why Mumbai / DynamoDB matters here)

At high scale in **ap-south-1**, DynamoDB is often the **heartbeat** of ingestion paths: webhooks, dedupe keys, outbox rows, and DLQ audit trails all compete for **write request units**, **storage**, and **operational discipline** (TTL, compaction, replay). The “right” pattern is not only **correctness**—it is **cost of correctness** under **at-least-once** delivery.

---

## 2. Core DynamoDB rates (April 2026 authoring baseline, Mumbai)

**Authoring inputs only.** Confirm **On-Demand** vs **Provisioned** mode, **Standard** vs **Standard-IA** table class, and current public pricing before publish.

| Component | Standard (ap-south-1) | Standard-IA (ap-south-1) |
| :-------- | :-------------------- | :--------------------- |
| **Writes** (per million write request units) | **$1.25** | **$1.56** |
| **Reads** (per million read request units) | **$0.25** | **$0.31** |
| **Storage** (GB-month) | **$0.25** | **$0.10** |
| **Streams** (reads, per 100,000) | **$0.02** | **$0.02** |

**Principal note:** **Standard-IA** lowers **storage** but raises **per-request** cost—use it when **reads are rare** (cold dedupe index, long-retention poison-message archive), not when every replay hits the table hot.

---

## 3. Pattern cost war — 10M events/month, ~1 KB payload (illustrative)

Shared assumptions for apples-to-apples copy: **on-demand**, **Standard** table class unless stated, **single-region** `ap-south-1`, **no** GSIs in the toy model (add GSI WCUs in real estimates).

### Pattern A — “Directly in DB” idempotent update

- **Mechanism:** e.g. `UpdateItem` with `ConditionExpression` on `processed_at` / idempotency attribute so duplicate deliveries no-op or branch predictably.  
- **Simplified write bill:** **~1 write unit** per successfully accepted event (blog shorthand; actual WCUs depend on item size, transactions, GSIs).  
- **Order-of-magnitude monthly write cost:** 10M × **$1.25/M** ≈ **$12.50**.  
- **Risk (copy must say this):** without an **outbox** or equivalent side effect queue, if the function **commits** the dedupe/processing state and **crashes before** downstream work (partner API, internal bus), you can **lose the side effect** while looking “idempotent” on read—**correctness vs durability** is a different axis than dedupe alone.

### Pattern B — Transactional outbox (separate outbox item, `TransactWriteItems`)

- **Mechanism:** business item + **outbox row** in **one** `TransactWriteItems` (same partition design constraints as production).  
- **Transaction tax (blog framing):** DynamoDB bills **two-phase** transactional writes at **2×** the write units of the underlying items (see AWS docs for exact counting). For prose: **“expect roughly 2× write cost vs a single conditioned write.”**  
- **Simplified monthly write bill:** order-of-magnitude **10M × $2.50/M ≈ $25.00** (2× Pattern A, same $/M basis).  
- **Storage:** you retain **more rows** (outbox until processed)—model **GB-month** and **GSI** if the dispatcher queries by status/time.  
- **Cleanup tax:** each **explicit delete** of an outbox row consumes writes; **TTL expiry** avoids billing **write capacity for the TTL-driven removal** (verify current AWS wording at ship time—still plan **read/replay** behavior before expiry).

### Pattern C — “Principal’s optimization”: Streams + TTL (stream-as-outbox narrative)

**Idea:** one **conditioned Put/Update** on the business record (idempotency key + `ttl`), **DynamoDB Streams** (`NEW_IMAGE`) drives delivery; **TTL** retires keys without paying per-delete write tax in the same way as manual deletes.

| Line item | Order-of-magnitude (10M/mo) |
| :-------- | :------------------------ |
| Writes (1× conditioned write) | ~**$12.50** |
| Stream reads | 10M / 100k × **$0.02** = **$2.00** |
| TTL cleanup | **$0** write charge for TTL deletion (operational caveat: deletes are **asynchronous**; see §5) |
| **Total (toy stack)** | ~**$14.50**/month |

**Copy claim:** “**Roughly half the write bill of a transactional dual-row outbox** in this toy model”—only if Pattern B and C assumptions are printed **side by side**.

---

## 4. Storage tax on idempotency keys

**Scenario:** **10M keys/month**, **~100 B** of application payload per key (metadata only in practice; real items include PK/SK overhead).

- **Order-of-magnitude:** ~**1 GB-month** new footprint per month for that class of keys → **~$0.25/mo** on Standard storage alone at the authoring rate (plus indexes).  
- **Scale cue:** at **100M+** events, **GB-month** and **GSI projection** become **architecture review** items, not rounding error.  
- **Standard-IA:** if the dedupe store is **append-mostly** and **read rarely** except in **retry storms**, IA’s **lower $/GB** can dominate savings—pair with **higher $/read** so you do not blindly IA a hot path.

---

## 5. Streams + TTL — principal caveats (do not ship the happy path only)

Use a short **“When this bites you”** box in the article:

**When this bites you:**
- TTL deletions are asynchronous; items may persist for hours after expiry, affecting replay and cost. Always test TTL behavior in your region and workload.
- GSI cost: If you add GSIs for dedupe or outbox queries, model write and storage units for each GSI. GSI costs can exceed base table costs at scale.
- Streams + TTL: If you rely on Streams for delivery, ensure your consumer handles out-of-order or delayed events due to TTL lag or DynamoDB Streams retention limits.

| Topic | Risk |
| :---- | :--- |
| **Delivery semantics** | Streams are **at-least-once**; consumers must stay **idempotent** and tolerate **duplicate stream records**. |
| **Ordering** | Per-partition ordering, not global; **fan-out** and parallel Lambdas complicate “exactly once side effect” fantasies. |
| **TTL timing** | Expiry is **not** millisecond-precise; design **replay** and **downstream timeouts** assuming lag. |
| **Lambda + stream** | Iterator age, **batch failures**, partial batch responses, and **DLQ on the consumer** still belong in the story—Streams remove **manual delete** cost, not **all** ops tax. |
| **TransactWriteItems** | Still the right tool when you **must** tie business state and outbox with **atomic** failure modes the product accepts. |

---

## 6. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

Authoritative outline numbering from the plan:

| Outline § | Title | Insert from this research |
| :-------- | :---- | :-------------------------- |
| **3** | Dedupe: provider id vs content hash; unique indexes; response replay | **Sidebar: “2× transaction tax”**—why `TransactWriteItems` **doubles** write units vs single-item conditioned writes; when that tax is **worth it**. |
| **4** | Outbox pattern: same transaction as business write; dispatcher | **Stream-as-outbox**—conditioned write + **Streams** + consumer; compare **$ and failure modes** to **dual-row transactional outbox**. |
| **6** | Dedupe store lifecycle: retention vs audit; TTL/archival; unbounded growth | **TTL as free cleanup** (with lag caveat); **delete vs TTL** cost; **IA** for cold dedupe/archive. |
| **7** | DLQ: alert thresholds, sampling, human replay runbook | **Audit storage:** long-lived **poison messages** / samples in **Standard-IA** (or S3 + metadata in DDB) for **principal-level** forensics—call out **read $** vs **storage $**. |

If an earlier draft labeled **DLQ** as “§6,” align to **§7** in the shipped outline to avoid mismatch with `BLOG_CONTENT_PLAN.md`.

---

## 7. Pre-publish checklist (storage + money claims)

- [ ] Mode is explicit: **on-demand** vs **provisioned** (math differs).  
- [ ] Table class: **Standard** vs **Standard-IA** per table (not mixed silently).  
- [ ] **GSI / LSI** write amplification mentioned wherever you show WRU totals.  
- [ ] **Transactional 2×** language matches current AWS **TransactWriteItems** billing docs.  
- [ ] **Streams + TTL** section includes **at-least-once** and **TTL delay** caveats.  
- [ ] **“So what?” / Week 1 action plan** satisfied per cross-post workflow in `docs/BLOG_CONTENT_PLAN.md`.

---

## 8. Related repo artifacts

- **Plan & outline:** `docs/BLOG_CONTENT_PLAN.md` (§3).  
- **Shipped post body:** `data/blog/posts/idempotent-webhooks-outboxes-dlq.ts` (implementation phase).  
- **Career / narrative:** `data/blog/career/`, `data/blog/narrative/` barrels for the same slug when those exist.
