import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: multi-hour support copilots; sessions 30 - 90 min common; mobile + web.",
    broke:
      "Users saw contradictory answers after mid-session policy updates; transcript-only memory meant no durable audit of what the model 'knew' at T0.",
    wrong_first:
      "We stuffed full thread + PDF excerpts into every turn -- >40k tokens on bad paths; latency and cost exploded; model lost thread of tool results.",
    solution:
      "External state store with versioned facts, rolling summary with validator pass, TTL ~24h with explicit refresh on policy version bump.",
    tradeoff:
      "We accepted more application code and occasional summary repair jobs versus the fantasy of infinite context as database.",
  },
  whatNot: [
    "I would not treat the context window as durable storage -- ever. If Postgres is not in the loop, you do not have a system of record.",
    "I would not ship rolling summaries without a second pass that checks constraints (dates, balances, policy ids) when those fields exist.",
  ],
  numbers: [
    "Sessions: when median transcript tokens cross ~8k - 15k, summarisation frequency should increase non-linearly -- our elbow was around ~12k.",
    "Cache hit ratio for retrieved docs: below ~40% on repeat questions usually meant we were not externalising user-specific facts.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "llm-api-token-budgets", title: postTitleBySlug["llm-api-token-budgets"], why: "Long sessions are a billing and fairness problem, not just UX." },
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "What you cache and retrieve must match what you inject into context." },
    { slug: "batch-vs-streaming-embeddings", title: postTitleBySlug["batch-vs-streaming-embeddings"], why: "Background summarisation/embed refresh is a pipeline problem." },
  ],
};
