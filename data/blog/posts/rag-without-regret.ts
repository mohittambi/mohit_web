import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "rag-without-regret",
  title: "RAG Without Regret: Chunking, Embeddings, and Evaluating Retrieval Quality",
  description:
    "How to size chunks, pick embedding models, and measure retrieval so RAG systems stay accurate under real document drift and query diversity.",
  publishedAt: "2026-04-18",
  readTime: "12 min read",
  difficulty: "Deep dive",
  tags: ["RAG", "LLM", "Embeddings", "Search", "MLOps"],
  sections: [
    {
      kind: "p",
      text: "Retrieval-augmented generation fails in predictable ways: chunks that split across semantic boundaries, embeddings that collapse paraphrases you care about, and offline benchmarks that look nothing like production queries. This post is a practical checklist for getting the retrieval layer right before you tune prompts or swap models.",
    },
    {
      kind: "h2",
      text: "Chunking is a product decision, not a tokenizer setting",
    },
    {
      kind: "p",
      text: "Fixed token windows are easy to implement and hard to defend. Structure-aware chunking—by heading, section, or logical record—usually beats naive overlap for factual Q&A. When documents are tables or logs, prefer row- or event-sized units with a small amount of trailing context so the model sees column names or field meanings.",
    },
    {
      kind: "ul",
      items: [
        "Measure chunk entropy and median length; huge variance often means your splitter is fighting the document format.",
        "Keep one clear “owner” of a fact per chunk where possible; duplicate facts across chunks only when ambiguity is intentional.",
        "Version your chunking rules with your index so you can replay ingestion when the strategy changes.",
      ],
    },
    {
      kind: "h2",
      text: "Contextual metadata and provenance",
    },
    {
      kind: "p",
      text: "Do not just store text—store provenance you can defend: source document id, URI or object key, page or byte span, section heading path, ingest job id, chunker semver, and a content hash. When a user or auditor asks “why did the model say this on Tuesday?”, the answer should be a join, not a shrug. That metadata also powers safe re-embeds: you know exactly which rows to invalidate when a PDF is replaced.",
    },
    {
      kind: "h2",
      text: "Small-to-big retrieval (validate this)",
    },
    {
      kind: "p",
      text: "Search small, answer big: retrieve on tight child chunks (sentence, table row, tariff line) for precision, then hydrate with the parent section or page window before calling the LLM. The model sees coherent context; the index keeps sharp boundaries for embedding geometry. Skipping this is how you get confident answers built from two halves of a code that never co-occurred in any single chunk.",
    },
    {
      kind: "ul",
      items: [
        "Golden queries should assert both “correct doc id” and “correct span within doc” for structured codes.",
        "If MRR looks good but humans report misses, compare child-hit vs parent-hydration failure rates before touching temperature.",
        "Cap parent expansion by token budget with a deterministic truncation order (headings first, then body).",
      ],
    },
    {
      kind: "h2",
      text: "Embeddings: fit the geometry to the task",
    },
    {
      kind: "p",
      text: "Dense retrieval is cheap at scale but brittle when users ask with jargon, typos, or cross-lingual phrasing. I treat hybrid BM25+vector as overrated as a default for typical SaaS docs and runbooks: lexical variance is often too low to justify the index and ops complexity. Where I have seen hybrid pay is high lexical variance—legal citations, SKU-heavy catalogues, mixed-language support corpora—after we proved lift on a frozen production query set. Otherwise I reach for a small reranker on top-k vectors first; it is usually cheaper to ship and easier to reason about than dual-index sprawl.",
    },
    {
      kind: "h2",
      text: "Evaluate retrieval like you evaluate APIs",
    },
    {
      kind: "p",
      text: "Golden sets of (query, expected doc ids or spans) are the minimum. Layer on adversarial queries: negations, multi-hop paraphrases, and time-bounded questions if your data is temporal. Track precision@k, MRR, and calibrated abstention—when nothing is relevant, the system should say so instead of hallucinating a confident answer.",
    },
    {
      kind: "p",
      text: "Treat ingestion, embedding, and index refresh as part of the release train. RAG without regret means you can change chunking or models, re-embed, and prove—with numbers—that users are not worse off than last week.",
    },
  ],
};
