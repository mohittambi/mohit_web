import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "llm-api-token-budgets",
  title: "LLM API Usage: Token Budgets, Model Routing, and Per-Feature Cost Attribution",
  description:
    "Making LLM spend predictable: budgets, routing rules, and telemetry that ties dollars to product surfaces.",
  publishedAt: "2026-04-13",
  readTime: "9 min read",
  tags: ["LLM", "Cost", "FinOps", "APIs"],
  sections: [
    {
      kind: "p",
      text: "Token meters belong next to request logs. Without per-feature attribution, every team assumes someone else owns the bill spike. Start by tagging every call with product area, tenant tier, and workflow id.",
    },
    {
      kind: "h2",
      text: "Budgets as product constraints",
    },
    {
      kind: "p",
      text: "Soft caps trigger summarisation or cheaper models; hard caps return graceful degradation. Expose remaining budget to the UX for long sessions so power users understand why depth was trimmed. Finance should see the same dimensions you use for alerts.",
    },
    {
      kind: "h2",
      text: "Model routing",
    },
    {
      kind: "p",
      text: "Route by task class: small models for classification and extraction, larger models for synthesis and multi-step reasoning. Cache deterministic sub-results. Re-evaluate routing when pricing or latency curves move—routing tables deserve version control and canary analysis like any other config.",
    },
  ],
};
