import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: electronics supply chain app; inbound vendor webhooks ~1k RPS peak; inventory and reservation rows on Postgres; finance watches ATP like a hawk.",
    broke:
      "A duplicate event at sustained high RPS threatened to double-book component inventory—two workers saw “available” before either commit landed. Retries amplified it; the incident started as “webhook lag” and almost ended as a stockout promise.",
    wrong_first:
      "We tried optimistic “SELECT … FOR UPDATE then insert” without a stable natural key—under concurrency the second transaction still slipped through on a different code path.",
    solution:
      "Provider event id in a unique index when present; otherwise deterministic id generation from a canonical JSON payload (sorted keys, normalised numbers, stripped volatile fields) hashed with SHA-256, collision tested on replay fixtures. Same-transaction outbox + replay-safe handlers.",
    tradeoff:
      "We accepted slower ack latency and a longer canonicalisation function in the hot path versus a fast ack that would have made us liars to vendors and heroes to lawyers.",
  },
  whatNot: [
    "I would not ack a webhook before the business write is durable—optimistic UX for vendors is pessimistic UX for finance.",
    "I would not run a DLQ without a named owner and weekly replay SLO; DLQs are not trash folders, they are incident incubators.",
    "I would not derive dedupe keys from raw JSON string equality—whitespace, field order, and numeric formatting will create collisions or false duplicates unless you canonicalise.",
  ],
  numbers: [
    "Retry storms: one bad deploy spiked handler errors to ~18% for ~25 min; without dedupe caps we would have multiplied side effects by 4–7× on hot keys.",
    "Outbox dispatcher lag: we alert when p95 lag exceeds ~30s for money paths—beyond that, reconciliation queues drown support.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "event-driven-sagas-recovery", title: postTitleBySlug["event-driven-sagas-recovery"], why: "Webhooks are often the edge of a longer saga—partial failure is normal." },
    { slug: "dynamodb-hot-partitions", title: postTitleBySlug["dynamodb-hot-partitions"], why: "Dedupe stores and counters become hot partitions fast." },
    { slug: "opentelemetry-sampling-cost", title: postTitleBySlug["opentelemetry-sampling-cost"], why: "You need traces that correlate webhook id → saga id without sampling them away." },
  ],
};
