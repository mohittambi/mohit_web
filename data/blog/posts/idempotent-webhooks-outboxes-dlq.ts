import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "idempotent-webhooks-outboxes-dlq",
  title: "Designing Idempotent Webhooks at Scale: Outboxes, Dedupe Keys, and DLQs",
  description:
    "Webhook receivers must survive duplicates, delays, and poison payloads. Patterns that work at high volume.",
  publishedAt: "2026-04-16",
  readTime: "10 min read",
  difficulty: "Intermediate",
  tags: ["Webhooks", "Reliability", "Messaging", "Postgres"],
  sections: [
    {
      kind: "p",
      text: "Providers retry. Networks reorder. Your handler will see the same logical event more than once. Idempotency is not a header decoration -- it is a durable record of what you have already accepted and what side effects you have already committed.",
    },
    {
      kind: "h2",
      text: "Dedupe keys and natural keys",
    },
    {
      kind: "p",
      text: "Prefer a provider-supplied event id when it is stable and unique. When it is not, hash a canonical subset of the payload fields that define business identity. Store the key in a unique index so the second insert fails fast and returns the same response shape as the first success.",
    },
    {
      kind: "h2",
      text: "Deterministic ID generation (no vendor key)",
    },
    {
      kind: "p",
      text: "When upstream omits a stable id, derive one deterministically: canonicalise JSON (sorted keys, normalised numbers, strip volatile fields like received_at or trace ids that differ per delivery), then hash with a standard algorithm (SHA-256) and prefix with a namespace. Two different business events must never collapse to the same key; two retries of the same event must always collapse to the same key.",
    },
    {
      kind: "ul",
      items: [
        "Property tests: same logical payload, different key order -- same id.",
        "Negative tests: same shape but different business meaning -- different id.",
        "Document what you exclude from the hash and why (timestamps, request ids).",
      ],
    },
    {
      kind: "h2",
      text: "Three patterns and their DynamoDB bill",
    },
    {
      kind: "p",
      text: "In **ap-south-1**, DynamoDB is often the heartbeat of ingestion paths. The 'right' pattern is not only correctness -- it is **cost of correctness** under at-least-once delivery. Here is what three common patterns actually cost at 10M events/month.",
    },
    {
      kind: "cost_table",
      title: "DynamoDB rates -- ap-south-1, on-demand Standard table (April 2026)",
      headers: ["Component", "Standard", "Standard-IA"],
      rows: [
        ["Writes (per million WRU)", "$1.25", "$1.56"],
        ["Reads (per million RRU)", "$0.25", "$0.31"],
        ["Storage (GB-month)", "$0.25", "$0.10"],
        ["Streams reads (per 100k)", "$0.02", "$0.02"],
      ],
      note: "Standard-IA lowers storage cost but raises per-request cost. Use it for cold dedupe indexes or long-retention poison-message archives -- not hot replay paths.",
    },
    {
      kind: "prompt_example",
      title: "Pattern A vs B vs C -- 10M events/month cost comparison",
      after: {
        label: "Cost breakdown (ap-south-1 on-demand)",
        language: "plaintext",
        code: `Pattern A: Conditioned UpdateItem (single write, ConditionExpression)
  Writes:  10M x $1.25/M  = $12.50/mo
  Risk:    if function crashes after DB write but before side effect,
           you look "idempotent" but lost the downstream work.

Pattern B: TransactWriteItems (business row + outbox row, atomic)
  Writes:  2x tax -> 10M x $2.50/M = $25.00/mo
  Storage: more rows retained until dispatcher processes them
  Benefit: atomic failure mode -- either both commit or neither does.

Pattern C: Conditioned Put + DynamoDB Streams as outbox
  Writes:  10M x $1.25/M  = $12.50/mo  (1x, no transaction)
  Streams: 10M / 100k x $0.02 = $2.00/mo
  TTL:     $0 write charge for TTL-driven deletion (async, see below)
  Total:   ~$14.50/mo  -- roughly half the write bill of Pattern B

Rule of thumb:
  Pattern B when you need atomic failure semantics the product accepts.
  Pattern C when stream consumer can tolerate at-least-once + TTL lag.
  Pattern A only for stateless lookup paths, never for side-effect work.`,
      },
      note: "GSI write amplification is not included -- each GSI on the outbox table adds write units proportional to items written. Model GSIs explicitly before committing to a table design.",
    },
    {
      kind: "h2",
      text: "Transactional outbox for your own side effects",
    },
    {
      kind: "p",
      text: "If accepting a webhook must enqueue downstream work, write the dedupe row and the outbox message in one database transaction (Pattern B). A separate dispatcher reads the outbox and publishes to your bus or queue. That way you never acknowledge to the provider until you have a durable plan for processing. The 2x write cost is the price of that guarantee -- make the tradeoff explicit when you choose.",
    },
    {
      kind: "h2",
      text: "Streams + TTL as a lightweight outbox",
    },
    {
      kind: "p",
      text: "Pattern C treats the DynamoDB record itself as the outbox: a conditioned Put sets the idempotency key with a TTL, and Streams (`NEW_IMAGE`) drives the consumer. TTL deletions carry no write-unit charge in the way manual deletes do, which makes key cleanup operationally free -- until it is not.",
    },
    {
      kind: "what_not",
      paragraphs: [
        "**Assume TTL is millisecond-precise.** Expiry is asynchronous; items persist hours after their TTL timestamp. Design replay and downstream timeouts assuming lag, not instant removal.",
        "**Forget Streams are at-least-once.** Consumers must stay idempotent and tolerate duplicate stream records -- the stream removes the manual delete cost, not the ops discipline.",
        "**Ignore ordering.** Streams guarantee per-partition order, not global order. Parallel Lambda consumers and fan-out patterns complicate 'exactly once side effect' assumptions.",
        "**Skip the consumer DLQ.** Iterator age, batch failures, partial batch responses, and DLQ on the stream consumer still belong in the design -- Streams do not eliminate all operational tax.",
      ],
    },
    {
      kind: "h2",
      text: "Storage tax on idempotency keys",
    },
    {
      kind: "p",
      text: "10M keys at ~100 B each is roughly 1 GB-month of new footprint, costing ~$0.25/mo on Standard storage. Benign at this scale. At 100M+ events, GB-month and GSI projection become architecture review items. Use **Standard-IA** when the dedupe store is append-mostly and read rarely -- IA's lower $/GB dominates savings as long as you are not running hot replay against it.",
    },
    {
      kind: "h2",
      text: "DLQs with intent",
    },
    {
      kind: "p",
      text: "Dead-letter queues are where optimism goes to die -- give them dashboards, owner runbooks, and replay tooling that preserves ordering constraints where they matter. Poison messages should fail closed: alert, sample payloads safely, and cap retries so a bad vendor does not starve the fleet.",
    },
    {
      kind: "ul",
      items: [
        "Store long-lived poison message samples in **Standard-IA** -- read cost is higher, but storage cost is 60% lower, and you only read them during incidents.",
        "Replay runbook should specify: who owns it, which ordering constraints apply, and what 'done' looks like (idempotent so safe to replay twice).",
        "Alert on DLQ depth, not just queue age -- depth catches silent accumulation before it becomes an incident.",
      ],
    },
    {
      kind: "cost_note",
      label: "FinOps note -- dedupe key storage",
      paragraphs: [
        "**10M keys x ~100 B = ~1 GB-month** of DynamoDB footprint at $0.25/mo (Standard). Negligible until 100M+ events/month when it becomes a design input.",
        "**Delete vs TTL:** each explicit `DeleteItem` consumes write request units ($1.25/M). TTL-driven removal does not. At 10M events/month with 7-day retention, that is 10M potential deletes avoided -- **$12.50/mo in write cost** that Pattern C recovers vs manual cleanup.",
        "**Standard-IA for cold archives:** poison-message stores and long-retention dedupe indexes read rarely. IA cuts storage from $0.25/GB to $0.10/GB -- a 60% saving on storage with a 24% higher read cost. Run the numbers against your actual read pattern before switching.",
      ],
      formula: "monthly_key_storage_gb = (event_count * avg_key_bytes_with_overhead) / 1_073_741_824\nmonthly_storage_cost = monthly_key_storage_gb * 0.25\nttl_write_savings = event_count * (1 / 1_000_000) * 1.25",
    },
    {
      kind: "region_note",
      region: "ap-south-1 (Mumbai)",
      paragraphs: [
        "DynamoDB on-demand write rates in Mumbai ($1.25/M WRU) match us-east-1. The cost war between Pattern B and C plays out identically across regions -- the $12.50/mo spread at 10M events is universal.",
        "Where Mumbai diverges: **data transfer out** and **NAT Gateway** costs on the Lambda consumer side. If your stream processor runs in a VPC, model NAT data-processing ($0.045/GB) for high-volume Streams reads -- at 10M events with 1 KB payloads, that is ~10 GB of stream data, or ~$0.45/mo. At 100M events it is ~$4.50/mo and worth a VPC endpoint.",
      ],
    },
  ],
};
