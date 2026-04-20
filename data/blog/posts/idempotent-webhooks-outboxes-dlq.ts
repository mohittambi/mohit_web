import type { BlogPost } from "../types";

const OUTBOX_MERMAID = `graph TD
    A[External Provider] -- "POST /webhook" --> B[API Gateway]
    B --> C[Ingress Lambda / ECS]

    C -- "1. Condition: attribute_not_exists" --> D[(DynamoDB Ingress Table)]
    C -- "2. Return 200 OK" --> A

    D -- "3. DynamoDB Streams" --> E[SQS FIFO Queue]
    E --> F[Async Worker Fleet]
    F --> G[(Core Ledger / Supply Chain DB)]`;

const WEBHOOK_AUTH_SNIPPET = `import crypto from 'crypto';

export function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}`;

export const post: BlogPost = {
  slug: "idempotent-webhooks-outboxes-dlq",
  title: "Designing Idempotent Webhooks at Scale: Outboxes, Dedupe Keys, and DLQs",
  description:
    "At-least-once reality, read-then-write races, DynamoDB transaction tax vs conditioned PutItem in ap-south-1, transactional outbox with Streams → SQS FIFO, poison pills and DLQs with redrive, and HMAC verification with timing-safe comparison.",
  publishedAt: "2026-04-16",
  readTime: "10 min read",
  difficulty: "Intermediate",
  tags: ["Webhooks", "Reliability", "Messaging", "Postgres", "AWS", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "Your payment gateway sends a `payment_success` webhook. Your server processes it, updates the ledger, but experiences a 200ms network blip while sending the `200 OK` acknowledgment back. Assuming the delivery failed, the gateway retries the webhook 5 seconds later. If your architecture is naive, you just credited the user's wallet twice for a single transaction. At A23, doing this at the scale of 7M+ users isn't a \"bug\"—it is a catastrophic financial incident.",
    },
    {
      kind: "p",
      text: "In distributed systems, **exactly-once delivery is a mathematical myth.** Network physics only guarantees at-least-once or at-most-once delivery. If you are building reliable systems, you must assume every webhook will be delivered multiple times, out of order, or malformed.",
    },
    {
      kind: "p",
      text: "Here is the 2026 blueprint for building webhook receivers that survive hostile network environments, complete with the database economics of enforcing idempotency at scale.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '1. The Idempotency Key & The "Transaction Tax"',
    },
    {
      kind: "p",
      text: "Idempotency means that no matter how many times you apply an operation, the result remains the same beyond the first application.",
    },
    {
      kind: "p",
      text: 'The most common mistake engineers make is the "Read-then-Write" anti-pattern:',
    },
    {
      kind: "ol",
      items: [
        "`SELECT * FROM events WHERE webhook_id = '123'`",
        "If it exists, return `200 OK`.",
        "If it doesn't, process the business logic and `INSERT`.",
      ],
    },
    {
      kind: "p",
      text: "Under high concurrency, two identical webhooks arriving milliseconds apart will both pass the `SELECT` check before either performs the `INSERT`. You still double-process.",
    },
    {
      kind: "p",
      text: "**The Database Constraint.** You must push the concurrency lock down to the database layer.",
    },
    {
      kind: "ul",
      items: [
        "**In PostgreSQL:** Use a unique constraint on the webhook ID and use `INSERT ... ON CONFLICT DO NOTHING`.",
        "**In DynamoDB:** Use a `ConditionExpression` like `attribute_not_exists(WebhookID)`.",
      ],
    },
    {
      kind: "region_note",
      region: "ap-south-1 — The Economic Tax",
      paragraphs: [
        "In DynamoDB, enforcing idempotency isn't free. If you use `TransactWriteItems` to guarantee a webhook record is saved *only* if the idempotency key doesn't exist, AWS charges you a **2× Write Penalty**. A standard write costs `1 WRU`. A transactional write costs `2 WRUs`.",
        "If you process 10 million webhooks a month, that \"Transaction Tax\" doubles your ingestion bill.",
      ],
    },
    {
      kind: "system_alert",
      label: "Principal's Fix — avoid the 2× penalty",
      text:
        "Use a single-table design where the `WebhookID` is the literal partition key. A standard `PutItem` with a `ConditionExpression` only costs `1 WRU`, avoiding the 2× transaction penalty while maintaining atomic safety for the dedupe insert.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. Decoupling Ingress: The Outbox Pattern",
    },
    {
      kind: "p",
      text: "External providers (like Stripe, Razorpay, or ShipRocket) have strict timeout windows—usually 3 to 5 seconds. If you don't reply with a `200 OK` in that window, they consider it a failure and trigger a retry storm.",
    },
    {
      kind: "p",
      text: "You cannot run complex supply chain AI extractions or multi-table ledger updates within a 3-second ingress window.",
    },
    {
      kind: "p",
      text: "**The Rule:** The webhook receiver's only job is to save the raw payload to disk and return `200 OK`. This is the **Transactional Outbox Pattern**:",
    },
    { kind: "mermaid", code: OUTBOX_MERMAID },
    {
      kind: "ol",
      items: [
        "**Ingest & Dedupe:** The receiver attempts to write the raw JSON payload to DynamoDB with the idempotency condition. If it fails (duplicate), it still returns `200 OK` to the provider.",
        "**Stream:** DynamoDB Streams captures the successful, deduplicated insert.",
        "**Queue:** The stream pushes the payload to an SQS FIFO queue for ordered processing.",
        "**Process Async:** Your core workers process the payload safely, immune to ingress timeouts.",
      ],
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '3. Dead Letter Queues (DLQs) and the "Poison Pill"',
    },
    {
      kind: "p",
      text: "What happens if the webhook payload is structurally valid JSON, but functionally broken? (For example, a supplier's API sends a `price` as a string `\"TBD\"` instead of an integer.)",
    },
    {
      kind: "p",
      text: "If your async worker tries to process it, it will crash. SQS will retry. It will crash again. This is a **Poison Pill**, and it blocks your entire FIFO queue from processing subsequent, healthy webhooks.",
    },
    {
      kind: "p",
      text: "**The Redrive Architecture.** Every webhook queue must have a Dead Letter Queue (DLQ).",
    },
    {
      kind: "ol",
      items: [
        "Set the SQS `maxReceiveCount` to `3`.",
        "If the worker fails to process the payload 3 times, SQS automatically routes the poison pill to the DLQ.",
        "Your primary queue continues processing fresh webhooks seamlessly.",
      ],
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The Silent DLQ Anti-Pattern",
      text:
        "A DLQ is useless if no one monitors it. At i2b, every message that lands in a DLQ fires a PagerDuty alert and is mirrored to a Slack `#alerts-webhooks` channel. We use an automated \"Redrive API\" so that once we patch the parser bug, we can push the failed payloads from the DLQ back into the primary queue with a single command.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "4. The Verification Middleware",
    },
    {
      kind: "p",
      text: "Never trust the payload. Webhook endpoints are public APIs. Attackers will barrage your endpoint with fake payloads to manipulate your database.",
    },
    {
      kind: "p",
      text: "You must verify the cryptographic signature sent in the headers (usually HMAC SHA-256).",
    },
    {
      kind: "code_block",
      language: "typescript",
      title: "middleware/webhook-auth.ts",
      code: WEBHOOK_AUTH_SNIPPET,
    },
    {
      kind: "p",
      text: "**The Webhook Readiness Checklist.** If you are deploying a webhook receiver to production tomorrow, ensure you have:",
    },
    {
      kind: "ol",
      items: [
        "**Raw Body Caching:** If you parse the JSON before verifying the HMAC signature, the signature will fail. You must verify against the *raw* byte buffer.",
        "**Atomic Idempotency:** A database-level unique constraint or conditional expression on `provider_event_id`.",
        "**Timeout Decoupling:** Business logic pushed to an async queue behind the receiver.",
        "**DLQ Alarms:** An active CloudWatch alarm on `ApproximateNumberOfMessagesVisible > 0` for your Dead Letter Queue.",
      ],
    },
  ],
};
