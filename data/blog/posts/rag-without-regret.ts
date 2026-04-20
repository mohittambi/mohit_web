import type { BlogPost } from "../types";

const MERMAID_PIPELINE = `graph TD
    A[Raw Ingestion] --> B{Structure-Aware Chunker}
    B --> C[Small-to-Big Mapping]
    C --> D[Async Batch Embeddings]
    D --> E[(Serverless Vector DB)]

    F[User Query] --> G[Lexical Search BM25]
    F --> H[Vector Search]
    G --> I{Hybrid Reranker}
    H --> I
    I --> J[LLM Context Window]`;

const INDEX_ROUTER_CODE = `// Always query via alias, never the hardcoded index name
const ACTIVE_INDEX_ALIAS = "supply-chain-v2-prod";

async function retrieveChunks(query: string) {
  return await vectorDb.query({
    index: ACTIVE_INDEX_ALIAS,
    vector: await embed(query),
    topK: 10
  });
}`;

export const post: BlogPost = {
  slug: "rag-without-regret",
  title: "RAG Without Regret: Chunking, Embeddings, and Evaluating Retrieval Quality",
  description:
    "Chunking as a product decision, hybrid retrieval, embedding economics in ap-south-1, reranker tax, shadow indexes, and how to evaluate cost per correct answer — without blaming the LLM for retrieval failures.",
  publishedAt: "2026-04-18",
  readTime: "12 min read",
  difficulty: "Deep dive",
  tags: ["RAG", "LLM", "Embeddings", "Search", "MLOps", "FinOps"],
  sections: [
    {
      kind: "p",
      text: "We burned three days debugging a hallucination in our B2B supply chain agent before realizing the LLM wasn't the problem.",
    },
    {
      kind: "p",
      text: "A user asked for the import tariff on a specific electronics shipment. The agent confidently hallucinated a completely invalid Harmonized Tariff Schedule (HTS) code. We tweaked the prompt. We lowered the temperature. We upgraded the model. Nothing worked.",
    },
    {
      kind: "p",
      text: "The actual root cause? A poorly-timed **PDF page break**.",
    },
    {
      kind: "p",
      text: "Our naive chunking strategy had sliced a 10-digit HTS code perfectly in half across two different vector chunks. The retrieval engine only fetched the first half. The LLM, trying to be helpful, hallucinated the remaining five digits.",
    },
    {
      kind: "p",
      text: "Retrieval-Augmented Generation (RAG) fails at the retrieval layer **90%** of the time, but we blame the model because it's the last node in the chain. Here is how to build a retrieval layer in **2026** that actually survives production constraints, complete with the unit economics of doing it at scale.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "1. Chunking is a Product Decision, Not a Tokenizer Setting",
    },
    {
      kind: "p",
      text: "The default tutorial approach—chunking by a fixed token count (e.g. `512 tokens`) with a `50 token` overlap—is an architectural trap. It destroys semantic boundaries.",
    },
    {
      kind: "p",
      text: "Instead of fixed windows, we use **Contextual Metadata**. In our ingestion pipeline, we don't just store the text; we store the provenance. If a chunk contains a table row, the metadata must contain the table headers.",
    },
    {
      kind: "p",
      text: "If you are dealing with complex compliance documents or supply chain ledgers, adopt a **Small-to-Big Retrieval** pattern:",
    },
    {
      kind: "ol",
      items: [
        "Embed and index highly granular, small chunks (`~100 tokens`).",
        "Store the large parent document ID in the metadata.",
        "When the vector search hits the small chunk, return the *parent document* to the LLM.",
      ],
    },
    {
      kind: "p",
      text: "You search small for precision, but you feed the LLM big for context.",
    },
    {
      kind: "h2",
      text: "2. The Retrieval Pipeline (Architecture)",
    },
    { kind: "mermaid", code: MERMAID_PIPELINE },
    {
      kind: "h2",
      text: "3. The 2026 Embedding Economics (ap-south-1)",
    },
    {
      kind: "p",
      text: "Embedding model choice is about query-document overlap, not benchmark leaderboards. However, the operational cost of *how* you embed matters immensely, especially when operating out of `ap-south-1` where data transfer and latency budgets are tight.",
    },
    {
      kind: "p",
      text: "If you are processing millions of tokens for an internal ledger, synchronous API calls will bankrupt your latency and your budget. In **2026**, **Async Batching** is mandatory.",
    },
    {
      kind: "p",
      text: "**The Batch Ingestion Baseline (per 1M Tokens)**",
    },
    {
      kind: "ul",
      items: [
        "**OpenAI 3-small:** `$0.02` (The efficiency king for general RAG).",
        "**Google Embedding 2:** `$0.15` (Mandatory if you need multimodal text+image overlap).",
        "**Voyage-3-large:** `$0.18` (High accuracy for technical/API docs).",
        "**Self-hosted (BGE-M3):** `$0.00` compute, but high DevOps overhead.",
      ],
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The 50% Batch Discount",
      text: "Both **Anthropic** and **Google** offer a 50% discount for 24-hour latency batch jobs. Initial indexing of `100M tokens` using standard APIs costs `$2.00`. Using the Batch API, it drops to `$1.00`. Build your ingestion pipelines asynchronously from Day 1.",
    },
    {
      kind: "h2",
      text: "4. The Reranker Tax",
    },
    {
      kind: "p",
      text: "Simple vector search (cosine similarity) often misses nuance, especially with domain jargon. A user searching for \"failed delivery\" might get chunks about \"successful delivery\" because the vectors are near each other in the latent space.",
    },
    {
      kind: "p",
      text: "Adding a cross-encoder or reranker (like Cohere Rerank 4) fixes this, but introduces **The Rerank Tax**.",
    },
    {
      kind: "ul",
      items: [
        "**Cohere Rerank 4 Fast:** `~$2.00` per 1,000 searches.",
        "**The Scale Problem:** If your app does `10,000` searches a day, you are adding `$600/month` just to sort an array.",
      ],
    },
    {
      kind: "p",
      text: "**The Mitigation:** Only invoke the reranker if your initial metadata filtering leaves you with more than `50` candidate chunks. If your `tenant_id` and `date_range` filters narrow the search space to 10 chunks, skip the reranker and let the LLM sort it out.",
    },
    {
      kind: "h2",
      text: '5. Index Lifecycle and the "Pivot Tax"',
    },
    {
      kind: "p",
      text: "You will eventually need to change your embedding model or your chunking strategy. This requires a full re-index.",
    },
    {
      kind: "p",
      text: "The compute cost of a mistake is surprisingly cheap. Re-embedding `50,000` documents (`~100M tokens`) costs about `$7.00` in API fees.",
    },
    {
      kind: "p",
      text: "The real cost is **Operational**. You cannot overwrite a live index. You must deploy a **Shadow Index**. For the duration of the migration (which could take days to validate), you are paying double for your Serverless Vector DB storage (`~$0.33/GB`), doubling your write capacity units, and managing dual-write logic in your application layer.",
    },
    {
      kind: "p",
      text: "Treat your chunking logic as a versioned API contract. Never mutate an index; alias it.",
    },
    {
      kind: "code_block",
      language: "typescript",
      title: "lib/rag/index-router.ts",
      code: INDEX_ROUTER_CODE,
    },
    {
      kind: "h2",
      text: "6. Evaluation: Cost per Correct Answer",
    },
    {
      kind: "p",
      text: "Offline evaluation metrics (MRR, NDCG) are useless if your test set doesn't look like production queries. Stop testing your RAG system with factual trivia. Test it with adversarial, misspelled, context-heavy queries pulled from your actual application logs.",
    },
    {
      kind: "p",
      text: "Track the **Cost per Correct Answer**.",
    },
    {
      kind: "ul",
      items: [
        "**Scenario A (Vector Only):** `$0.01` per query. Accuracy: 85%.",
        "**Scenario B (Vector + Rerank + Pro LLM):** `$0.05` per query. Accuracy: 88%.",
      ],
    },
    {
      kind: "p",
      text: "Is that 3% gain in precision worth a 500% increase in unit cost? For a medical compliance bot, yes. For an internal HR policy chatbot, absolutely not.",
    },
    {
      kind: "h2",
      text: "The Week One Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Implement Metadata Filtering:** Never run a global vector search. Filter by tenant, document type, or date first.",
        "**Switch to Small-to-Big:** Embed paragraphs, retrieve chapters.",
        "**Pin the Embedding Model Version:** `text-embedding-3-small` is an alias. Pin to the specific immutable version so your vectors don't silently drift.",
        "**Log the Un-augmented Response:** Always log what the LLM would have said *without* the RAG context. It is the only way to measure if your retrieval is actually adding value.",
      ],
    },
  ],
};
