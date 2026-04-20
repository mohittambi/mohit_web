import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: multi-tenant SaaS assistant; ~35% MoM token growth with flat MAU -- classic 'feature creep inside the prompt.'",
    broke:
      "Finance escalated when one tenant tier burned ~18× median tokens; engineering had no dimension to explain it beyond 'AI is expensive.'",
    wrong_first:
      "We hard-capped tokens per user per day -- support tickets >3× normal; product revolt until we split soft caps + UX transparency.",
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
