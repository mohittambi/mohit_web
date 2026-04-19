import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook:
    "At ~1k RPS, one duplicate webhook is not a log line—it is a double-booked inventory row unless your idempotency story is mathematical, not aspirational.",
  strongVisual:
    "Electronics supply chain timeline: duplicate arrows into reservation service; green path only when unique index + outbox commit succeeds; red explosion on double ATP.",
  linkedInThread: [
    "Inbound webhooks are at-least-once. If your design sounds exactly-once, it is fiction.",
    "At ~1k RPS a duplicate is not a log line—it is a double-booked row unless idempotency is enforced in storage, not vibes.",
    "Dedupe: unique index on provider event id—or deterministic hash of canonical JSON after you strip volatile fields. Property-test collisions.",
    "Transactional outbox: business row + outbox row in one commit, then a dispatcher you can lag-SLO. Stripe retries for days—plan for it.",
    "DLQ needs an owner + replay runbook. Otherwise it is an incident incubator with good branding.",
    "OWASP webhook guidance (signature, replay): https://cheatsheetseries.owasp.org/cheatsheets/Webhooks_Security_Cheat_Sheet.html",
    `${blogPostUrl("idempotent-webhooks-outboxes-dlq")} — dedupe keys, outbox, DLQ, deterministic IDs.`,
    "Which duplicate webhook hurt you most in prod?",
  ],
  diagramBrief: {
    title: "Webhook + outbox + DLQ",
    elements: [
      "Duplicate POST arrows from vendor; first succeeds solid line, second hits unique constraint → same response idempotent.",
      "Deterministic ID box: canonical JSON → hash; collision test X vs stable id checkmark.",
      "Transactional box: business row + outbox row commit together; X on ‘ack before commit’ path.",
      "Worker pulls outbox; retry spiral with capped backoff; poison path to DLQ with alert bell.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Unique index on provider event id (or canonical hash); define response replay semantics.",
      "HMAC verify + replay window; redact payloads in logs by policy.",
      "DLQ owner + runbook stub before go-live.",
    ],
    month1: [
      "Outbox dispatcher with lag SLO; metrics on age and poison rate.",
      "Replay tooling with idempotent consumer contract tests.",
      "Chaos: duplicate delivery test in staging every release train.",
    ],
    scale: [
      "Shard dispatchers by tenant; hot webhook keys isolated.",
      "Compliance: immutable audit for money-adjacent events.",
      "Partner sandbox with signed test vectors to catch schema drift early.",
    ],
  },
  interview30Sec:
    "I assume at-least-once delivery. I use provider ids when they exist; otherwise I canonicalise payloads and hash for a deterministic dedupe key, with property tests for collisions. I commit outbox rows with business writes and run owned DLQs with replay tooling.",
  cto1Min:
    "Week one is durable dedupe, honest ack timing, and a documented canonicalisation function in CI. Month one is outbox lag SLOs, chaos duplicate tests, and replay tooling that preserves idempotency. At scale I shard dispatchers, isolate hot tenants, and treat vendor schema drift as versioned contracts with sandboxes—not surprises at 1k RPS.",
};
