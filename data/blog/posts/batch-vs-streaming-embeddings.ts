import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "batch-vs-streaming-embeddings",
  title: "Batch vs Streaming for Embeddings and Eval Harnesses",
  description:
    "When to batch-embed corpora, when to stream, and how to structure eval jobs so they finish on time and on budget.",
  publishedAt: "2026-04-11",
  readTime: "7 min read",
  difficulty: "Deep dive",
  tags: ["ML", "Pipelines", "Embeddings", "Batch"],
  sections: [
    {
      kind: "p",
      text: "Batch jobs excel at full-corpus refreshes and backfills; streaming paths excel at near-real-time ingestion. Mixing them without coordination produces duplicate vectors and torn reads during queries.",
    },
    {
      kind: "h2",
      text: "Batch for throughput, streaming for freshness",
    },
    {
      kind: "p",
      text: "Partition batch work by shard or tenant so failures are isolated. Use checkpointing and idempotent writes so retries do not multiply vectors. For streaming, debounce bursty sources and coalesce embedding calls within latency budgets.",
    },
    {
      kind: "h2",
      text: "Eval harnesses as first-class jobs",
    },
    {
      kind: "p",
      text: "Offline eval should run on fixed snapshots with pinned models; schedule them like data pipelines with SLAs and ownership. Compare metrics run-over-run; treat variance as a signal that data or prompts drifted before you blame the model.",
    },
  ],
};
