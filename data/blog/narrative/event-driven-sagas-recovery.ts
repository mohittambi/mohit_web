import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite (A23-shaped): tournament buy-in across Wallet, Tournament Engine, Notification; deduct succeeded but seat allocation failed mid-flight.",
    broke:
      "Manual SQL refunds at 2 AM and angry users who paid but had no seat until ops reconciled; choreography-style failure chains were impossible to replay cleanly.",
    wrong_first:
      "We added more synchronous 'verify' calls between steps -- p99 latency +~400ms, still did not fix partial states under duplicate events.",
    solution:
      "Orchestrator with explicit state machine; idempotent compensators; human break-glass with audit; deadlines per state with escalation.",
    tradeoff:
      "We accepted orchestrator availability as critical path -- we invested HA and drill games, not choreography purity.",
  },
  whatNot: [
    "I would not pretend choreography is simpler because boxes on a diagram are fewer -- debuggability is the hidden cost.",
    "I would not ship compensations without idempotency keys -- you will double-refund under retries.",
  ],
  numbers: [
    "Stuck saga alert threshold: >~0.5% of in-flight sagas older than SLA for >10 min was our early warning before user-visible backlog.",
    "Human intervention rate after playbook: ~40% down month one -- most was missing timeout transitions, not exotic bugs.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "idempotent-webhooks-outboxes-dlq", title: postTitleBySlug["idempotent-webhooks-outboxes-dlq"], why: "Sagas often start at the edge with at-least-once events." },
    { slug: "dynamodb-hot-partitions", title: postTitleBySlug["dynamodb-hot-partitions"], why: "Saga state rows and outboxes concentrate on few keys." },
    { slug: "idp-without-boiling-ocean", title: postTitleBySlug["idp-without-boiling-ocean"], why: "Golden paths for 'standard saga' reduce bespoke YAML per team." },
  ],
};
