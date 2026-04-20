import type { BlogPost } from "../types";

const DUAL_PIPELINE_MERMAID = `graph TD
    A[Data Source] --> B{Pipeline Router}

    B -- "Single Doc (Real-time)" --> C[SQS FIFO Queue]
    C --> D[Lambda / ECS Worker]
    D -- "Sync HTTP Call" --> E[Standard LLM API]

    B -- "Corpus / Evals (>1k Docs)" --> F[Upload to S3]
    F --> G[ECS Task: Generate JSONL]
    G -- "Upload File" --> H[LLM Batch API]

    E --> I[(Vector Database)]
    H -- "Async Webhook" --> J[ECS Task: Parse JSONL]
    J --> I

    style C stroke:#E5E7EB,stroke-width:1px
    style F stroke:#00F0FF,stroke-width:2px
    style G stroke:#E5E7EB,stroke-width:1px
    style H stroke:#00F0FF,stroke-width:2px`;

const BATCH_UPLOADER_TS = `// Generating the exact JSONL format required for OpenAI Batch API
import fs from 'fs';

export function createBatchFile(documents: { id: string; text: string }[]) {
  const stream = fs.createWriteStream('/tmp/batch_input.jsonl');

  for (const doc of documents) {
    const request = {
      custom_id: \`doc_\${doc.id}\`, // Critical for mapping results back
      method: "POST",
      url: "/v1/embeddings",
      body: {
        model: "text-embedding-3-small",
        input: doc.text,
      },
    };
    stream.write(JSON.stringify(request) + '\\n');
  }

  stream.end();
  return '/tmp/batch_input.jsonl';
}`;

export const post: BlogPost = {
  slug: "batch-vs-streaming-embeddings",
  title: "Batch vs Streaming for Embeddings and Eval Harnesses",
  description:
    "i2b-style re-embed at scale: 50% Batch API economics, dual fast/slow pipelines with S3 + JSONL + webhooks, eval harness CI, and Redis token buckets on the streaming path.",
  publishedAt: "2026-04-11",
  readTime: "7 min read",
  difficulty: "Deep dive",
  tags: ["ML", "Pipelines", "Embeddings", "Batch", "FinOps", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "There is a distinct moment in an AI team's maturity when they realize that making **10 million** synchronous HTTP requests to an LLM provider is a terrible idea.",
    },
    {
      kind: "p",
      text: "At **i2b**, our B2B supply chain engine relies on vector search to match incoming purchase orders against historical ledgers. When we changed our chunking strategy last month, we had to re-embed **4 million** historical documents.",
    },
    {
      kind: "p",
      text: "If we had pushed that payload through our standard real-time ingestion pipeline, it would have taken **72 hours**, triggered massive `429 Too Many Requests` throttling storms across our organization, and cost full retail price.",
    },
    {
      kind: "p",
      text: "AI workloads are fundamentally asynchronous. If a user is not actively waiting for a response, routing AI workloads through synchronous APIs is architectural malpractice. Here is the engineering blueprint for splitting your ML pipelines into **Real-time Streaming** and **Offline Batch**, specifically targeting the **50%** \"Batch Discount\" economics.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '1. The Asynchronous Discount (The 50% Rule)',
    },
    {
      kind: "p",
      text: "Both OpenAI and Anthropic realized that managing synchronous burst traffic requires massive, expensive compute buffers. To incentivize developers to smooth out the load, they introduced **Batch APIs**.",
    },
    {
      kind: "p",
      text: "The contract is simple: You upload a **JSONL** file of requests, they process it within **24 hours**, and you get a **50% discount** on the entire run.",
    },
    {
      kind: "p",
      text: "Let's look at the math for re-indexing **500 million** tokens (approx. **4 million** supply chain documents):",
    },
    {
      kind: "ul",
      items: [
        "**Standard API (`text-embedding-3-small`):** **`$0.02`** per 1M tokens = **`$10.00`**",
        "**Batch API (`text-embedding-3-small`):** **`$0.01`** per 1M tokens = **`$5.00`**",
      ],
    },
    {
      kind: "p",
      text: "For embeddings, the savings are nice, but the real financial impact is in **Evaluation Harnesses**.",
    },
    {
      kind: "p",
      text: "If you are running regression tests across **10,000** production prompts using **Claude 4.7 Sonnet** (at **`$3.00`** input / **`$15.00`** output) to ensure a prompt tweak didn't break extraction:",
    },
    {
      kind: "ul",
      items: [
        "**Standard Eval Run:** **`~$300.00`** per run.",
        "**Batch Eval Run:** **`~$150.00`** per run.",
      ],
    },
    {
      kind: "p",
      text: "If your CI/CD pipeline runs these evals **10 times a week**, moving to the Batch API saves you **`$6,000/month`** in testing costs alone.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. The Dual-Pipeline Architecture",
    },
    {
      kind: "p",
      text: "You cannot use Batch APIs for everything. When a vendor uploads a *new* invoice, the system needs to embed it instantly so it becomes searchable.",
    },
    {
      kind: "p",
      text: "You must build a dual-pipeline architecture: a **Fast Path** for streaming ingestion, and a **Slow Path** for backfills and evaluations.",
    },
    { kind: "mermaid", code: DUAL_PIPELINE_MERMAID },
    {
      kind: "p",
      text: "**The Slow Path (Batch) Implementation** — batch processing shifts the complexity from the network layer to the file system layer.",
    },
    {
      kind: "ol",
      items: [
        "**Generation:** An ECS task queries your primary database, formats the prompts/documents into a `.jsonl` file, and uploads it to the provider.",
        "**Polling vs. Webhooks:** Never poll the Batch API status. Configure a webhook receiver (similar to the idempotent webhook pattern in Post #4) to listen for the **`batch.completed`** event.",
        "**Reconciliation:** The provider returns a results `.jsonl` file. Your ECS worker downloads it, maps the **`custom_id`** back to your primary database IDs, and bulk-inserts the vectors.",
      ],
    },
    {
      kind: "code_block",
      language: "typescript",
      title: "lib/ml/batch-uploader.ts",
      code: BATCH_UPLOADER_TS,
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The custom_id Contract",
      text:
        "The most critical part of batch processing is the **`custom_id`**. The LLM provider processes batch lines **out of order**. If you do not pass your database primary key into the **`custom_id`** field, you will have a file full of vectors with absolutely no way to know which document they belong to.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "3. Eval Harnesses: The CI/CD Integration",
    },
    {
      kind: "p",
      text: "Evaluation is the most ignored phase of AI engineering. Most teams test a prompt by eye-balling **5** examples in a playground.",
    },
    {
      kind: "p",
      text: "To achieve **99.99%** reliability on supply chain extractions, you must treat prompts like code. You need an automated **Eval Harness**.",
    },
    {
      kind: "ol",
      items: [
        "**The Golden Dataset:** Curate a static S3 bucket containing **1,000** anonymized, highly complex production inputs and their expected JSON outputs.",
        "**The PR Trigger:** When an engineer opens a Pull Request modifying a `prompt.txt` file, GitHub Actions triggers an **AWS Step Function**.",
        "**The Batch Eval:** The Step Function generates a `.jsonl` file combining the *new* prompt with the **1,000** Golden Inputs and submits it to the Batch API.",
        "**The Grader:** Once the batch completes, a secondary \"Grader Model\" (or a deterministic regex script) compares the Batch output against the Golden Output.",
        "**The Merge Gate:** If the accuracy drops below **95%**, the GitHub Action fails the PR automatically.",
      ],
    },
    {
      kind: "p",
      text: "By using the Batch API for this, a rigorous **1,000**-document regression test runs asynchronously in the background for a fraction of the cost, completely isolated from your production API rate limits.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "4. Rate Limiting the Fast Path",
    },
    {
      kind: "p",
      text: "Even with a Batch pipeline handling the heavy lifting, your Fast Path (real-time streaming) is still vulnerable to localized traffic spikes.",
    },
    {
      kind: "p",
      text: "If a user uploads a zip file containing **500** PDFs through your UI, you cannot loop through them synchronously in your Express controller.",
    },
    {
      kind: "p",
      text: "**The Distributed Token Bucket:**",
    },
    {
      kind: "ol",
      items: [
        "Push all Fast Path requests to an **SQS FIFO** queue.",
        "Wrap your Lambda/ECS consumer in a **Redis**-backed token bucket algorithm.",
        "If the external LLM API returns `429 Too Many Requests`, catch the error, decrement your token bucket capacity, and return the message to SQS using **exponential backoff**.",
      ],
    },
    {
      kind: "h2",
      text: "The Pipeline Architecture Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Never use the Fast Path for >100 documents.** Hardcode a circuit breaker in your UI/API that forces bulk uploads into the asynchronous Batch queue.",
        "**Vector DB Upsert Limits:** The LLM provider might return your batch of **4 million** vectors all at once. Do not attempt to write **4 million** vectors to Pinecone/Qdrant in a single `Promise.all`. You must chunk your database writes.",
        "**Idempotency:** Re-running a failed Batch file should overwrite existing vectors cleanly without duplicating data.",
      ],
    },
  ],
};
