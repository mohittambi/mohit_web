import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook:
    "Most RAG 'hallucinations' are a PDF page break away -- a tariff line split across chunks is not a model problem until you pretend it is.",
  strongVisual:
    "Split-screen: HTS code torn across two chunks by a page boundary vs small-to-big retrieval (child hit + parent context window) with provenance callouts (doc id, page span, ingest hash).",
  linkedInThread: [
    "CTO arc I keep seeing: confident wrong HTS line because a PDF page break split digits across chunk A and B -- three days on 'temperature' until someone opened the chunk viewer.",
    "Fixed-token chunking looks clean in PRs. In prod it splits meaning across headings, tables, and page boundaries.",
    "Structure-aware splits + provenance (doc id, page span, chunker semver, hash) beat yelling at embedding dimensions alone.",
    "Golden sets under a few hundred labelled queries mostly measure noise. Scale the set before you trust regressions.",
    "Hybrid BM25 + vector is real infra: I default it off for typical internal corpora until lexical variance proves lift on a frozen query set.",
    "Rerank top-k before you buy a bigger embedding model -- the invoice is quieter and failure modes are clearer.",
    "Small-to-big: retrieve on tight child spans, hydrate parent context before the LLM call. Eval span hits, not only doc id.",
    `${blogPostUrl("rag-without-regret")}  --  long form: chunking, provenance, retrieval evals.`,
    "What chunking rule broke YOUR RAG in prod?",
  ],
  diagramBrief: {
    title: "RAG path with failure arrows (what to draw)",
    elements: [
      "PDF page boundary as scissors through HTS line -- two child chunks with dashed failure arrow into LLM labelled 'never co-occur in context.'",
      "Small-to-big path: tight child vectors → fetch parent section / page window solid arrow into LLM labelled 'hydration.'",
      "Provenance strip: doc id, page span, chunker semver, content hash -- parallel to index rows.",
      "Top-k → rerank: dashed retry loop for provider 429 / timeout with backoff.",
      "Eval harness: assert span-level correctness, not only doc id -- feeds chunker semver in closed loop.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Freeze a 500 - 2k production query sample (redacted) + manual relevance labels for top intents.",
      "Ship structure-aware chunking v0 + single embed model; no hybrid until measured need.",
      "One dashboard: P@k, MRR, latency p50/p99, abstention rate, $/1k queries.",
    ],
    month1: [
      "Expand golden set toward 2k+; add adversarial set (negation, time-bound, internal codenames).",
      "Add reranker on top-k; A/B on retrieval-only metrics before touching prompts.",
      "Automate re-embed on chunker semver; blue/green index alias for rollback.",
    ],
    scale: [
      "Partition corpus by tenant/domain; rate-limit expensive rerank per tier.",
      "Batch re-embed with checkpoints; async freshness SLO per document class.",
      "Governance: human review queue for low-confidence answers in regulated flows.",
    ],
  },
  interview30Sec:
    "I treat RAG as retrieval and provenance first: structure-aware chunks, metadata for audit, small-to-big retrieval so models never see half a code, and evals that check spans -- not just doc ids. I add rerank before bigger models and only turn on hybrid lexical search when lexical variance proves it.",
  cto1Min:
    "Week one I freeze representative queries and ship chunking plus provenance on every vector row. Month one I add small-to-big hydration, rerankers, and span-level golden tests -- including HTS-style adversarial cases. At scale I partition corpora, tier rerank spend, and tie releases to eval gates so regressions are caught like API regressions -- before Finance or customs ask why the model 'invented' a duty line.",
};
