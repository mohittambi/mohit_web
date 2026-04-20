import type { BlogPost } from "../types";

const TAIL_SAMPLING_MERMAID = `graph TD
    A[App: Checkout Service] -->|100% Traces| C[OTel Collector Gateway]
    B[App: Inventory Service] -->|100% Traces| C

    C --> D{Tail Sampling Processor}

    D -- "Policy: Error = True" --> E[Keep 100%]
    D -- "Policy: Latency > 2000ms" --> F[Keep 100%]
    D -- "Policy: Status = 200 OK" --> G[Keep 1%]

    E --> H[SaaS APM / Datadog]
    F --> H
    G --> H

    style C stroke:#E5E7EB,stroke-width:1px
    style D stroke:#00F0FF,stroke-width:2px`;

const HEAD_SAMPLING_TS = `import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { TraceIdRatioBasedSampler } from '@opentelemetry/core';

const provider = new NodeTracerProvider({
  // Only trace 1 in every 100 requests
  sampler: new TraceIdRatioBasedSampler(0.01),
});`;

const OTEL_COLLECTOR_YAML = `processors:
  tail_sampling:
    decision_wait: 10s # Wait for all spans in the distributed trace to arrive
    num_traces: 50000
    expected_new_traces_per_sec: 1000
    policies:
      # Rule 1: Always keep traces containing ANY errors
      - name: keep-errors
        type: status_code
        status_code:
          status_codes: [ERROR]

      # Rule 2: Always keep traces that took longer than 2 seconds
      - name: keep-slow-traces
        type: latency
        latency:
          threshold_ms: 2000

      # Rule 3: Keep a 1% baseline of successful, fast requests
      - name: baseline-probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 1`;

export const post: BlogPost = {
  slug: "opentelemetry-sampling-cost",
  title: "OpenTelemetry in Production: Sampling Strategies That Do Not Drown You in Cost",
  description:
    "The 20:1 observability-to-compute trap, ingestion vs indexing economics, head sampling vs tail sampling with collector YAML, decision_wait memory risk, and S3 + Athena as compliance-grade trace archive without SaaS index tax.",
  publishedAt: "2026-04-15",
  readTime: "11 min read",
  difficulty: "Intermediate",
  tags: ["OpenTelemetry", "Observability", "SRE", "Cost", "FinOps", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "There is a terrifying milestone in the lifecycle of every hyper-growth startup: the month your Observability bill exceeds your Compute bill.",
    },
    {
      kind: "p",
      text: "At one point in my career, we deployed distributed tracing across a fleet of microservices handling **5,000** requests per second. The engineering visibility was beautiful. Two weeks later, the Datadog invoice arrived. We had triggered what I call the **\"20:1 Danger Ratio\"**—we were spending **`$20`** to observe **`$1`** of compute.",
    },
    {
      kind: "p",
      text: "Logging every single `200 OK` response across a distributed architecture is financial negligence. But turning off tracing completely leaves you blind during a Sev-1 outage.",
    },
    {
      kind: "p",
      text: "In **2026**, the standard for solving this is **OpenTelemetry (OTel)**. But OTel is just a protocol; it doesn't save you money out of the box. To stop drowning in ingestion costs, you must master the architecture of **Tail-Based Sampling** and **Ingest-vs-Index** routing.",
    },
    {
      kind: "p",
      text: "Here is the Principal's guide to observability economics.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "1. The Economics of the Trace",
    },
    {
      kind: "p",
      text: "Modern APM vendors (Datadog, New Relic, Dynatrace) have evolved their pricing models to obscure the true cost of tracing. They split the bill into two phases:",
    },
    {
      kind: "ol",
      items: [
        "**Ingestion (The Network Tax):** You pay **`~$0.10`** per GB just to send the data to their servers.",
        "**Indexing/Retention (The Storage Tax):** You pay **`~$1.70`** per million indexed spans to keep them searchable for 15-30 days.",
      ],
    },
    {
      kind: "p",
      text: "If a single user checkout hits **8** microservices, that generates **8** spans. At **7M+** users, you are generating billions of spans a day.",
    },
    {
      kind: "p",
      text: "If you use **100%** sampling, you are literally paying a SaaS vendor to store millions of identical, successful database queries that no human will ever look at.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. Head Sampling: The Blunt Instrument",
    },
    {
      kind: "p",
      text: "The quickest way to cut costs is **Head-Based Sampling**.",
    },
    {
      kind: "p",
      text: "This happens at the application level (in your Node.js or Python SDK). When a request starts, a dice is rolled. If you set a **`1%`** sampling rate, **99%** of requests are dropped immediately.",
    },
    {
      kind: "code_block",
      language: "typescript",
      title: "instrumentation.ts",
      code: HEAD_SAMPLING_TS,
    },
    {
      kind: "p",
      text: "**The Problem:** Head sampling is mathematically blind. It drops **99%** of your traffic *before* it knows if the request succeeds or fails.",
    },
    {
      kind: "p",
      text: "If a rare bug causes a `500 Internal Server Error` once every **1,000** requests, Head Sampling has a **99%** chance of throwing away the exact trace you need to debug the outage.",
    },
    {
      kind: "p",
      text: "Head sampling saves your budget, but it destroys your Mean Time to Resolution (MTTR).",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "3. Tail-Based Sampling: The Principal's Choice",
    },
    {
      kind: "p",
      text: "To get the visibility of **100%** sampling with the cost of **1%** sampling, you must decouple generation from ingestion.",
    },
    {
      kind: "p",
      text: "This requires deploying an **OpenTelemetry Collector** inside your VPC (usually as a sidecar or a dedicated ECS cluster).",
    },
    {
      kind: "p",
      text: "Your applications generate **100%** of traces and send them to the local Collector (free local network transfer). The Collector holds the traces in memory, waits for the request to complete, and evaluates the *entire* trace against a set of rules.",
    },
    { kind: "mermaid", code: TAIL_SAMPLING_MERMAID },
    {
      kind: "p",
      text: "**The OTel Collector Configuration** — here is the exact **`tail_sampling`** processor configuration required to enforce this:",
    },
    {
      kind: "code_block",
      language: "yaml",
      title: "otel-collector-config.yaml",
      code: OTEL_COLLECTOR_YAML,
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The decision_wait Trap",
      text:
        "Tail sampling requires memory. If your `decision_wait` is `10s`, your OTel Collector must hold every single trace in memory for 10 seconds. Under heavy load, this will cause Out-Of-Memory (OOM) crashes on your Collector containers. You must strictly size your ECS Fargate tasks and monitor the `otelcol_processor_tail_sampling_memory` metric.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "4. The Ingest-vs-Index Hack: S3 as the DLQ for Traces",
    },
    {
      kind: "p",
      text: "What if compliance requires you to keep an immutable audit trail of *every* transaction, but you don't want to pay Datadog **`$1.70`/million** to index them?",
    },
    {
      kind: "p",
      text: "Use the OTel Collector's dual-export capabilities.",
    },
    {
      kind: "ol",
      items: [
        "Configure the **`tail_sampling`** processor to send the filtered high-value traces (errors, slow traces) to your expensive APM.",
        "Configure a secondary pipeline that sends **100%** of the raw trace data to an Amazon S3 bucket via the **`aws_s3`** exporter.",
      ],
    },
    {
      kind: "p",
      text: "Storage in **S3 Standard-IA** is **`~$0.0125`** per GB. It is practically free. If a customer disputes a transaction from **3** weeks ago, you use **Amazon Athena** to query the raw JSON traces in S3.",
    },
    {
      kind: "p",
      text: "You get compliance-grade durability without the SaaS indexing tax.",
    },
    {
      kind: "h2",
      text: "The Observability Readiness Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Disable SDK Head Sampling:** Set your Node/Java SDKs to **100%** sampling, but ensure they point to the *local* OTel Collector, never the public internet.",
        "**Setup Collector Auto-Scaling:** Tail sampling is CPU and memory intensive. Set up target-tracking scaling policies on your OTel Collector ECS tasks.",
        "**Trace Context Propagation:** Ensure your API Gateway and ALBs are passing the **`traceparent`** W3C headers, otherwise your distributed traces will break across service boundaries.",
      ],
    },
  ],
};
