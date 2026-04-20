# Post 12 — IDP without boiling the ocean: **TCO of paving the road** (April 2026 framing)

**Canonical post:** `/blog/idp-without-boiling-ocean`  
**Slug:** `idp-without-boiling-ocean`  
**Content plan outline:** `docs/BLOG_CONTENT_PLAN.md` → **§12 Building an Internal Developer Platform Without Boiling the Ocean** (outline items 1–7)  
**Purpose:** Reframe the IDP as a **product** with **maintenance tax** and **headcount TCO**—**India market** salary bands, **buy vs build** crossover, **TTFD** as an anti–boil-the-ocean probe, and a **cheap golden path** (docs + CLI + Terraform/Cookiecutter) before a heavy **self-service UI**.

**Workflow:** Stabilize this doc first; then implement in `data/blog/posts/idp-without-boiling-ocean.ts` per `docs/blog-research/README.md`.

---

## 0. Disclaimers

- **Salary bands (₹)** are **April 2026 authoring placeholders** for **Hyderabad / Bangalore / Mumbai**—replace with **your** comp bands, **ESOP**, and **bench** reality before publishing.  
- **USD equivalents** move with **FX**—show **₹ primary** in India-facing copy.  
- **SaaS $** ranges are **estimates**—get quotes (Backstage-as-a-service, Humanitec, Port, etc.) before citing in a deck.  
- **“200 developers” crossover** is a **heuristic**, not a law—derive from **your** TTFD, ticket volume, and **toil hours** in a spreadsheet.

---

## 1. Build math — headcount is the real infra

**Thesis:** a **custom IDP** is not a one-time project; it is a **product** that burns **platform FTE** forever.

### Annual team cost — **4-person lean** platform team (authoring)

| Role | Authoring band (₹ / year) |
| :--- | :------------------------ |
| 1× Staff / Principal | **₹75L – ₹90L** |
| 2× Senior DevOps / SRE | **₹90L** total (**₹45L** each) |
| 1× Frontend / “platform product” engineer | **₹35L** |
| **Overhead** (benefits, laptops, office, etc.) | **~20%** on loaded cost |

**Total annual burn (authoring):** **~₹2.4Cr – ₹2.6Cr** (order-of-magnitude **~$290k – $315k USD** at publish-time FX).

**Opportunity cost (copy):** four strong engineers **not** shipping **Senseahead / Impli** differentiators—that is the **“boiling the ocean”** emotional truth behind the spreadsheet.

---

## 2. Buy math — managed IDP TCO (2026 estimates)

| Metric | Managed IDP (SaaS, authoring) | Custom build (internal) |
| :----- | :------------------------------ | :---------------------- |
| **Subscription** | **~$15k – $40k / year** | **$0** list (no vendor line) |
| **Implementation** | **~1 month**, often **part-time** embed | **6–12 months** **full-time** team |
| **Maintenance** | **Included** in vendor model (still: integration work) | **Ongoing headcount** — authoring **~₹1.5Cr / year** in one draft row (tune to your retained team size) |
| **Feature velocity** | **Higher** on generic catalog / RBAC / plugins | **Lower** when competing with product roadmaps |

**Crossover heuristic (authoring):** below **~200 developers**, **greenfield “build the whole portal”** is often **net-negative ROI** vs **buy baseline + custom plugins**. The **principal move:** **buy the portal / control plane**, **build the golden paths and adapters** (CI templates, policy-as-code, service templates).

---

## 3. Boiling the ocean — **TTFD** as the probe

**Metric:** **Time to First Deploy (TTFD)** — `git init` → **production “hello world”** in **&lt; 30 minutes** (authoring target; tune per regulated industry).

**Boiling detector:** if the team ships a **Service Catalog** in **6 months** but TTFD is still **3 days** because **IAM / change tickets** are manual, you built **theatre**, not leverage.

**Formula (rhetorical, not Excel):**

$$
\text{Platform value} \propto \frac{\Delta \text{TTFD} + \Delta \text{MTTR} + \Delta \text{toil hours}}{\text{Annual platform burn}}
$$

If numerator stays **flat** while denominator is **₹2.5Cr**, you are over-engineering the wrong layer—**pave approvals and IAM** before **pixel polish**.

---

## 4. Regional nuance — **India scale** advantage (ap-south-1 org reality)

# IMPORTANT: All rates, model names, and cost figures are April 2026 placeholders. Replace with current official pricing, SKUs, and region-specific numbers before publishing.

**Validation checklist:** See docs/BLOG_CONTENT_PLAN.md for required blocks and validation steps. Confirm all checklist items are addressed before finalizing.

- **Talent depth** at junior/mid levels supports **documentation + enablement** + **CLI-first** workflows.  
- **Strategy:** defer the **heavy self-service UI**; invest **one senior month** in **golden path docs**, **Terraform modules**, **Cookiecutter** / **Backstage scaffolder**, and **one blessed CI template**.  
- **Claim discipline:** “**~80% of IDP value at ~5% of cost**” is **story-level**—back with **TTFD before/after** and **ticket volume** or remove the percentages.

**TTFD/ticket volume chart prompt:**
Add a before/after chart or table showing Time to First Deploy (TTFD) and/or ticket volume reduction after IDP adoption. This provides concrete evidence for ROI claims.

---

## 5. Where this lands in the long-form outline (`BLOG_CONTENT_PLAN.md`)

| Outline § | Title | Insert |
| :-------- | :---- | :----- |
| **3** | Metrics: TTFD, MTTR, developer NPS | **Developer NPS vs platform burn** — if burn is **₹2.5Cr/yr** and engineers still hate deploys, the IDP **failed** (outcome > feature count per validation checklist). |
| **5** | Org design: platform team composition | **Platform-as-a-product** — without a **PM / TPM** (even **fractional**), **do not** commission a multi-quarter **custom portal**; rotation from product teams; **exceptions** path (plan §4). |
| **6** | Showback / accountability | Tie **platform $** and **FTE** to **showback** lines leadership can audit. |
| **7** | Closing: 90-day plan sketch | Use the **MVP ladder** below; ensure **Week 1 action plan** in shipped post (cross-post workflow). |

### 90-day MVP plan (authoring)

| Phase | Days | Deliverable |
| :---- | :--- | :---------- |
| **Map** | **1–30** | Catalog existing services, owners, deploy paths, **top 3** toil tickets. |
| **Paved road** | **31–60** | Standard **CI/CD** templates, **one** golden service path end-to-end. |
| **Golden path** | **61–90** | **Automated scaffolding** (repo + IaC + pipeline wiring) with **guardrails**, not a thousand knobs. |

---

## 6. Pre-publish checklist (plan-aligned)

- [ ] Success metrics are **outcome**-based (TTFD, MTTR, toil), not “we shipped a portal.”  
- [ ] **Exceptions path** exists—no one-size-fits-all fantasy.  
- [ ] **Cost + cognitive load** of the platform itself are explicit.  
- [ ] **Kubernetes optionalism** — golden path can be **ECS/Lambda**-first if that is your org.  
- [ ] Honest about **vendor** vs **build** when regulated data residency applies (e.g. **ap-south-1** only paths).

---

## 7. Related repo artifacts

- **Plan:** `docs/BLOG_CONTENT_PLAN.md` (§12).  
- **Post body:** `data/blog/posts/idp-without-boiling-ocean.ts` (implementation phase).  
- **SLO / reliability buy arguments:** `docs/blog-research/post-11-platform-metrics-fourth-nine-economics.md` (why **toil reduction** must show up in **budgets**).
