# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.
# For AWS limits/pricing, see [official AWS documentation](https://docs.aws.amazon.com/).

# Post 9 — DynamoDB hot partitions: **physics of the ~100k RPS wall** (April 2026 framing)

**Canonical post:** `/blog/dynamodb-hot-partitions`  
**Slug:** `dynamodb-hot-partitions`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§9 DynamoDB Hot Partitions** (outline items 1–7)  
**Purpose:** Explain why **adaptive capacity** does not repeal **per-partition ceilings**—and how **write sharding**, **scatter-gather read tax**, **GSI write amplification**, and **counter architecture** (DynamoDB vs Redis) show up in **ap-south-1** bills and **CloudWatch** signals.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/dynamodb-hot-partitions.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers (plan-aligned)

- **Partition throughput and storage ceilings change.** In prose, **link current AWS documentation** for **per-partition maximums** and **adaptive capacity** behaviour—do not treat any number in this file as permanent law.  
- The **3,000 RCU / 1,000 WCU / ~10 GB** trio below is the **standard teaching model**; replace with **“per AWS docs as of \<date\>”** at publish.  
- **“Warm Throughput”** (or similarly named **declared baseline / readiness** features): **verify** product name, **pricing**, and **regional availability** in the AWS console and docs before claiming **$** impact.

---

## 1. The hard limits (conceptual baseline — verify on AWS)

Each **physical partition** backs a slice of the key space. A **single hot partition** cannot be “balanced” into exceeding its own ceiling: adaptive behaviour **redistributes** slack **across** partitions, but **one viral sort key** still owns **one partition’s** budget.

| Dimension | Typical teaching limit (verify) |
| :-------- | :-------------------------------- |
| **Read** | **~3,000 RCU/s** equivalent (on-demand uses RRU; provisioned uses RCU) |
| **Write** | **~1,000 WCU/s** equivalent |
| **Storage** | **~10 GB** per partition before **split** (splits help storage/heat spread, but **do not** multiply **writes to one key**) |

**Myth to bust:** adaptive capacity **borrows** unused capacity **elsewhere** in the table—it **does not** let one **logical item** absorb **100k writes/sec** if those writes **hash to one partition**.

---

## 2. Sharding math — “cooling” factor for **peak writes**

**Goal:** spread **peak writes per second** across enough **physical** partitions that each stays **under** the per-partition write ceiling (after **WCU/WRU** conversion for your mode).

$$
\text{Shards} = \left\lceil \frac{\text{Peak writes per second}}{\text{Per-partition write ceiling}} \times \text{Safety multiplier} \right\rceil
$$

**Illustrative example (authoring):** **100,000 writes/sec** logical requirement on one **logical entity** (e.g. viral **Senseahead** event stream), using **~1,000 WCU/s** per partition as the ceiling in the story:

- **Base:** \( \lceil 100{,}000 / 1{,}000 \rceil = 100 \) shards.  
- **Safety 1.5×:** \( \lceil 100 \times 1.5 \rceil = 150 \) shards.  
- **Key shape:** e.g. `EVENT#<id>#SHARD#<0..149>` (or `ShardID` embedded in sort key per your access pattern).

**Copy discipline:** this is **engineering fiction** until you map **item size**, **transactional writes**, **LWT**, and **GSI** projections into **effective WCUs**—the **150** number is a **pedagogical** anchor, not a SKU.

**Real item size/transactional write example:**
Add a worked example showing how a real item size (e.g., 2 KB vs 400 B) and a transactional write (e.g., TransactWriteItems with 2 items) affect the effective WCU calculation and partition heat. Reference the AWS docs for the latest calculation rules.

---

## 3. Mumbai pricing — sharding as **budget** (ap-south-1)

**Authoring table** — re-pull **On-Demand** vs **Provisioned** rows from the official **DynamoDB pricing** page for Mumbai at ship time.

| Metric | On-demand (Mumbai, authoring) | Provisioned (Mumbai, authoring) |
| :----- | :---------------------------- | :-------------------------------- |
| **Write** | **$1.25 / million** WRUs | **$0.00065 / WCU-hour** (verify) |
| **Read** | **$0.25 / million** RRUs | **$0.00013 / RCU-hour** (verify) |
| **Storage (Standard-IA class)** | **$0.10 / GB-mo** | **$0.10 / GB-mo** |

### Scatter-gather read tax

If **writes** fan out to **150** shards but **“total count”** needs **all** shards, a naïve read path may require **O(shards)** **Query**/**Get** calls.

- **Write path:** still **~1 WRU per small write** (shape-dependent).  
- **Read path:** **aggregate** reads can grow **linearly with shard count**—**150×** RRUs vs a single-hot-key fantasy.

**Principal tip:** prefer **calculated sharding** (e.g. `hash(userId) % N` with a **stable** `N`) over **pure random** shards when the read pattern allows **targeted gather** (only **k** shards), not always **all N**.

---

## 4. “Warm throughput” (2026 framing — verify before publish)

**Story:** historically teams **over-provisioned** then **scaled down** to avoid **warm-up** throttle windows during known spikes (e.g. **2 PM** viral event). **Declared baseline / warm throughput**-style controls (name per AWS) let you signal **expected spike shape** in advance.

- **Cost:** expect a **premium** for **reserved readiness**—model it in **FinOps** next to **throttle risk** and **customer-visible errors**.  
- **Benefit:** fewer **15-minute** throttle storms during **step traffic**—quantify with **before/after** `ThrottledRequests` and **p99** in a **game day**.

---

## 5. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **2** | How heat shows up in metrics and errors | **CloudWatch Contributor Insights** (or successor) as **“X-ray for hot keys”**—mock dashboard: one **HTS** (or SKU) driving **~90%** throttles; tie to **ABAC** tenant story where relevant. |
| **3** | Write sharding; read path cost | **150-shard math** + **scatter-gather** warning; calculated vs random sharding. |
| **5** | Counters: DynamoDB vs dedicated services | **Sharded DynamoDB counters:** durable, transactional, **expensive to aggregate read**. **Redis:** fast/cheap aggregate, needs **write-behind** / **idempotent merge** to **ledger of record** (supply chain truth). |
| **6** | Testing | Load tests that **match Zipf** / viral keys—not uniform random **lies**. |
| **4** | Streams and async aggregation | Optional: **buffer** spikes (**SQS/Kinesis**) before **sharded** writes to smooth **WCU** bursts (plan theme). |

---

## 6. Pre-publish checklist

- [ ] Numeric limits **referenced** to official AWS docs (plan validation)—not “forever constants” in marketing voice.  
- [ ] Read amplification of sharding **acknowledged** (plan checklist).  
- [ ] **Test plan** present (plan checklist), not only design.  
- [ ] **ABAC** / tenant isolation story consistent with `BLOG_CONTENT_PLAN.md` §9 detailed review.  
- [ ] **“So what?” / Week 1 action plan** per cross-post workflow.

---

## 7. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§9).  
- **Post body:** `data/blog/posts/dynamodb-hot-partitions.ts` (implementation phase).  
- **DynamoDB WRU / Streams+TTL (webhooks):** `docs/blog-research/post-03-idempotent-webhooks-ap-south-1-dynamodb.md` (complementary cost story).
