import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "opentelemetry-sampling-cost",
  title: "OpenTelemetry in Production: Sampling Strategies That Do Not Drown You in Cost",
  description:
    "Head sampling, tail sampling, and collector pipelines: how to keep traces useful without paying twice in storage and query latency.",
  publishedAt: "2026-04-15",
  readTime: "11 min read",
  tags: ["OpenTelemetry", "Observability", "SRE", "Cost"],
  sections: [
    {
      kind: "p",
      text: "Infinite cardinality and 100% trace capture are incompatible with both budget and query performance. The goal is representative coverage: enough signal to find regressions and enough headroom to drill into incidents when they happen.",
    },
    {
      kind: "h2",
      text: "Collector-first vs SDK-first (validation)",
    },
    {
      kind: "p",
      text: "For **cost and cardinality**, I bias toward **collector-side** processing: drop health checks, strip high-cardinality attributes, apply tail policies, and fan-in from many agents before spans hit a paid backend—think of the collector as a **gateway** that protects your bill. For **application CPU and egress**, a **modest SDK head sample** (consistent parent-based) still belongs close to the process so you are not serialising and exporting spans you already know you will discard. The split is not religious: use SDK sampling when hot paths cannot afford export volume; use collector transforms when the economics of storage and query dominate. Tail sampling almost always belongs at the collector where it can see the whole trace.",
    },
    {
      kind: "h2",
      text: "Head sampling for the baseline",
    },
    {
      kind: "p",
      text: "Consistent probabilistic sampling keeps parent-child relationships coherent across services. Document the effective sample rate per environment; staging can run hotter than production, but teams should not confuse the two when comparing latency histograms.",
    },
    {
      kind: "h2",
      text: "Tail sampling for the exceptions",
    },
    {
      kind: "p",
      text: "Reserve tail sampling for traces that errored, breached latency SLOs, or match high-value attributes (tenant tier, payment path). Run tail decisions at the collector cluster with bounded memory—unbounded buffering is how you trade log volume for outage volume.",
    },
    {
      kind: "h2",
      text: "Cost controls that survive reorgs",
    },
    {
      kind: "ul",
      items: [
        "Drop health checks and synthetic traffic at the collector (gateway) where possible—before they become billable series.",
        "Attribute budgets: cap unique values per key in backends that bill by cardinality; trim at collector when SDK cannot see global cardinality.",
        "Retention tiers: hot traces for days, sampled aggregates for months.",
      ],
    },
  ],
};
