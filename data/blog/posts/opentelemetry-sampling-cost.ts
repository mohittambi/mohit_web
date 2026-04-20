import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "opentelemetry-sampling-cost",
  title: "OpenTelemetry in Production: Sampling Strategies That Do Not Drown You in Cost",
  description:
    "Head sampling, tail sampling, and collector pipelines: how to keep traces useful without paying twice in storage and query latency.",
  publishedAt: "2026-04-15",
  readTime: "11 min read",
  difficulty: "Intermediate",
  tags: ["OpenTelemetry", "Observability", "SRE", "Cost"],
  sections: [
    {
      kind: "p",
      text: "Infinite cardinality and 100% trace capture are incompatible with both budget and query performance. The goal is representative coverage: enough signal to find regressions and enough headroom to drill into incidents when they happen.",
    },
    {
      kind: "h2",
      text: "The silent killer: observability vs compute ratio",
    },
    {
      kind: "p",
      text: "OTel auto-instrumentation is convenient, but it can triple span volume versus a lean manual baseline. At that scale, your observability backend bill starts competing with -- and sometimes exceeding -- your compute spend. A backend priced on ingestion volume rewards noise discipline; one priced on indexing rewards cardinality discipline. Know which you are on.",
    },
    {
      kind: "cost_table",
      title: "AWS-native signal pricing -- ap-south-1 (April 2026, authoring baseline)",
      headers: ["Signal type", "Ingestion / recording", "Retention / storage"],
      rows: [
        ["X-Ray traces", "$5.00 per 1M traces recorded", "30-day included in model"],
        ["CloudWatch Logs", "$0.50 per GB ingested", "$0.03 per GB-month stored"],
        ["Application Signals (spans indexed)", "$1.50 per 1M spans indexed", "S3-class archive tier"],
      ],
      note: "A fat trace with 50+ spans and rich attributes can reach ~100 KB serialised. At 100M traces/month, the recording line alone is ~$500/mo -- but if that same payload volume hit a log-priced ingest path, it becomes ~$5,000/mo. Unit-vs-volume pricing intuition matters when you choose how to export.",
    },
    {
      kind: "h2",
      text: "Commercial backends: indexing is where bills compound",
    },
    {
      kind: "p",
      text: "Third-party backends typically blend a low ingestion $/GB with a much higher indexing tier that charges for long-retention, high-cardinality attributes. OTel auto-instrumentation attribute explosion hits indexing rates hard.",
    },
    {
      kind: "cost_table",
      title: "Bill-shock scenario -- 100 GB/day ingestion (illustrative estimates, verify vendor contracts)",
      headers: ["Line item", "Rate (est.)", "Monthly cost"],
      rows: [
        ["Compute (10 Fargate tasks, Mumbai)", "~$26/task/mo", "~$260/mo"],
        ["Datadog-shaped ingest (~100 GB/day)", "~$0.10/GB", "~$300/mo"],
        ["Datadog-shaped indexing (15-day tier)", "~$1.70/GB indexed", "~$5,100/mo"],
        ["Observability total", "--", "~$5,400/mo"],
        ["Obs : Compute ratio", "--", "~20x compute"],
      ],
      note: "Toy model -- assumptions: 100 GB/day, 15-day indexing tier, 10 tasks. Publish assumptions in the same paragraph as the headline ratio. Vendor numbers are estimates; verify at contract.",
    },
    {
      kind: "h2",
      text: "Collector vs SDK: where to cut first",
    },
    {
      kind: "p",
      text: "Start with **collector-side** drops and transforms when the problem is **bill, cardinality, or backend query latency** -- health checks stripped, attributes trimmed, tail policies applied, fan-in before a paid gateway -- because that is where noise aggregates across services. Add **SDK-side** (consistent parent-based) head sampling when **application CPU or egress** on the hot path dominates: do not serialise and export spans you already know you will discard. Tail sampling almost always belongs at the **collector** so policy sees the **whole trace**; pair both layers deliberately rather than fixing cost only in the SDK while ignoring the pipeline.",
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
      text: "Reserve tail sampling for traces that errored, breached latency SLOs, or match high-value attributes (tenant tier, payment path). Run tail decisions at the collector cluster with bounded memory -- unbounded buffering is how you trade log volume for outage volume.",
    },
    {
      kind: "code_block",
      title: "Tail sampling policy -- collector gateway (validate against your OTel Collector version)",
      language: "yaml",
      code: `processors:
  tail_sampling:
    decision_wait: 10s   # RAM budget: buffer this window across all in-flight traces
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

# decision_wait increases RAM and time-to-backend for kept traces.
# Use a composite policy so errors + latency are always kept;
# healthy traffic is thinned probabilistically.
# Verify OR vs AND semantics for your collector version.`,
    },
    {
      kind: "p",
      text: "A policy like this -- keep 100% of errors, 100% of traces above 1000 ms, 5% of healthy traffic -- typically delivers 80-90% volume reduction versus exporting everything. Validate with before/after GB/day from your vendor or self-hosted store; policy economics depend entirely on your actual error rate and latency distribution.",
    },
    {
      kind: "h2",
      text: "Cost controls that survive reorgs",
    },
    {
      kind: "ul",
      items: [
        "Drop health checks and synthetic traffic at the collector (gateway) where possible -- before they become billable series.",
        "Attribute budgets: cap unique values per key in backends that bill by cardinality; trim at collector when SDK cannot see global cardinality.",
        "Retention tiers: hot traces for days, sampled aggregates for months.",
      ],
    },
    {
      kind: "region_note",
      region: "ap-south-1 (Mumbai)",
      paragraphs: [
        "Inter-AZ data transfer in Mumbai is commonly ~$0.01/GB. Collectors concentrated in one AZ while apps fan across others pay a steady network tax on every span batch until you co-locate ingestion with production.",
        "Prefer AZ-aware collector routing, DaemonSet/sidecar batching, or per-AZ collector pools so hot paths do not repeatedly cross AZ boundaries. At 10 GB/day span volume with 2 AZ hops, that is ~$6/mo extra -- negligible individually, compounding at 100 GB/day to ~$60/mo before the backend bill even starts.",
        "When the same VPC hosts egress-heavy telemetry, revisit NAT Gateway data-processing cost from the Lambda-to-ECS analysis: at 100 GB/day, cross-AZ egress before a collector fan-in can rival the indexing tier.",
      ],
    },
  ],
};
