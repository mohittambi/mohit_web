import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "Streaming first for a greenfield corpus is often resume-driven development -- batch usually wins unit economics until freshness SLOs force your hand.",
  strongVisual:
    "Two timelines: batch checkpoint ladder vs jittery streaming spikes on same y-axis (cost).",
  linkedInThread: [
    "Batch backfills: checkpoints + idempotent vector writes -- or retries duplicate embeddings and poisons nearest-neighbour search.",
    "Streaming ingest: 2 - 5s micro-batches usually beat per-save GPU thrash; freshness SLO should pick the window, not hype.",
    "Eval harnesses belong on pinned snapshots; live-write metrics lie the week someone ships a bad chunker.",
    "OpenAI Batch API (when vendor batch fits your pipeline): https://platform.openai.com/docs/guides/batch",
    `${blogPostUrl("batch-vs-streaming-embeddings")}  --  batch vs streaming embeddings + eval jobs.`,
    "Where did streaming first hurt your unit economics?",
  ],
  diagramBrief: {
    title: "Batch checkpoints vs streaming micro-batches",
    elements: [
      "Batch pipeline with checkpoint ticks; retry arrow loops to same offset on failure.",
      "Streaming bursty line smoothed by 2 - 5s micro-batch box.",
      "Eval harness pinned to snapshot hash -- X on 'live only' eval path.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Define freshness SLO per document class; measure current lag distribution.",
      "Prototype batch backfill with idempotent vector upsert.",
      "Snapshot eval harness wired to CI.",
    ],
    month1: [
      "Micro-batch streaming for high-churn subset only.",
      "Cost dashboards: $/million tokens embed + index maintenance.",
      "Replay tests for partial batch failures.",
    ],
    scale: [
      "Tenant-scoped queues; noisy neighbour isolation on GPU pools.",
      "Cross-region embed with dedupe and legal data residency boundaries.",
      "Blue/green vector index alias tied to embed model semver.",
    ],
  },
  interview30Sec:
    "I pick batch vs streaming from freshness SLO and cost, not fashion. I checkpoint batch jobs with idempotent keys, micro-batch streaming to cut spikes, and I never trust evals that are not pinned to snapshots.",
  cto1Min:
    "Week one I write down SLOs and ship a boring batch pipeline with checkpoints. Month one I add streaming only where churn demands it, with micro-batches and cost visibility. At scale I isolate tenants on embed queues and tie index aliases to model versions for safe rollback.",
};
