import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: payment-adjacent API on Lambda behind API Gateway; sustained ~1.8k RPS bursts during business hours; strict p99 SLO; OTel extension + small custom sidecar for mTLS.",
    broke:
      "The 2:00 AM page was finance + latency: provisioned concurrency could not spin up fast enough for a traffic spike, p99 went from ~120ms to ~650 - 900ms, and the monthly line item for PC + NAT-heavy VPC paths looked like a luxury car lease -- not because Lambda is evil, but because our shape was wrong.",
    wrong_first:
      "We bought more PC units and debated 'pre-warm schedules' instead of admitting observability agents and connection churn were eating the budget and the tail.",
    solution:
      "Strangled hot routes to ECS Fargate: sidecars and agents share task CPU/RAM (observability tax folded into task economics), stable ENI per task, autoscaling on steady RPS. Kept Lambda for bursty admin paths.",
    tradeoff:
      "We traded always-on Fargate minutes and slower cold deploy ergonomics for predictable tails and a lower observability marginal tax on those paths.",
  },
  whatNot: [
    "I would not default to ECS because 'Lambda feels cheap until it isn't' -- that is finance theatre. Decide on latency distribution, connection model, and team operational skill.",
    "I would not migrate without a one-click traffic rollback; if API Gateway or ALB cannot send traffic back to Lambda in minutes, you are optimising for heroics.",
    "I would not ignore observability tax: on Lambda, extensions and agents bill as runtime; on ECS they are 'free' only in the sense that they share the task envelope -- still capacity planning, but not per-invocation micro-billing surprises.",
  ],
  numbers: [
    "Bursts in the 1 - 3k RPS range per logical service are where Lambda concurrency and VPC cold paths show teeth; sub-200 RPS steady workloads often stay boring on Lambda.",
    "Provisioned concurrency is priced for eliminating cold starts on known paths -- if you need it on more than half your functions, question packaging and architecture first.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "RAG and retrieval spikes often sit next to compute tail decisions." },
    { slug: "dynamodb-hot-partitions", title: postTitleBySlug["dynamodb-hot-partitions"], why: "After compute moves, hot keys and dedupe tables still need a scale story." },
    { slug: "idempotent-webhooks-outboxes-dlq", title: postTitleBySlug["idempotent-webhooks-outboxes-dlq"], why: "Money paths and webhooks are the next sharp edge after API migration." },
  ],
};
