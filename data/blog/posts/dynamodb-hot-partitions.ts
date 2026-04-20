import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "dynamodb-hot-partitions",
  title: "DynamoDB Hot Partitions: Patterns That Actually Work Under Write Spikes",
  description:
    "Skewed keys, burst capacity, and design patterns that spread load without giving up query patterns you need.",
  publishedAt: "2026-04-10",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["DynamoDB", "AWS", "Performance", "NoSQL", "IAM", "ABAC"],
  sections: [
    {
      kind: "p",
      text: "DynamoDB scales horizontally, but any single partition key still has throughput limits. Viral features, global counters, and 'latest' feeds concentrate writes on a handful of keys and become incidents.",
    },
    {
      kind: "h2",
      text: "The hard limits: adaptive capacity does not repeal physics",
    },
    {
      kind: "p",
      text: "Adaptive capacity borrows unused throughput from elsewhere in the table -- it does not let one logical item absorb 100k writes/sec if those writes hash to one partition. The per-partition ceiling is fixed; adaptive behaviour redistributes slack across partitions, not within one.",
    },
    {
      kind: "cost_table",
      title: "Per-partition throughput limits (verify against current AWS docs at publish)",
      headers: ["Dimension", "Typical teaching limit", "What it means"],
      rows: [
        ["Read", "~3,000 RCU/s equivalent", "On-demand uses RRU; provisioned uses RCU"],
        ["Write", "~1,000 WCU/s equivalent", "Small item (~400B) = 1 WCU; larger = more"],
        ["Storage", "~10 GB per partition", "Split on size, but splits do not multiply writes to one key"],
      ],
      note: "These are teaching model limits -- link to official AWS docs and add 'as of <date>' at publish. Adaptive capacity does not override per-partition ceilings.",
    },
    {
      kind: "h2",
      text: "Sharding math: cooling factor for peak writes",
    },
    {
      kind: "p",
      text: "Spread peak writes across enough physical partitions so each stays under the per-partition write ceiling. Use calculated sharding (hash(userId) % N with stable N) when the read pattern allows targeted gather; use random sharding only when reads can tolerate scatter-gather across all shards.",
    },
    {
      kind: "cost_note",
      label: "FinOps note -- sharding math and Mumbai pricing",
      paragraphs: [
        "**Sharding calculation (illustrative):** 100,000 writes/sec on one logical entity at 1,000 WCU/s per partition ceiling -> base 100 shards x 1.5x safety = 150 shards. Key shape: `EVENT#<id>#SHARD#<0..149>`. This is pedagogical -- map your actual item size, transactional writes, and GSI projections into effective WCUs first.",
        "**Mumbai on-demand pricing (ap-south-1, authoring):** $1.25 / million WRUs, $0.25 / million RRUs, $0.10 / GB-month (Standard-IA). Provisioned: ~$0.00065 / WCU-hour, ~$0.00013 / RCU-hour (verify on AWS pricing page).",
        "**Scatter-gather read tax:** if writes fan to 150 shards but 'total count' needs all shards, naive aggregate reads can grow 150x in RRUs vs a single-hot-key fantasy. On-demand at $0.25/M RRU: 150 shards x 1 RRU each per aggregate = 150 RRUs/aggregate. At 1M aggregates/month: ~$0.04/mo (trivial) -- but at 100M aggregates it is ~$3.75/mo and worth a dedicated counter table.",
      ],
      formula: "shards = ceil((peak_writes_per_sec / partition_write_ceiling) * safety_multiplier)\nmonthly_wru_cost = (monthly_writes / 1_000_000) * 1.25\nprovisioned_wcu_hourly = provisioned_wcu * 0.00065",
    },
    {
      kind: "h2",
      text: "ABAC and multi-tenant access (Senseahead-style)",
    },
    {
      kind: "p",
      text: "For multi-tenant products such as **Senseahead**, partition keys and GSIs are only half the story -- **who may touch which row** should follow **attribute-based access control (ABAC)** in IAM: principals carry tags (tenant id, org tier, environment) and DynamoDB fine-grained access control policies reference those attributes alongside resource tags on tables or indexes. That keeps 'tenant A cannot read tenant B's telemetry' from being a bespoke check in every Lambda. Pair ABAC with narrow application roles: the data plane still needs correct partition prefixes, but **authorization stays consistent** when you add new services or replay tools. Document which attributes are security-critical vs telemetry-only -- ABAC sprawl is its own failure mode.",
    },
    {
      kind: "h2",
      text: "Write sharding with read discipline",
    },
    {
      kind: "p",
      text: "Append random suffixes or time buckets to partition keys for writes, then query with parallel Scatter-Gather or maintain a separate index of hot aggregates. Accept that read paths become more complex -- optimise for the operation that must never fall over.",
    },
    {
      kind: "h2",
      text: "Streams and buffers",
    },
    {
      kind: "p",
      text: "For fan-out workloads, pair DynamoDB with SQS or Kinesis so spikes absorb before they hit the table's partition limits. Use conditional writes and idempotency tokens so retries during throttling do not corrupt totals.",
    },
    {
      kind: "cost_table",
      title: "DynamoDB pricing -- ap-south-1 on-demand vs provisioned (April 2026 authoring)",
      headers: ["Metric", "On-demand (Mumbai)", "Provisioned (Mumbai)"],
      rows: [
        ["Write", "$1.25 / million WRUs", "$0.00065 / WCU-hour"],
        ["Read", "$0.25 / million RRUs", "$0.00013 / RCU-hour"],
        ["Storage Standard-IA", "$0.10 / GB-month", "$0.10 / GB-month"],
        ["Over-provisioned WCU cost (10k WCU)", "--", "$0.00065 x 10,000 x 720h = ~$46.80/mo"],
        ["Sharded + 1k WCU (same volume)", "--", "$0.00065 x 1,000 x 720h = ~$4.68/mo"],
      ],
      note: "10x write cost difference between over-provisioning to absorb heat vs sharding + right-sizing. Warm Throughput feature (verify product name and pricing in AWS console) lets you declare expected spike shape in advance -- model the premium against throttle risk and customer-visible errors.",
    },
  ],
};
