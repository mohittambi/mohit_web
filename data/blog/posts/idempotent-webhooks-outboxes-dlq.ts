import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "idempotent-webhooks-outboxes-dlq",
  title: "Designing Idempotent Webhooks at Scale: Outboxes, Dedupe Keys, and DLQs",
  description:
    "Webhook receivers must survive duplicates, delays, and poison payloads. Patterns that work at high volume.",
  publishedAt: "2026-04-16",
  readTime: "10 min read",
  tags: ["Webhooks", "Reliability", "Messaging", "Postgres"],
  sections: [
    {
      kind: "p",
      text: "Providers retry. Networks reorder. Your handler will see the same logical event more than once. Idempotency is not a header decoration—it is a durable record of what you have already accepted and what side effects you have already committed.",
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
      text: "When upstream omits a stable id, derive one deterministically: canonicalise JSON (sorted keys, normalised numbers, strip volatile fields like received_at or trace ids that differ per delivery), then hash with a standard algorithm (for example SHA-256) and prefix with a namespace. Collisions mean your canonicalisation lied—replay historical payloads through the function in CI and assert id stability. Two different business events must never collapse to the same key; two retries of the same event must always collapse to the same key.",
    },
    {
      kind: "ul",
      items: [
        "Property tests: same logical payload, different key order → same id.",
        "Negative tests: same shape but different business meaning → different id.",
        "Document what you exclude from the hash and why (timestamps, request ids).",
      ],
    },
    {
      kind: "h2",
      text: "Transactional outbox for your own side effects",
    },
    {
      kind: "p",
      text: "If accepting a webhook must enqueue downstream work, write the dedupe row and the outbox message in one database transaction. A separate dispatcher reads the outbox and publishes to your bus or queue. That way you never acknowledge to the provider until you have a durable plan for processing.",
    },
    {
      kind: "h2",
      text: "DLQs with intent",
    },
    {
      kind: "p",
      text: "Dead-letter queues are where optimism goes to die—give them dashboards, owner runbooks, and replay tooling that preserves ordering constraints where they matter. Poison messages should fail closed: alert, sample payloads safely, and cap retries so a bad vendor does not starve the fleet.",
    },
  ],
};
