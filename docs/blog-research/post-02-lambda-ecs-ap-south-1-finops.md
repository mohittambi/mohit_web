# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.
# For AWS limits/pricing, see [official AWS documentation](https://docs.aws.amazon.com/) and the [AWS Pricing Calculator](https://calculator.aws.amazon.com/).

# Post 2 — Lambda → ECS: Mumbai (`ap-south-1`) FinOps & crossover math

**Canonical post:** `/blog/lambda-to-ecs-when-serverless-stops`  
**Slug:** `lambda-to-ecs-when-serverless-stops`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§2 From Lambda to ECS** (numbered outline items 1–8)  
**Purpose:** Ground the article’s **financial pivot** narrative in **production-shaped pricing** for **ap-south-1**, not only “cold start” folklore. Use this file while drafting; **re-verify all rates on the AWS pricing page and in the Pricing Calculator** before publishing—numbers drift by service and by commitment discounts.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 1. Thesis (why Mumbai matters)

For **Post 2**, the decision is not only technical limits like cold starts—it is often a **financial pivot**. In **ap-south-1 (Mumbai)**, where cloud spend is a primary constraint for many growing teams, the **steady-state “Lambda tax”** (per-invocation GB-seconds at sustained RPS) becomes visible **earlier** than in typical US-East narratives, especially once **VPC egress and NAT** are modeled honestly.

**Principal stance:** Treat **ARM (Graviton)** on both Lambda and Fargate as the **default comparison** in this region. If the post ignores Graviton, a senior architect may assume the cost story was not stress-tested.

---

## 2. Raw compute unit costs (`ap-south-1`) — authoring baseline (April 2026)

These figures are **authoring inputs** for the blog. Replace with **current** official rates at ship time.

| Service | Architecture | Price dimension | Rate (USD) |
| :------ | :----------- | :---------------- | :--------- |
| **AWS Lambda** | ARM (Graviton) | per GB-second | $0.00001333 |
| **AWS Lambda** | x86 | per GB-second | $0.00001667 |
| **AWS Fargate** | ARM (Graviton) | per vCPU-hour | $0.03238 |
| **AWS Fargate** | x86 | per vCPU-hour | $0.04048 |

**Fargate memory:** the post’s long-form body should cite **memory GB-hour** alongside vCPU-hour from the same region row. The simplified scenarios below use a **combined effective $/hour** for a fixed task shape only when that combined rate is explicitly defined in the same section (see §3).

---

## 3. “Hidden” infrastructure tax — NAT Gateway (VPC reality)

Most “Lambda is cheaper” spreadsheets omit the **VPC path**. For private subnets with outbound internet, **NAT Gateway** is often non-optional.

| Line item | Typical rate (USD) | Notes |
| :-------- | :----------------- | :---- |
| NAT Gateway hourly | **$0.045 / hour** | ≈ **$32.85 / month** per gateway (720 h/month) |
| NAT Gateway data processing | **$0.045 / GB** processed | Can **exceed compute** for chatty APIs, large payloads, supply-chain / document pipelines |
| Multi-AZ pattern | **× number of AZs** | e.g. **3 AZs** → **~$98.55 / month** in gateway *existence* cost alone before traffic |

**Story hook (supply chain / high bandwidth):** When payloads or fan-out are large, **NAT data processing** is a first-class FinOps line item—compare it beside Lambda GB-seconds and Fargate task hours in the same paragraph so the reader cannot hand-wave it.

---

## 4. Crossover / break-even — worked scenarios (Mumbai, ARM-first)

### 4.1 Scenario A — always-on Fargate task (authoring numbers)

**Shape:** Node-style API service, **0.5 vCPU**, **1 GB RAM**, **24×7**, **ARM**.

**Authoring combined compute rate (illustrative):**  
**$0.03238/hr (vCPU component used in draft) + $0.0035/hr (RAM component placeholder)** → **$0.03588 / task-hour** (replace RAM line with official **GB-hour** rate × **1 GB** at publish time).

**Monthly (720 h):**  
$0.03588 × 720 ≈ **$25.83 / month** per task (draft rounds to **~$26 / month**).

**Capacity (qualitative):** A single well-sized task often lands in the **tens to low hundreds of RPS** steady state for typical CRUD—**measure** on your workload; do not treat RPS as a universal constant.

### 4.2 Scenario B — Lambda at sustained RPS (make GB-seconds explicit)

**Critical clarity:** Monthly Lambda compute is **requests × GB-seconds per request × $/GB-s**. A common slip is to mis-label **memory GB** vs **GB-seconds per request**.

**Draft parity calculation (matches ~$345/month at 50 RPS):**

- **Sustained traffic:** **50 RPS**  
- **Average duration:** **200 ms**  
- **Allocated memory:** **1 GB** (not 200 MB)  
- **GB-seconds per invocation:** 1 GB × 0.2 s = **0.2 GB-s**  
- **Invocations per month:** 50 × 86,400 × 30 = **129,600,000**  
- **Total GB-s / month:** 129,600,000 × 0.2 = **25,920,000 GB-s**  
- **Lambda compute (ARM, $0.00001333/GB-s):** 25,920,000 × 0.0000133333… ≈ **$345.60 / month** *(requests charge omitted here—add $/1M requests at publish time for completeness)*  

**Concurrent executions:** at 50 RPS × 0.2 s average overlap, **~10** concurrent executions on average (Little’s law: λ × duration). Use this for **capacity** discussion, not as a separate billing multiplier.

### 4.3 Principal verdict (for copy — tune after you lock assumptions)

### 4.4 Migration rollback step

**Migration rollback:** Always include a rollback plan in migration scenarios. For example, use feature flags or traffic shifting to revert to Lambda if ECS migration causes SLO or cost regressions. Document rollback triggers and steps explicitly in the migration section of the final post.

Under the **Scenario A vs B** assumptions above, **Fargate’s ~$26/month** task is **far below** **Lambda’s ~$346/month** compute at **50 RPS**—order-of-magnitude **“elasticity premium”** framing is defensible **if** you state memory, duration, and ARM vs x86 explicitly.

**Rule of thumb for the article (FinOps section):** call it the **“~4 RPS rule”** only if you keep the **same memory/duration** assumptions visible in the same subsection. Rough first-order ARM break-even against **~$26/mo** task with **1 GB × 200 ms** per request:

- Monthly GB-s = `RPS × 518,400 × 0.2`  
- Cost ≈ `RPS × 518,400 × 0.2 × 0.00001333` ≈ **`RPS × $6.91`**  
- Set ≈ **$26** → **RPS ≈ 3.8**  

So **~4 RPS** is a **coherent headline** with these assumptions; change duration/memory and **recompute** before ship.

### 4.4 Compute Savings Plans (2026 framing)

**Compute Savings Plans** can apply across eligible compute (including **Lambda** and **Fargate** in many org setups). In prose:

- Fargate-heavy footprints often **capture more** stable commitment surface area → **larger effective discount** in practice.  
- For the article: a defensible line is **“often another ~20–30% on the container side once commitments land”**—then re-run the break-even and optionally cite **~3 RPS** as **order-of-magnitude** with SPs, **only** if your calculator run supports it.

---

## 5. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

Map research to the **proposed outline** for Post 2:

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **4** | VPC, connections, long-lived work: the boring details | **NAT Gateway** hourly + **$0.045/GB** data processing; **multi-AZ** fixed cost trap; tie to **high-bandwidth** workloads (supply chain context). |
| **7** | FinOps: invocation billing vs task-hour + data transfer | **“~4 RPS rule”** (with assumptions in-view); **13×** framing only when **both** sides use the **same** traffic + memory + duration + architecture basis; **Graviton default**. |
| **8** | Closing: decision matrix | Add row **“Steady-state volume (RPS)”**: **&lt; ~2 RPS** → Lambda often wins on **$/elasticity**; **&gt; ~5 RPS** sustained (with stated assumptions) → **ECS/Fargate** merits a serious task-hour model; middle band → **measure + strangler**. |

**Live post note:** `data/blog/posts/lambda-to-ecs-when-serverless-stops.ts` currently includes a **us-east-1** `cost_table` and a short **ap-south-1** `region_note`. When you ship Mumbai-first math, either **add a second table** (Mumbai, ARM, NAT callout) or **replace** the table with a **region toggle** narrative in copy—avoid silent mixing of regions in one grid.

---

## 6. Pre-publish checklist (FinOps claims)

- [ ] Every $ line cites **region**, **architecture (ARM vs x86)**, and **memory + duration** (or links to calculator export).  
- [ ] **NAT + data processing** mentioned wherever VPC Lambda or ECS tasks in private subnets are discussed.  
- [ ] **Request charges** and **CloudWatch / logs / ALB** called out as “not in this simplified table” or folded in.  
- [ ] **Savings Plans / RI** language is **conditional** (“in our model…”) not absolute.  
- [ ] **“So what?” / Week 1 action plan** satisfied per `docs/BLOG_CONTENT_PLAN.md` cross-post workflow (reader leaves with Sprint Planning–ready moves).

---

## 7. Template — future regional deep-dives (Post N)

Reuse this skeleton for **Post 3+** (DynamoDB, webhooks, OTel, etc.) when a post needs **region- or year-specific** grounding:

1. **Metadata:** slug, `/blog/...` path, outline § map, “last verified” date.  
2. **Thesis:** one paragraph on **why this region / customer segment** changes the default story.  
3. **Official inputs table:** services × unit × USD (link out to AWS docs).  
4. **Non-obvious cost lines:** data transfer, NAT, inter-AZ, API management, storage IO.  
5. **Worked math:** single **Scenario A vs B** with **GB-seconds** written explicitly.  
6. **Sensitivity:** duration ±25%, memory 512 MB vs 1 GB, x86 vs ARM.  
7. **Outline map:** table → which **H2 sections** in `BLOG_CONTENT_PLAN.md`.  
8. **Ship checklist:** calculator screenshot or pasted breakdown in private notes (not necessarily in the article).

**File naming convention:** `docs/blog-research/post-{nn}-{slug-short}-{topic}.md` (zero-padded **nn** matches publish priority where helpful).

---

## 8. Related repo artifacts

- **Plan & outline:** `docs/BLOG_CONTENT_PLAN.md` (§2, outline items 1–8).  
- **Shipped post body (MDX-like blocks):** `data/blog/posts/lambda-to-ecs-when-serverless-stops.ts`.  
- **Career / diagram hooks:** `data/blog/career/lambda-to-ecs-when-serverless-stops.ts`.  
- **Narrative appendix:** `data/blog/narrative/lambda-to-ecs-when-serverless-stops.ts`.
