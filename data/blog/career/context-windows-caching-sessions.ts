import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "The context window is RAM, not Postgres—if you treat it as durable state, you will lose audits and users.",
  strongVisual:
    "Two devices same user: diverging transcripts vs single versioned fact store feeding both sessions.",
  linkedInThread: [
    "The context window is RAM, not Postgres—switch devices or an audit timeline and transcript-only “memory” collapses.",
    "Externalise durable facts with schema + TTL; inject pointers and short validated summaries into the prompt.",
    "When median tokens climb past ~8k–15k, summarisation cadence should step up—cost and latency are non-linear.",
    "Silent truncation without copy is trust arson—tell users when you trimmed depth.",
    "OpenAI context length / tokens (ground rules for limits): https://platform.openai.com/docs/guides/conversation-state",
    `${blogPostUrl("context-windows-caching-sessions")} — caching, summarisation, retention outside the model.`,
    "What broke your ‘infinite context’ illusion in prod?",
  ],
  diagramBrief: {
    title: "Session truth outside the model",
    elements: [
      "Model bubble “context” with short TTL; durable store with versioned rows solid.",
      "Invalidation arrows from policy update event to summary regen job.",
      "Mobile + web clients reading same store—X on ‘transcript only’ path.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Schema for durable user/org facts; prompt injection only references IDs.",
      "Summary job with validator for numeric/policy fields.",
      "UX copy for truncation and summarisation triggers.",
    ],
    month1: [
      "Cross-device session continuity tests; audit export for support.",
      "Feature flags for summarisation aggressiveness per tier.",
      "Metrics: transcript tokens, cache hit, summary regen errors.",
    ],
    scale: [
      "Geo-replicated store with consistency model spelled out.",
      "Backpressure on summarisation queue; SLO on freshness per tier.",
      "Compliance review for retention vs training data policies.",
    ],
  },
  interview30Sec:
    "I store durable facts outside the model, use versioned summaries with validation for sensitive fields, and TTL session blobs. I expose when context is trimmed so users are not gaslit by silent cutoffs.",
  cto1Min:
    "Week one I split prompt ephemeral state from durable store with clear UX. Month one I add cross-device tests, audit exports, and tiered summarisation policies. At scale I treat geo-replication and compliance as first-class—not bolted on after a regulator asks.",
};
