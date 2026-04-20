import type { BlogSection } from "./types";

/**
 * Optional 'Further reading' block merged after `read_next` (authoritative sources + why they matter).
 * Add entries per slug as long-form matures; empty map is fine.
 */
export const furtherReadingAppendix: Partial<Record<string, Extract<BlogSection, { kind: "further_reading" }>>> = {
  "rag-without-regret": {
    kind: "further_reading",
    intro:
      "Grounding and reliability -- not raw URL dumps. These are the references I reach for when retrieval becomes an ops surface, not a notebook demo.",
    items: [
      {
        title: "Google  --  Site Reliability Engineering (book)",
        href: "https://sre.google/sre-book/table-of-contents/",
        context:
          "SLOs, toil, and error budgets: the same discipline applies when RAG pipelines become production services with dashboards and paging.",
      },
      {
        title: "AWS Builders' Library",
        href: "https://aws.amazon.com/builders-library/",
        context:
          "Amazon's first-person systems writing -- useful mental models for durable ingestion, backoff, and operating data-heavy paths at scale.",
      },
    ],
  },
  "event-driven-sagas-recovery": {
    kind: "further_reading",
    intro: "Sagas sit in the same shelf as operational recovery and partial failure -- classic, vendor-neutral primers below.",
    items: [
      {
        title: "Google  --  Site Reliability Engineering (book)",
        href: "https://sre.google/sre-book/table-of-contents/",
        context: "Chapter-level rigor on incident response, postmortems, and managing risk when distributed workflows misbehave.",
      },
      {
        title: "AWS Builders' Library",
        href: "https://aws.amazon.com/builders-library/",
        context: "Deep dives on retries, timeouts, and ownership boundaries -- pair with your saga state model and replay runbooks.",
      },
    ],
  },
  "dynamodb-hot-partitions": {
    kind: "further_reading",
    intro: "Partition behaviour and operating DynamoDB at load -- official docs plus builders-style narratives.",
    items: [
      {
        title: "Amazon DynamoDB  --  Developer Guide",
        href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Welcome.html",
        context: "Source of truth for throughput, throttling, and partition fundamentals when you argue from first principles.",
      },
      {
        title: "AWS Builders' Library",
        href: "https://aws.amazon.com/builders-library/",
        context: "Load and scaling stories that complement the Dynamo guide with production-shaped trade-offs.",
      },
    ],
  },
};
