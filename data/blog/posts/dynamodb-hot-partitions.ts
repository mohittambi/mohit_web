import type { BlogPost } from "../types";

const WRITE_SHARD_MERMAID = `graph TD
    A[100,000 RPS Ingress] --> B{Write Router}

    B -- "hash() % 150 = 0" --> C[Partition: EVENT#999.0]
    B -- "hash() % 150 = 1" --> D[Partition: EVENT#999.1]
    B -- "..." --> E[...]
    B -- "hash() % 150 = 149" --> F[Partition: EVENT#999.149]

    style C stroke:#E5E7EB,stroke-width:1px
    style D stroke:#E5E7EB,stroke-width:1px
    style F stroke:#E5E7EB,stroke-width:1px`;

const SHARD_FORMULA = `Shards = ceil( (Peak Writes Per Second / 1,000 WCU) × Safety Multiplier )`;

export const post: BlogPost = {
  slug: "dynamodb-hot-partitions",
  title: "DynamoDB Hot Partitions: Patterns That Actually Work Under Write Spikes",
  description:
    "Partition physics above marketing: per-partition ceilings, Adaptive Capacity limits, write-sharding math at 100k RPS, scatter-gather read tax in ap-south-1, burst vs Warm Throughput, and why DynamoDB-as-queue burns one GSI partition.",
  publishedAt: "2026-04-10",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["DynamoDB", "AWS", "Performance", "NoSQL", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "There is a terrifying moment in every Principal Engineer's career when the traffic goes vertical, the DynamoDB auto-scaling triggers, and the P99 latency still spikes to 5 seconds. You look at CloudWatch, and your consumed capacity is well below your provisioned table limit. Yet, `ProvisionedThroughputExceededException` errors are flooding your logs.",
    },
    {
      kind: "p",
      text: "Welcome to the **Hot Partition**.",
    },
    {
      kind: "p",
      text: "When building the real-time wallet reconciliation engine at A23, we routinely dealt with viral traffic spikes that concentrated 100,000+ requests per second (RPS) onto a handful of logical keys. In these scenarios, AWS marketing features like \"Adaptive Capacity\" will not save you. You cannot auto-scale your way out of physics.",
    },
    {
      kind: "p",
      text: "Here is the underlying math of DynamoDB partitions, why burst capacity is a trap, and the exact write-sharding patterns required to survive hyper-scale events.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "1. The Physics of the Partition Limit",
    },
    {
      kind: "p",
      text: "To understand a hot key, you must understand the physical hardware. DynamoDB is not a magical infinite hard drive; it is a fleet of SSD-backed storage nodes.",
    },
    {
      kind: "p",
      text: "Behind the scenes, AWS slices your table into physical partitions. Each physical partition has strict, unchangeable hardware limits:",
    },
    {
      kind: "ul",
      items: [
        "**Storage:** `10 GB` max",
        "**Read capacity:** `3,000 RCUs` max",
        "**Write capacity:** `1,000 WCUs` max",
      ],
    },
    {
      kind: "p",
      text: "If a viral supply chain event in your tracking system suddenly requires `5,000` writes per second to a single `EventID`, it doesn't matter if your table is provisioned for `100,000` WCUs. All `5,000` writes are hashing to the *same* physical partition. It hits the `1,000 WCU` ceiling and throttles.",
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The Adaptive Capacity Myth",
      text:
        "Adaptive Capacity is brilliant, but it is deeply misunderstood. It allows a partition to \"borrow\" unused throughput from other partitions. However, it *cannot* exceed the hard limit of `1,000 WCU` per physical partition. If your single item requires `1,001 WCU`, you will throttle. Period.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. Write Sharding: The 100k RPS Math",
    },
    {
      kind: "p",
      text: "When a single logical item exceeds `1,000 WCU`, you must distribute the load across multiple physical partitions. This is called **Write Sharding**.",
    },
    {
      kind: "p",
      text: "Instead of writing to `PK: EVENT#999`, you append a suffix: `PK: EVENT#999.1`, `PK: EVENT#999.2`, etc.",
    },
    {
      kind: "p",
      text: "How many shards do you need? You do not guess; you calculate.",
    },
    {
      kind: "code_block",
      language: "text",
      title: "The Partition Sharding Formula",
      code: SHARD_FORMULA,
    },
    {
      kind: "p",
      text: "**Example scenario**",
    },
    {
      kind: "ul",
      items: [
        "**Peak write target:** `100,000` RPS to a single global counter.",
        "**Base shards:** `100,000 / 1,000 = 100` shards.",
        "**Safety multiplier (1.5×):** `100 × 1.5 = 150` shards.",
      ],
    },
    {
      kind: "p",
      text: "Your partition key now becomes `EventID#ShardID` (where `ShardID` is a random number between `0` and `149`). The writes are now distributed across 150 physical SSDs.",
    },
    { kind: "mermaid", code: WRITE_SHARD_MERMAID },
    { kind: "hr" },
    {
      kind: "h2",
      text: "3. The Scatter-Gather Read Tax (ap-south-1)",
    },
    {
      kind: "p",
      text: "Architecture is just a series of economic tradeoffs. Write sharding perfectly solves the ingestion bottleneck, but it severely penalizes your reads.",
    },
    {
      kind: "p",
      text: "To get the \"Total State\" of `EVENT#999`, you can no longer do a single `GetItem` call. You must issue a `Query` (or parallel `GetItem`s) across all `150` shards and sum the results in your application layer. This is the **Scatter-Gather** pattern.",
    },
    {
      kind: "region_note",
      region: "ap-south-1 (Mumbai) — on-demand pricing anchor",
      paragraphs: [
        "**Write Request Units (WRU):** `$1.25 / million`",
        "**Read Request Units (RRU):** `$0.25 / million`",
        "If you shard into `150` pieces: your write cost remains identical (one write is still one write). Your read cost **increases by 150×** for a naive full aggregate because every \"view\" may need to read all 150 shards.",
        "If you have a read-heavy application, arbitrary random sharding will bankrupt you.",
      ],
    },
    {
      kind: "p",
      text: "**The Calculated Shard Solution.** Instead of appending `Math.random()`, append a deterministic attribute. If you are tracking user actions on an event, shard by the `UserID`: `PK: EVENT#999.<hash(UserID) % 150>`. This allows you to update the shard, and if a specific user asks for their status, you only have to read *their* shard — saving you `149` reads.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "4. Burst Capacity is a Buffer, Not a Plan",
    },
    {
      kind: "p",
      text: "AWS provides a 300-second (5-minute) \"burst bucket\" of capacity to handle sudden spikes while auto-scaling provisions more throughput.",
    },
    {
      kind: "p",
      text: "Many teams rely on this burst capacity as their primary scaling strategy. This is a fatal flaw.",
    },
    {
      kind: "p",
      text: "If your system experiences a massive spike (for example, a cron job that dumps data every hour), you will exhaust your burst bucket in seconds. Because DynamoDB auto-scaling can take up to 15 minutes to fully provision new capacity, you are left with 14 minutes of hard throttling.",
    },
    {
      kind: "system_alert",
      label: "The 2026 playbook: Warm Throughput",
      text:
        "Stop fighting the auto-scaler. If you have predictable, massive traffic spikes (like a scheduled sports event or a flash sale), use **Warm Throughput**. You explicitly tell AWS: \"I need 100,000 WCUs ready at exactly 2:00 PM.\" You pay a premium for the readiness, but you eliminate the 15-minute throttle storm entirely.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "5. The \"NoSQL Queue\" Anti-Pattern",
    },
    {
      kind: "p",
      text: "The most common cause of hot partitions I see in audits isn't a viral event; it is an architectural anti-pattern.",
    },
    {
      kind: "p",
      text: "Developers often use DynamoDB as a message queue. They write an item with `Status: PENDING`, and have a fleet of workers querying a Global Secondary Index (GSI) for `PENDING` items, processing them, and updating them to `Status: COMPLETED`.",
    },
    {
      kind: "ul",
      items: [
        "**The problem:** The GSI partition key is the literal string `PENDING`. Every single write, update, and read in your entire system is hitting one physical partition on the GSI.",
        "**The fix:** Stop using DynamoDB as a queue. Use SQS. If you *must* use DynamoDB, use DynamoDB Streams to trigger Lambda/ECS workers asynchronously based on the write event — bypassing the need for a status-based GSI entirely.",
      ],
    },
    {
      kind: "h2",
      text: "The Architect's Summary",
    },
    {
      kind: "ol",
      items: [
        "The `1,000 WCU` limit per partition is a law of physics. Respect it.",
        "Shard your writes when exceeding the limit, but use deterministic hashing to protect your read costs.",
        "Burst capacity is for unexpected anomalies, not scheduled cron jobs.",
        "If a single string (like `STATUS#ACTIVE`) is your partition key, your architecture is already broken.",
      ],
    },
  ],
};
