# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.
# For AWS/GCP/vendor limits/pricing, see [official AWS documentation](https://docs.aws.amazon.com/) and your vendor's docs.

# Post 4 — OpenTelemetry in production: Mumbai (`ap-south-1`) ingestion, retention, and the observability bill

**Canonical post:** `/blog/opentelemetry-sampling-cost`  
**Slug:** `opentelemetry-sampling-cost`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§4 OpenTelemetry in Production** (outline items 1–8)  
**Purpose:** Ground the post in **money**: ingestion vs **retention/indexing**, AWS-native signals vs **commercial backends**, and why **tail sampling at the gateway collector** is the principal-level mitigation—plus **ap-south-1** egress between AZs and collectors.

**Workflow:** Stabilize this doc first; then implement copy/config examples in `data/blog/posts/opentelemetry-sampling-cost.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 1. Thesis (“silent killer”)

OpenTelemetry standardizes **how** telemetry leaves the service; the **backend and retention policy** still dictate **cost**. In **ap-south-1**, **ingestion** gets attention first, but **retention, indexing, and cardinality** are where bills **scale out**—often enough that **observability exceeds compute** for instrument-heavy services unless you **drop noise before dollars**.

All **$** figures below are **authoring baselines (April 2026)**. **Re-verify** AWS public pricing, X-Ray/CloudWatch/Application Signals docs, and **any vendor contract** before publishing. Third-party numbers are **order-of-magnitude illustrations**, not quotes.

---

## 2. AWS-native baseline (ap-south-1)

AWS prices **traces/spans** and **logs** on different axes—mixing them in one mental model causes spreadsheet errors.

| Signal type | Ingestion / recording (authoring, ap-south-1) | Storage / retention (authoring) |
| :---------- | :--------------------------------------------- | :-------------------------------- |
| **X-Ray traces** | **$5.00 per 1M traces recorded** | Included in model (**30-day** default framing) |
| **CloudWatch Logs** | **$0.50 per GB ingested** | **$0.03 per GB-month stored** |
| **Application Signals** (spans indexed) | **$1.50 per 1M spans indexed** | Long-term at **S3-class** framing (link current pricing) |

### The “fat trace” surprise (for the hook)

If a **single trace** routinely carries **50+ spans** and rich attributes, **serialized size** can reach **~100 KB** (order-of-magnitude—not a universal constant).

**Illustrative scale:**

- **100M traces/month** recorded at **$5/M** → **~$500** on **recording** alone (X-Ray-style unit story).  
- If an equivalent **payload volume** were treated like **log ingest** at **$0.50/GB**: **100M × 100 KB ≈ 10 TB** → **~$5,000** ingest **if** that volume hit a log-priced path.

**Copy discipline:** use this as **“why unit vs volume pricing changes intuition”**, not as a claim that X-Ray bills 10 TB as CloudWatch Logs line-for-line. Tie to **span count**, **attribute bloat**, and **mirroring/export** paths the reader actually uses.

---

## 3. Commercial backends (high cardinality = tax)

Vendors in **2026** often blend **ingest $/GB** with **index / retention tiers** that punish **rich OTel** (high-cardinality attributes, auto-instrumentation span explosion).

| Vendor (illustrative) | Ingest (authoring) | Index / retention framing |
| :-------------------- | :----------------- | :------------------------ |
| **Datadog** (est.) | **~$0.10 / GB** ingested | **~$1.70 / GB** indexed (e.g. **15-day** tier—verify SKU) |
| **New Relic** (est.) | **~$0.40 / GB** standard | **~$0.60 / GB** “Data Plus” style extended retention |

### Bill shock scenario (story math, not a promise)

Assume **OTel auto-instrumentation** roughly **triples** span volume vs a lean manual baseline (blog hypothesis—**measure your** before/after).

| Line item | Authoring order-of-magnitude |
| :-------- | :--------------------------- |
| **Compute** | **10** Fargate tasks (Mumbai-shaped) → **~$260/month** (align memory with Post 2 research if you cite side-by-side). |
| **Observability (Datadog-shaped @ ~100 GB/day)** | Ingest **~$300/month** + indexing **~$5,100/month** → **~$5,400/month** total. |
| **Ratio** | Observability **~20×** compute in this **single** toy model. |

**Principal guardrail:** publish the **assumptions** (GB/day, indexing tier, task count/region) in the same section as the headline ratio.

---

## 4. Principal mitigation — tail sampling (gateway collector)

**Head sampling** alone cannot see **errors or tail latency** on the full trace; **tail sampling** at a **collector gateway** (after buffering a **decision window**) keeps **RCA-grade** traces while cutting **healthy** volume.

### Policy sketch (matches article bullets)

1. **Keep 100%** of traces with **error status** (5xx / `ERROR`).  
2. **Keep 100%** of traces with **latency > 1000 ms** (tune threshold per SLO).  
3. **Sample ~5%** of **healthy** traffic (probabilistic tail policy).

**Economic claim (qualitative):** such policies often land **80–90%** volume reduction vs “export everything”—**validate** with before/after GB/day from your vendor or self-hosted store.

### Illustrative Collector YAML (validate against your OTel Collector version)

**Reminder:** Validate all YAML config examples against your actual OpenTelemetry Collector version before publishing. Update any deprecated fields or syntax as needed.

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: errors
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: latency-outliers
        type: latency
        latency:
          threshold_ms: 1000
      - name: healthy-probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 5
```

Add **memory / delayed export** trade-offs in the post body (per plan validation checklist): `decision_wait` increases RAM and **time-to-backend** for kept traces.

**Composition caveat:** the block above is **illustrative** only—real deployments usually need a **`composite`** policy (or vendor-specific rules) so **errors and latency outliers are always kept** while **healthy** traffic is **probabilistically** thinned. Confirm **evaluation order** and **OR vs AND** semantics for your **collector version** against the upstream `tail_sampling` README.

**Story arc for §4:** show **order-of-magnitude** bill drop (e.g. **$5,000 → $500**) only with **explicit** “before GB/day / after GB/day” assumptions—same discipline as the 20× compute hook.

---

## 5. Regional nuance — Mumbai cross-AZ egress

In **ap-south-1**, **inter-AZ data transfer** is commonly priced around **$0.01 / GB** (confirm current AWS “Data transfer within the same AWS Region” rows).

**Implication:** collectors concentrated in **AZ-a** while apps fan across **AZ-b/c** pay a **steady network tax** on every batch of spans/logs until you **co-locate** ingestion with production.

**Principal tips (for §4–§5):**

- Prefer **AZ-aware** collector routing, **DaemonSet/sidecar** batching, or **per-AZ collector pools** so hot paths do not repeatedly **cross AZ** for the same hop.  
- Revisit **Post 2** NAT / cross-AZ themes when the same VPC hosts **egress-heavy** telemetry.

---

## 6. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert from this research |
| :-------- | :---- | :-------------------------- |
| **1** | Hook: trace backend bill or slow queries on trace ID | **“20× obs vs compute”** headline **with assumptions**; **fat trace** → TB-scale intuition when mirrored to log-priced paths. |
| **2** | Goals: coverage vs cardinality vs latency overhead | Split **ingestion $** vs **retention/indexing $**; AWS table vs vendor table. |
| **4** | Tail sampling: error/latency rules; collector deployment notes | **Error-first tail policy** + YAML sketch; **decision_wait** / memory caveat; optional **before/after $** story. |
| **6** | Cardinality: attribute budgets; high-cardinality anti-patterns | **`user_agent` / raw IDs on every span**—bytes × trace volume; link to indexing $/GB. |
| **7** | Retention and tiering | Vendor **index tier** vs **S3 / archive**; Application Signals vs X-Ray vs logs retention story. |

---

## 7. Pre-publish checklist

- [ ] Every shock-math paragraph lists **GB/day**, **span/trace counts**, and **region**.  
- [ ] Vendor numbers labelled **estimate** or **list price**; contract discounts not implied.  
- [ ] **Tail sampling** section includes **memory**, **wait delay**, and **parent coherence** pointer (plan checklist).  
- [ ] **Collector vs SDK** stance preserved: gateway **first** for $; SDK head sampling when **CPU/serialisation** dominates (see plan editorial validation).  
- [ ] **“So what?” / Week 1 action plan** per cross-post workflow in `docs/BLOG_CONTENT_PLAN.md`.

---

## 8. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§4).  
- **Post body:** `data/blog/posts/opentelemetry-sampling-cost.ts` (implementation phase).  
- **Post 2 (compute / cross-AZ):** `docs/blog-research/post-02-lambda-ecs-ap-south-1-finops.md`.
