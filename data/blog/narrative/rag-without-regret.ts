import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: trade-compliance RAG over long PDF tariff schedules; users ask for HTS classification lines with chapter/heading/subheading context; peak retrieval ~400 QPS during launch week.",
    broke:
      "The 'hallucination' was retrieval theatre: a single PDF page break split a critical HTS line so half the digits lived in chunk A and half in chunk B. The model confidently cited a code that never appeared intact in any retrieved window -- three days of blame on 'temperature' before we opened the chunk viewer.",
    wrong_first:
      "We chased a bigger embedding model and widened overlap 'so nothing gets cut.' That masked the bug while inflating tokens; hybrid BM25+vector for everyone added ~35% infra with no lift on our frozen HTS query set.",
    solution:
      "Structure-aware splits on document hierarchy (page + heading + table row), contextual metadata on every chunk (source doc id, page span, ingest version, content hash), and small-to-big retrieval: search tight child chunks, feed the LLM parent section text for grounding. Golden set grew toward HTS-shaped adversarial queries.",
    tradeoff:
      "We paid extra index rows and fetch latency to keep provenance and parent context joinable; cheaper than shipping wrong duty classifications.",
  },
  whatNot: [
    "I would not ship 'hybrid search for all tenants' as a default. In most SaaS knowledge bases -- runbooks, product docs, semi-structured logs -- lexical variance is low enough that BM25+vector is mostly complexity and cardinality tax unless you measure a win on your query mix.",
    "I would not let the LLM vendor be the first place you look when answers go wrong -- split retrieval vs generation with a cheap rerank or even keyword overlap diagnostics first.",
    "I would not skip versioning the chunker: re-embedding without replayable pipelines is how you lose the ability to argue with data when quality regresses.",
    "I would not store naked text vectors without provenance -- if you cannot answer 'which PDF page, which ingest job, which hash,' you cannot defend an answer in audit or customs review.",
  ],
  numbersLabel: "Orders of magnitude (illustrative composite)",
  numbers: [
    "Retrieval fan-out: top-k went from k=8 to k=24 during the bad experiment; tail latency moved roughly 3× for the same p50.",
    "Golden-set size: ~200 queries is a toy; 1k - 5k labelled or adjudicated queries is where regressions start to feel statistically noisy instead of anecdotal.",
    "Re-embed cost: full corpus ~12M chunks at ~1.2ms average embed queue wait → multi-hour backfill; we planned for ~30% duplicate work on retries without idempotent write keys.",
  ],
  readNextIntro: "If this problem shows up in your world, read next:",
  readNextItems: [
    { slug: "lambda-to-ecs-when-serverless-stops", title: postTitleBySlug["lambda-to-ecs-when-serverless-stops"], why: "After you fix chunks, tails and cost still decide where compute lives." },
    { slug: "dynamodb-hot-partitions", title: postTitleBySlug["dynamodb-hot-partitions"], why: "High-QPS retrieval and dedupe rows will eventually meet partition physics." },
    { slug: "batch-vs-streaming-embeddings", title: postTitleBySlug["batch-vs-streaming-embeddings"], why: "Chunker and provenance changes land in re-embed pipelines." },
  ],
};
