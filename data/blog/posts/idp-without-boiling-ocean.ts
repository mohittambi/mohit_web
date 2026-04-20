import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "idp-without-boiling-ocean",
  title: "Building an Internal Developer Platform Without Boiling the Ocean",
  description:
    "Golden paths, paved roads, and sequencing that earns trust before you centralise everything.",
  publishedAt: "2026-04-07",
  readTime: "10 min read",
  difficulty: "Intermediate",
  tags: ["Platform", "DevEx", "Kubernetes", "Culture", "Developer Experience"],
  sections: [
    {
      kind: "p",
      text: "Internal developer platforms fail when they are a big-bang mandate from a team far from delivery pressure. Successful IDPs start as narrow golden paths that remove toil for one critical workflow, then expand by invitation. Treat the IDP as **Developer Experience (DevEx) infrastructure**, not a portal skin: the goal is to stop your strongest engineers from quitting because every ship still feels like editing **raw YAML** in three repos and begging for kube-context in Slack.",
    },
    {
      kind: "h2",
      text: "Build vs buy: headcount is the real infra cost",
    },
    {
      kind: "p",
      text: "A custom IDP is not a one-time project -- it is a product that burns platform FTE forever. Before commissioning a multi-quarter build, run the TCO honestly: the maintenance tax often exceeds the subscription cost of a managed baseline within 18 months.",
    },
    {
      kind: "cost_table",
      title: "Build vs buy TCO -- 4-person lean platform team (India market, April 2026 authoring)",
      headers: ["Metric", "Managed IDP (SaaS)", "Custom build (internal)"],
      rows: [
        ["Subscription", "~$15k-$40k / year", "$0 list (no vendor line)"],
        ["Implementation", "~1 month, often part-time embed", "6-12 months full-time team"],
        ["Annual team cost (4 FTE)", "--", "~Rs2.4Cr-Rs2.6Cr (~$290k-$315k at FX)"],
        ["Maintenance", "Included in vendor model", "~Rs1.5Cr / year ongoing headcount"],
        ["Feature velocity", "Higher on generic catalog / RBAC / plugins", "Lower when competing with product roadmaps"],
        ["Break-even", "Often < 1 year vs full custom build", "4+ years if zero scope creep"],
      ],
      note: "4-person team: 1x Staff/Principal (~Rs75L-90L), 2x Senior DevOps/SRE (~Rs90L total), 1x Frontend/platform product (~Rs35L), ~20% overhead. Opportunity cost: 4 strong engineers not shipping product differentiators -- that is the 'boiling the ocean' emotional truth behind the spreadsheet. Salary bands are authoring placeholders; use your comp bands.",
    },
    {
      kind: "h2",
      text: "TTFD as the boiling detector",
    },
    {
      kind: "p",
      text: "Time to First Deploy (TTFD) -- `git init` to production 'hello world' -- is the single metric that exposes whether your IDP creates leverage or theatre. If the team ships a Service Catalog in 6 months but TTFD is still 3 days because IAM and change tickets are manual, you built theatre, not leverage.",
    },
    {
      kind: "cost_note",
      label: "Platform ROI framing",
      paragraphs: [
        "**Platform value is proportional to**: (delta TTFD + delta MTTR + delta toil hours) / annual platform burn. If the numerator stays flat while the denominator is Rs2.5Cr/year, you are over-engineering the wrong layer.",
        "**Pave approvals and IAM before pixel polish.** The highest-return IDP investments are automated IAM role vending, one-click environment provisioning, and a single blessed CI template -- not a beautiful portal. Celebrate when teams delete bespoke Helm from their services.",
        "**'~80% of IDP value at ~5% of cost'** is story-level. Back it with TTFD before/after and ticket volume reduction or remove the percentages from your pitch deck.",
      ],
    },
    {
      kind: "h2",
      text: "DevEx and retention: beyond the portal",
    },
    {
      kind: "p",
      text: "Measure **time-to-first-deploy**, **MTTR**, and a lightweight **toil index** (support tickets, pager noise, 'how do I wire IAM?' DMs). When those flatline while headcount grows, you are paying retention tax. A golden path that hides Kubernetes unless someone opts in is often cheaper than teaching every product team the entire control plane. Celebrate when teams **delete** bespoke Helm from their services -- that is the same signal as revenue in internal platforms.",
    },
    {
      kind: "h2",
      text: "Golden path first",
    },
    {
      kind: "p",
      text: "Pick one service template: build, test, deploy, observability, and access patterns baked in. Measure time-to-first-deploy and mean time to recovery for teams on the path versus off it. Publish those numbers -- adoption follows proof.",
    },
    {
      kind: "h2",
      text: "90-day MVP plan",
    },
    {
      kind: "cost_table",
      title: "90-day IDP MVP ladder",
      headers: ["Phase", "Days", "Deliverable"],
      rows: [
        ["Map", "1-30", "Catalog existing services, owners, deploy paths, top 3 toil tickets"],
        ["Paved road", "31-60", "Standard CI/CD templates, one golden service path end-to-end"],
        ["Golden path", "61-90", "Automated scaffolding (repo + IaC + pipeline wiring) with guardrails, not a thousand knobs"],
      ],
      note: "Without a PM or TPM (even fractional), do not commission a multi-quarter custom portal. Rotation from product teams keeps platform grounded in real delivery pressure.",
    },
    {
      kind: "h2",
      text: "Self-service with guardrails",
    },
    {
      kind: "p",
      text: "Paved roads should be the easiest option, not the only one. Policy-as-code and automated checks catch mistakes early; human exceptions need a visible process. Chargeback or showback transparency keeps platform teams accountable for cost and complexity they introduce.",
    },
    {
      kind: "h2",
      text: "Organisational sequencing",
    },
    {
      kind: "p",
      text: "Staff platform squads with engineers who have shipped production services recently. Rotate product engineers through the platform team. Celebrate reductions in bespoke YAML more than raw feature count -- the goal is flow, not footprint.",
    },
  ],
};
