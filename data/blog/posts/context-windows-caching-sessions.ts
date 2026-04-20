import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "context-windows-caching-sessions",
  title: "Context Windows Are Not a Database: Caching, Summarisation, and Long-Session Retention",
  description:
    "Why stuffing everything into the prompt fails -- and patterns for durable session state outside the model.",
  publishedAt: "2026-04-12",
  readTime: "9 min read",
  difficulty: "Intermediate",
  tags: ["LLM", "Architecture", "Redis", "UX"],
  sections: [
    {
      kind: "p",
      text: "Large context windows invite lazy design: the conversation history becomes the system of record. That breaks the moment users switch devices, sessions expire, or you need to audit what was true at a point in time.",
    },
    {
      kind: "h2",
      text: "The 1 MB session leak: what it actually costs",
    },
    {
      kind: "p",
      text: "A megabyte-class transcript (~300k tokens) stuffed into every request is not a free buffer -- it is a recurring billing event. The same user story costs radically different amounts depending on which path the tokens travel.",
    },
    {
      kind: "prompt_example",
      title: "1 MB session transcript -- three cost paths (Gemini 3.1 Pro, authoring)",
      after: {
        label: "Cost comparison (April 2026 placeholders -- verify at publish)",
        language: "plaintext",
        code: `Assumptions: ~300k tokens, 3,000 calls/month, Gemini 3.1 Pro

-- Path A: full context every call (no cache) --
Long-context input rate (>200k tokens): $4.00 / 1M
Per call:  0.3M x $4.00 = $1.20
Monthly:   3,000 x $1.20 = $3,600 / month

-- Path B: context caching (Gemini-style) --
Cache storage: 0.3M x $4.50/hr x 720 h = ~$972/mo
Cached reads:  0.3M x $0.20/M x 3,000 = ~$180/mo
Total: ~$1,152 / month  (still enormous vs durable store)

-- Path C: S3 + RAG-shaped retrieval --
S3 storage (1 MB object, ap-south-1):  ~$0.00002 / month
RAG retrieval: ~2k tokens per request
Per call (Gemini 3.1 Flash, $0.50/M): ~$0.001
Monthly: 3,000 x $0.001 = ~$3 / month

Verdict: context-as-database is orders of magnitude
more expensive than S3 + selective retrieval for the
same information. The win is architecture, not a bigger window.`,
      },
      note: "Real invoices split storage hours x cached token footprint and per-request cached reads differently -- use this as directional, then model in the vendor calculator. Rates: authoring placeholders.",
    },
    {
      kind: "h2",
      text: "Cache economics: sprint vs marathon",
    },
    {
      kind: "cost_table",
      title: "Cache billing shape comparison -- Anthropic vs Google (April 2026 illustrative)",
      headers: ["Dimension", "Anthropic-style prompt cache", "Google-style context cache"],
      rows: [
        ["Billing shape", "Write surcharge + cheap hits within TTL", "$/M token/hr storage + cached read rates"],
        ["Cache write (Sonnet illustrative)", "$3.75 / 1M tokens", "$2.00 / 1M tokens"],
        ["Cache read (Sonnet illustrative)", "$0.30 / 1M tokens", "$0.20 / 1M tokens"],
        ["Storage fee", "No hourly storage charge", "$1.00-$4.50 / 1M tok / hr (model-dependent)"],
        ["Best chat pattern", "High-frequency reuse of same prefix every few seconds", "Large static doc queried occasionally over hours"],
        ["Principal one-liner", "High-frequency chat -- TTL cache can dominate.", "Low-frequency big doc -- hourly storage can dominate."],
      ],
      note: "300k tokens to Opus without caching: 0.3 x $15 = ~$4.50/request input-only -- every Enter is a budget event. Cache hit: 0.3 x $1.50 = ~$0.45/request. Worth it only if session cadence keeps the cache warm.",
    },
    {
      kind: "h2",
      text: "Externalise durable facts",
    },
    {
      kind: "p",
      text: "Store user preferences, application state, and retrieved documents in your own stores with clear TTLs and schema. Pass only what the next turn needs -- summaries plus pointers to fuller records beat megabyte transcripts.",
    },
    {
      kind: "h2",
      text: "Summarisation with guardrails",
    },
    {
      kind: "p",
      text: "Rolling summaries should preserve commitments, constraints, and open tasks; validate summarisation with the same eval harness you use for answers. When facts change mid-session, invalidate both cache and summary fragments that depended on the old truth.",
    },
    {
      kind: "cost_table",
      title: "Strategy comparison -- context caching vs summarisation vs RAG",
      headers: ["Strategy", "Cost factor", "Best for"],
      rows: [
        ["Context caching (Gemini-style)", "High $/hr storage + cheap hits", "Active sessions, repetitive tool loops, short TTL hot prefixes"],
        ["Summarisation", "One-time output token bill + validator passes", "Multi-day memory; compress 300k to ~5k summary stored in DB"],
        ["RAG (S3 + vector store)", "Retrieval latency + index ops", "Large corpora, audit trails, compliance-grade retention"],
      ],
      note: "Golden path: summarisation-as-a-service -- pay the output tax once to shrink history, persist validated summary in Postgres/S3, stop re-buying the same megabytes per turn.",
    },
    {
      kind: "h2",
      text: "TTL discipline: the hourly storage trap",
    },
    {
      kind: "p",
      text: "With Gemini 3.1 Pro cache storage at ~$4.50/1M tok/hr, a 1M-token cache held for 24 hours costs ~$108 on that line alone. Default to short TTLs, extend only on active sessions with heartbeats, and delete cache on logout or session end.",
    },
    {
      kind: "cost_note",
      label: "FinOps note -- cache TTL vs session cadence",
      paragraphs: [
        "A 300k-token Claude 4.7 Sonnet session: cache write $3.75/1M x 0.3M = **$1.12**. Cache hit read: $0.30/1M x 0.3M = **$0.09/call**. If the user pauses past the TTL, you pay the $1.12 cache write again -- session cadence is now a billing input, not just a UX detail.",
        "The 'Opus tax': routing 300k tokens to Opus without caching costs 0.3 x $15 = **$4.50/request** input-only. Every unguarded long-context Opus call is a budget event. Route to Opus only for strategic / conflict-resolution tasks (see model routing post).",
      ],
      formula: "cache_write_cost = cached_tokens_M * cache_write_rate\ncache_read_cost = cached_tokens_M * cache_read_rate\ncache_storage_cost_24h = cached_tokens_M * storage_rate_per_hr * 24",
    },
  ],
};
