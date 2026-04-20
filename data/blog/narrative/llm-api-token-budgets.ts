import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: internal supply chain extraction agent; infinite retry loop over a weekend; a path that usually cost ~$50/day spiked to ~$1,200 by Monday.",
    broke:
      "Default model was a frontier Opus-class SKU for a trivial JSON formatting path; finance saw a line item, not a feature or tenant — no way to answer 'what changed.'",
    wrong_first:
      "We almost hard-capped tokens per user per day as a panic move -- that would have spiked support volume; the real fix was routing + attribution, not a blind ceiling.",
    solution:
      "Per-feature, per-tenant, per-workflow tags on every call; dashboards mirrored to finance dimensions; routing table for cheap vs premium models.",
    tradeoff:
      "We accepted ~8 - 12% more engineering time per feature for instrumentation -- cheaper than another invoice panic.",
  },
  whatNot: [
    "I would not hide degradation from power users without copy that explains why depth was trimmed -- silent truncation is trust arson.",
    "I would not attribute cost only at the OpenAI/AWS bill level -- product surfaces must own their marginal token rate.",
  ],
  numbers: [
    "Attribution granularity: 3 - 6 dimensions per call is usually enough; beyond ~12 tags you mostly create cardinality debt.",
    "Soft cap → hard cap: we used ~80% soft warning in-session before hard stop for unpaid tiers.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "context-windows-caching-sessions", title: postTitleBySlug["context-windows-caching-sessions"], why: "Cost follows context length and retention choices." },
    { slug: "prompt-engineering-for-engineers", title: postTitleBySlug["prompt-engineering-for-engineers"], why: "Routing and budgets need stable prompt contracts." },
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "Retrieval and rerank layers dominate token burn in many assistants." },
  ],
};
