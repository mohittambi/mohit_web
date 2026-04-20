# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

# Post 11 — Platform metrics (SLIs/SLOs): **cost of the fourth nine** & composite availability (April 2026 framing)

**Canonical post:** `/blog/platform-metrics-slis-slos`  
**Slug:** `platform-metrics-slis-slos`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§11 Platform Metrics That Leadership Actually Trust** (outline items 1–7)  
**Purpose:** Tie **99.9% vs 99.99%** to **downtime math**, **Mumbai-shaped infra $**, **error-budget burn**, and **Revenue at Risk (RaR)**—so SLO targets are a **finance + architecture** decision, not sticker worship. Close with **reliability tiering** and the **composite availability** trap (downstream dependency chain).

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/platform-metrics-slis-slos.ts` per `docs/blog-research/README.md`.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

---

## 0. Disclaimers

- **Downtime minutes** below use the usual **calendar** approximations (365.25-day year, **equal-length months** for “monthly” slices)—good for **blog intuition**, not contract SLAs.  
- **Infra $** is **order-of-magnitude authoring**—rebuild with the **AWS Pricing Calculator** and your **actual** DT, Global Accelerator, Global Tables, and **Fargate** footprint.  
- **RaR** formula in §3 uses a **placeholder loss rate (0.0009)**—replace with **your** incident model (frequency × blast radius × $/minute).

---

## 1. Downtime math — what each nine “buys”

| Availability | Annual downtime | Monthly downtime (÷12) | Infra story (authoring) |
| :----------- | :-------------- | :--------------------- | :---------------------- |
| **99.9%** | **~8.77 h** | **~43.83 min** | Single region **Mumbai**, **3 AZ** active/active baseline |
| **99.99%** | **~52.6 min** | **~4.38 min** | **Multi-region** (e.g. **Mumbai + Singapore** or **Mumbai + us-east-1**) active/passive or active/active |

**Principal insight:** **~4.38 min/month** is smaller than common **DNS TTL + cold start + human triage** windows—**four nines** usually implies **automated failover**, **Anycast/global routing**, and **replicated state** (e.g. **Global Tables**) **before** paging humans for regional impairment.

---

## 2. Infrastructure “price jump” — illustrative Mumbai vs multi-region

**Toy load:** **100M requests/month**, **~10 TB** egress story, **~100 GB** DB footprint (define: DynamoDB storage + backup or RDS—pick one stack in the article).

### Architecture A — **99.9%** (single region Mumbai)

| Line item | Authoring $/mo |
| :-------- | -------------: |
| Compute (**ECS Fargate**, Mumbai-shaped) | **~$260** |
| **DynamoDB** (regional) | **~$150** |
| **Internet egress** (order-of-magnitude) | **~$900** |
| **Total** | **~$1,310** |

### Architecture B — **99.99%** (Mumbai + Singapore story)

| Line item | Authoring $/mo |
| :-------- | -------------: |
| **Global Accelerator** (fixed component) | **~$18** |
| **Premium data transfer** (DT-Premium style, **10 TB** × **~$0.023/GB** authoring) | **~$230** |
| **DynamoDB Global Tables** (replicated writes → **~2×** write path in toy model) | **~$300** (from **~$150**) |
| **Inter-region** transfer (**100 GB** sync + delta story) | **~$45** |
| **Redundant compute** (Singapore **~+10%** vs Mumbai authoring) | **~$286** |
| **Total** | **~$1,779 / month** |

**Delta:** **~$470/mo** infra in this draft, plus **~35%** **operational complexity** (runbooks, game days, DR drills)—price **that** in leadership terms.

---

## 3. Revenue vs reliability — RaR (illustrative)

Define **RaR** in prose as **expected revenue loss from avoidable outages** minus **cost of the mitigation**. The algebra below is a **communication device**, not GAAP.

$$
RaR \approx (\text{Monthly Revenue} \times 0.0009) - \text{Cost of the 4th nine}
$$

**Example A — invest**

- **Revenue:** **$1,000,000 / month**  
- **Placeholder risk term:** \( 1{,}000{,}000 \times 0.0009 = 900 \)  
- **Mitigation cost (draft):** **$500 / month**  
- **Verdict:** positive “**reliability profit**” in the story—**invest** *if* the 0.0009 factor is defensible for your incident history.

**Example B — do not over-buy**

- **Revenue:** **$100,000 / month** → placeholder **$90** vs **$500** mitigation → **apologize / insure / comms** may beat **full multi-region** for that tier.

**Guardrails in copy:** show **sensitivity** tables (0.0003, 0.0009, 0.003) and name what **0.0009** actually means (e.g. **expected affected GMV** per month from **regional** failures).

**RaR sensitivity table prompt:**
Add a table showing how different risk factors (e.g., 0.0003, 0.0009, 0.003) affect the Revenue at Risk (RaR) calculation for a range of monthly revenues. This helps leadership understand the impact of SLO decisions.

---

## 4. Composite availability trap

If **Senseahead** depends on **five** independent downstreams each at **99.9%** availability (simplified independence story):

$$
A_{\text{total}} \approx 0.999^{5} \approx \mathbf{99.50\%}
$$

**Copy punch:** you can spend **millions** polishing **your** four nines while **user-perceived** availability is capped by the **weakest link** in the **dependency graph**—**SLOs must include** third parties or **honest** “best effort” language.

---

## 5. Burn rate as “budget” (outline §4)

For **99.9%** monthly error budget (**~43.83 min** “bad” minutes/month in the equal-month model):

- A **15-minute** regional blip consumes **\( 15 / 43.83 \approx 34\% \)** of the **monthly** budget in **one event**—close to user’s **35%** headline.

**Plan alignment:** multi-window burn—**link** to Google SRE workbook or internal runbook; **avoid inventing formulas** (plan validation checklist).

---

## 6. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **3** | Choosing SLO targets with error budget policy | **“ROI of a nine”** box: downtime table + **$1M vs $100k** RaR examples; tie to **tiering** (below). |
| **4** | Multi-window burn alerts | **Burn = budget**: **15 min** vs **43.83 min** → **~35%** monthly burn; connect to **freeze vs fix** policy (outline §5). |
| **7** | Closing: one-page SLO template | **Reliability tiering** table (extend the template): |

**Reliability tiering (authoring)**

| Tier | Surface | Target (authoring) | Infra posture |
| :--- | :------ | :----------------- | :------------ |
| **1** | Checkout / wallet / money movement | **99.99%** | Multi-region, Global Tables / DR of record |
| **2** | Search / catalog | **99.9%** | Multi-AZ, aggressive caching |
| **3** | Reporting / analytics | **99%** | Single-AZ / **Spot** where acceptable |

---

## 7. Pre-publish checklist

- [ ] SLIs **measurable** at defined boundaries (plan checklist).  
- [ ] Honest **exclusion** policy (abuse, canaries) if you cite availability numbers.  
- [ ] Error budget ties to **actions** (freeze, defer features, pay debt)—not vanity charts.  
- [ ] Burn rate: **simple story** + **link** to canonical math—no wrong formulas.  
- [ ] **“So what?” / Week 1 action plan** per cross-post workflow.

---

## 8. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§11).  
- **Post body:** `data/blog/posts/platform-metrics-slis-slos.ts` (implementation phase).  
- **Observability cost:** `docs/blog-research/post-04-opentelemetry-ap-south-1-observability-bill.md` (why you need **signals** before you can **SLO** honestly).
