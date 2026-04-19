import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "context-windows-caching-sessions",
  title: "Context Windows Are Not a Database: Caching, Summarisation, and Long-Session Retention",
  description:
    "Why stuffing everything into the prompt fails—and patterns for durable session state outside the model.",
  publishedAt: "2026-04-12",
  readTime: "9 min read",
  tags: ["LLM", "Architecture", "Redis", "UX"],
  sections: [
    {
      kind: "p",
      text: "Large context windows invite lazy design: the conversation history becomes the system of record. That breaks the moment users switch devices, sessions expire, or you need to audit what was true at a point in time.",
    },
    {
      kind: "h2",
      text: "Externalise durable facts",
    },
    {
      kind: "p",
      text: "Store user preferences, application state, and retrieved documents in your own stores with clear TTLs and schema. Pass only what the next turn needs—summaries plus pointers to fuller records beat megabyte transcripts.",
    },
    {
      kind: "h2",
      text: "Summarisation with guardrails",
    },
    {
      kind: "p",
      text: "Rolling summaries should preserve commitments, constraints, and open tasks; validate summarisation with the same eval harness you use for answers. When facts change mid-session, invalidate both cache and summary fragments that depended on the old truth.",
    },
  ],
};
