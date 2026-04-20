import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite (i2b-shaped): chunking strategy change forced **4M** historical supply-chain docs re-embed; real-time path would have been ~72h + org-wide **429** storms.",
    broke:
      "Double-indexed vectors after retry logic in batch workers -- ~12% duplicate nearest-neighbour noise in eval until we caught idempotency gaps.",
    wrong_first:
      "We ran streaming embed on every CMS save (~200 - 800/min spikes) with no micro-batching -- GPU quota thrashed; costs ~2× batch for same coverage.",
    solution:
      "Partitioned batch with checkpointed offsets; streaming path debounced to ~2 - 5s windows; shared idempotency key = (doc_version, chunk_index, embed_model_version).",
    tradeoff:
      "We accepted ~5 - 15 min staleness on search for non-critical tenants versus per-save freshness.",
  },
  whatNot: [
    "I would not pick streaming first for a greenfield corpus just because it sounds modern -- batch wins on unit economics until freshness SLOs force your hand.",
    "I would not run eval harnesses on live writes without pinned snapshots -- you will chase ghosts.",
  ],
  numbers: [
    "Backfill: full re-embed at our scale was ~6 - 14 wall-clock hours per environment depending on quota -- plan maintenance windows honestly.",
    "Micro-batch: coalescing saves into ~500 - 2000 doc batches dropped API calls by ~25× in our CMS spike tests (order-of-magnitude).",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "Batch changes land where chunking and retrieval meet." },
    { slug: "dynamodb-hot-partitions", title: postTitleBySlug["dynamodb-hot-partitions"], why: "Job checkpoints and dedupe keys often sit on hot keys." },
    { slug: "llm-api-token-budgets", title: postTitleBySlug["llm-api-token-budgets"], why: "Embed + rerank loops show up in the same cost reports as chat." },
  ],
};
