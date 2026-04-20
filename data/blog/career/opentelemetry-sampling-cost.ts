import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "100% tracing is a vanity metric if nobody can query it during an outage -- or pay for it the next quarter.",
  strongVisual:
    "Before/after: cardinality explosion chart vs capped attributes + tail sampling policy box.",
  linkedInThread: [
    "Collector-side drops and attribute trims hit bill + cardinality; modest SDK head sampling saves CPU/egress on hot paths -- use both deliberately.",
    "Tail sampling usually belongs at the collector so policy sees the whole trace -- budget memory for the buffer.",
    "Cardinality is not abstract: one bad attribute can explode billable series -- treat allow-lists like API contracts.",
    "OpenTelemetry sampling concepts: https://opentelemetry.io/docs/concepts/signals/traces/#sampling",
    `${blogPostUrl("opentelemetry-sampling-cost")}  --  head vs tail, collector vs SDK, retention reality.`,
    "Which attribute exploded your trace bill?",
  ],
  diagramBrief: {
    title: "Trace path + sampling cuts",
    elements: [
      "SDK with small head-sample scissors; agent → collector with bigger scissors (noise, attributes).",
      "Tail sampling buffer box with memory warning; only error/slow pass through fat arrow.",
      "Backend query path: bottleneck if cardinality high -- slash through high-card attributes.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Baseline head sampling %; document parent-based policy.",
      "Drop rules for health/synthetics; attribute allow-list per service.",
      "Dashboard: ingest rate, dropped spans, collector lag.",
    ],
    month1: [
      "Tail sampling for error + latency SLO breach; load test collector under peak.",
      "Retention tiers with cost estimate per env.",
      "Training: how to temporary bump sampling during investigations with expiry tag.",
    ],
    scale: [
      "Per-tenant trace budgets if multi-tenant noise dominates.",
      "Federated traces across regions with consistent IDs.",
      "Vendor evaluation with query SLO and cardinality tests -- not feature matrices only.",
    ],
  },
  interview30Sec:
    "I use consistent head sampling plus tail sampling for errors and slow requests, cap cardinality, and drop noise like health checks. I size collectors for tail buffer delay and retention tiers so observability survives both incidents and finance reviews.",
  cto1Min:
    "Week one I establish sampling policy as code with allow-listed attributes. Month one I add tail sampling tied to SLO breaches and stress collectors under peak. At scale I introduce tenant-level trace budgets and cross-region correlation with explicit retention economics.",
};
