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
      text: "DynamoDB scales horizontally, but any single partition key still has throughput limits. Viral features, global counters, and “latest” feeds concentrate writes on a handful of keys and become incidents.",
    },
    {
      kind: "h2",
      text: "ABAC and multi-tenant access (Senseahead-style)",
    },
    {
      kind: "p",
      text: "For multi-tenant products such as **Senseahead**, partition keys and GSIs are only half the story—**who may touch which row** should follow **attribute-based access control (ABAC)** in IAM: principals carry tags (tenant id, org tier, environment) and DynamoDB fine-grained access control policies reference those attributes alongside resource tags on tables or indexes. That keeps “tenant A cannot read tenant B’s telemetry” from being a bespoke check in every Lambda. Pair ABAC with narrow application roles: the data plane still needs correct partition prefixes, but **authorization stays consistent** when you add new services or replay tools. Document which attributes are security-critical vs telemetry-only—ABAC sprawl is its own failure mode.",
    },
    {
      kind: "h2",
      text: "Write sharding with read discipline",
    },
    {
      kind: "p",
      text: "Append random suffixes or time buckets to partition keys for writes, then query with parallel Scatter-Gather or maintain a separate index of hot aggregates. Accept that read paths become more complex—optimise for the operation that must never fall over.",
    },
    {
      kind: "h2",
      text: "Streams and buffers",
    },
    {
      kind: "p",
      text: "For fan-out workloads, pair DynamoDB with SQS or Kinesis so spikes absorb before they hit the table’s partition limits. Use conditional writes and idempotency tokens so retries during throttling do not corrupt totals.",
    },
  ],
};
