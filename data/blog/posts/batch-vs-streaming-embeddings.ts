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
      text: "First-time write tax: batch is not free compute",
    },
    {
      kind: "p",
      text: "Batch APIs offer a ~50% discount versus synchronous list prices in exchange for latency tolerance (minutes to 24 hours). The catch: first-time backfills pay full write-shaped economics for cold prefixes -- no cache hits yet. Second pass and subsequent streaming traffic is where cache read rates dominate.",
    },
    {
      kind: "cost_table",
      title: "First-time batch rates -- per 1M tokens (April 2026 placeholders, verify at ship)",
      headers: ["Provider / model", "First-time input (batch)", "Output (batch)", "Subsequent input (cache hit)"],
      rows: [
        ["Anthropic Claude 4.7 Sonnet", "$1.87", "$7.50", "$0.15"],
        ["Anthropic Claude 4.7 Opus", "$3.12", "$12.50", "$0.25"],
        ["Google Gemini 3.1 Pro", "$1.10", "$6.00", "$0.10"],
        ["Google Gemini 3.1 Flash", "$0.27", "$1.50", "$0.02"],
      ],
      note: "Tokenizer tax (Anthropic 4.7): up to ~35% more tokens for the same raw text vs 4.6 expectations -- effective $/document can rise even when list $/M falls. Tokenize a stratified sample of production docs before committing batch SLAs.",
    },
    {
      kind: "h2",
      text: "Batch for throughput, streaming for freshness",
    },
    {
      kind: "cost_table",
      title: "Batch vs streaming trade-off matrix",
      headers: ["Dimension", "Streaming (near-real-time)", "Batch (asynchronous)"],
      rows: [
        ["Latency", "<~2s per call", "Minutes to 24h job SLA"],
        ["Cost (relative)", "~100% of synchronous rate", "~50% of synchronous (authoring)"],
        ["Caching value", "High once prefixes are warm", "Low on first pass -- write tax dominates"],
        ["Best for", "User-facing paths, tight SLO", "Re-index, re-embed, nightly eval"],
        ["Failure mode", "Per-call retry, low blast radius", "Full job retry without checkpointing = 2x bill"],
      ],
      note: "Total pipeline cost = batch inference + S3 manifest storage + orchestrator + vector DB write units + failed-line retries. Put it in one FinOps slide before committing to batch SLAs.",
    },
    {
      kind: "h2",
      text: "Checkpointing at scale: the resume blueprint",
    },
    {
      kind: "p",
      text: "A 100M-token backfill is multi-hour. A crash at 90% must not force a full duplicate bill. Checkpoint with JSONL manifests so each line is an atomic unit. On failure, diff completed output request IDs against the input manifest and re-submit only missing lines.",
    },
    {
      kind: "code_block",
      title: "Partial-retry delta logic (Python -- adapt to your SDK and storage layout)",
      language: "python",
      code: `import json

def completed_request_ids(output_jsonl_path: str) -> set[str]:
    done: set[str] = set()
    with open(output_jsonl_path, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = json.loads(line)
            rid = rec.get("custom_id") or rec.get("request_id")
            if rid and rec.get("error") is None:
                done.add(rid)
    return done


def filter_delta(input_jsonl_path: str, done: set[str]) -> list[dict]:
    pending: list[dict] = []
    with open(input_jsonl_path, encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            rid = rec["custom_id"]
            if rid not in done:
                pending.append(rec)
    return pending

# pending -> write delta_input.jsonl -> submit new batch job
# with same model + dataset pins (never blind full-file retry)`,
    },
    {
      kind: "h2",
      text: "Eval harnesses as first-class jobs",
    },
    {
      kind: "p",
      text: "Offline eval should run on fixed snapshots with pinned models; schedule them like data pipelines with SLAs and ownership. Compare metrics run-over-run; treat variance as a signal that data or prompts drifted before you blame the model.",
    },
    {
      kind: "cost_note",
      label: "FinOps note -- nightly eval harness economics",
      paragraphs: [
        "Pinned ~1,000-prompt regression run on Batch nightly: authoring economics ~$15 (Sonnet batch) vs ~$30 (streaming) per run. Delta: ~$15/day -> **~$5,400/year** on testing alone in the toy model. Only valid if your token counts and discount rates match -- still a credible order-of-magnitude for FinOps storytelling.",
        "**Eval without pins is noise.** Pin `dataset_version` (hash of golden inputs) AND `model_version` in batch metadata. CI should block release if batch eval from pinned snapshot regresses beyond threshold -- the SLA for eval runtime is now a batch SLA.",
        "**Idempotency keys for vector writes**: use `sha256(document_id + chunk_index)` as the `custom_id` in JSONL. This maps naturally to vector store upsert natural keys and makes delta-resume safe across retries.",
      ],
      formula: "batch_eval_annual_savings = (streaming_cost_per_run - batch_cost_per_run) * runs_per_year",
    },
  ],
};
