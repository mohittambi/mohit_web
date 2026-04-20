import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "platform-metrics-slis-slos",
  title: "Platform Metrics That Leadership Actually Trust: SLIs, SLOs, and Error Budgets",
  description:
    "Connecting user-perceived reliability to metrics executives can reason about -- and budgets that change behaviour.",
  publishedAt: "2026-04-08",
  readTime: "8 min read",
  difficulty: "Intermediate",
  tags: ["SRE", "SLO", "Leadership", "Observability"],
  sections: [
    {
      kind: "p",
      text: "Uptime percentages without user context invite cynicism. SLIs grounded in request success, latency percentiles, and freshness for data products align engineering work with what customers feel.",
    },
    {
      kind: "h2",
      text: "What each nine actually buys",
    },
    {
      kind: "p",
      text: "Reliability targets are architecture decisions in disguise. 99.9% fits a single-region, multi-AZ baseline. 99.99% implies automated failover, Anycast routing, replicated state, and game days -- human triage windows are longer than the allowed downtime.",
    },
    {
      kind: "cost_table",
      title: "Downtime math and infra posture per availability tier",
      headers: ["Availability", "Annual downtime", "Monthly downtime", "Infra story"],
      rows: [
        ["99%", "~87.6 h", "~7.3 h", "Single-AZ, acceptable for reporting/analytics"],
        ["99.9%", "~8.77 h", "~43.8 min", "Multi-AZ active/active, Mumbai single region"],
        ["99.99%", "~52.6 min", "~4.4 min", "Multi-region (Mumbai + Singapore), automated failover"],
        ["99.999%", "~5.26 min", "~26 sec", "Active/active multi-region, 24x7 oncall, chaos-tested"],
      ],
      note: "~4.4 min/month is smaller than common DNS TTL + cold start + human triage windows. Four nines usually implies automated failover and replicated state before humans are paged.",
    },
    {
      kind: "h2",
      text: "The price of the fourth nine",
    },
    {
      kind: "p",
      text: "Each additional nine is not linear in cost. The jump from 99.9% to 99.99% typically requires multi-region infrastructure, Global Tables replication, Global Accelerator, and doubled operational discipline. Budget the delta explicitly.",
    },
    {
      kind: "cost_table",
      title: "Infrastructure cost delta -- 99.9% vs 99.99% (Mumbai, authoring order-of-magnitude)",
      headers: ["Line item", "99.9% (single region)", "99.99% (multi-region)", "Delta"],
      rows: [
        ["Compute (ECS Fargate)", "~$260/mo", "~$546/mo (Mumbai + Singapore)", "+$286/mo"],
        ["DynamoDB (Global Tables)", "~$150/mo", "~$300/mo (~2x write path)", "+$150/mo"],
        ["Global Accelerator", "$0", "~$18/mo (fixed)", "+$18/mo"],
        ["Inter-region data transfer (100 GB)", "$0", "~$45/mo", "+$45/mo"],
        ["Premium DT (10 TB x ~$0.023/GB)", "$0", "~$230/mo", "+$230/mo"],
        ["Total", "~$410/mo", "~$1,139/mo", "+$729/mo"],
      ],
      note: "Authoring order-of-magnitude -- rebuild with AWS Pricing Calculator and your actual footprint. The ~$730/mo delta is the infrastructure cost; add ~35% for operational complexity (runbooks, game days, DR drills).",
    },
    {
      kind: "h2",
      text: "Revenue at Risk: making the case to finance",
    },
    {
      kind: "p",
      text: "Define RaR as expected revenue loss from avoidable outages minus cost of the mitigation. The algebra is a communication device -- back it with your actual incident history and blast-radius model.",
    },
    {
      kind: "prompt_example",
      title: "Revenue at Risk calculation -- invest vs do not over-buy",
      after: {
        label: "RaR sensitivity (illustrative -- replace 0.0009 with your incident model)",
        language: "plaintext",
        code: `RaR formula:
  RaR = (Monthly Revenue x risk_factor) - mitigation_cost

risk_factor: placeholder for (expected affected GMV per month
from regional failures) -- derive from incident history,
not from a consultant's default. Show sensitivity:

  risk_factor   $1M revenue   $100k revenue
  0.0003        $300/mo       $30/mo
  0.0009        $900/mo       $90/mo
  0.003         $3,000/mo     $300/mo

Mitigation cost (authoring): ~$730/mo for multi-region delta

Example A -- invest ($1M/mo revenue, 0.0009 factor):
  RaR = $900 - $730 = +$170 "reliability profit" -- invest
  (only if 0.0009 is defensible from incident history)

Example B -- do not over-buy ($100k/mo revenue, 0.0009):
  RaR = $90 - $730 = -$640/mo -> apologise / insure / comms
  may beat full multi-region at this revenue tier`,
      },
      note: "Show the sensitivity table so leadership can plug in their own risk tolerance. The 0.0009 factor must be grounded in actual incident frequency x blast radius -- not borrowed from a benchmark.",
    },
    {
      kind: "h2",
      text: "SLIs you can defend",
    },
    {
      kind: "ul",
      items: [
        "Measure from the edge or client where possible, not only inside the happy VPC path.",
        "Exclude known bad clients only with written policy -- otherwise you are optimising dashboards, not experience.",
        "Keep SLI definitions in version control with change history.",
      ],
    },
    {
      kind: "h2",
      text: "SLOs and error budgets as negotiation",
    },
    {
      kind: "p",
      text: "An error budget is the currency for velocity versus stability. When the budget burns, freeze risky launches, pay down debt, and invest in automation. When budget is healthy, product can absorb more experimentation. Review both SLI charts and budget policy quarterly so targets stay credible.",
    },
    {
      kind: "cost_note",
      label: "Error budget burn -- 15-minute incident",
      paragraphs: [
        "For a 99.9% monthly SLO: error budget = ~43.8 min/month. A single 15-minute regional blip consumes 15 / 43.8 = **~34% of the monthly budget** in one event. Two such incidents exhaust the budget and trigger the freeze-vs-fix policy before the month ends.",
        "**Composite availability trap:** if your platform depends on 5 independent services each at 99.9%, the combined availability is 0.999^5 = **~99.5%**. You can spend millions polishing your own four nines while user-perceived availability is capped by the weakest dependency. SLOs must include third-party dependencies or use honest 'best effort' language.",
        "**Reliability tiering (authoring):** Tier 1 (checkout / money movement) -> 99.99%, multi-region Global Tables. Tier 2 (search / catalog) -> 99.9%, multi-AZ aggressive caching. Tier 3 (reporting / analytics) -> 99%, single-AZ / Spot where acceptable.",
      ],
    },
  ],
};
