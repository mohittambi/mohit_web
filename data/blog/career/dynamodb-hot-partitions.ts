import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook:
    "Scale architect credentialing question: what happens when the top 1% of keys drive most of your WCU -- and adaptive capacity is the only thing between you and a viral leaderboard?",
  strongVisual:
    "Heat map: one red partition vs cool neighbours; second panel after write-sharding with k read fan-out; annotate Zipf curve sketch.",
  linkedInThread: [
    "DynamoDB scales out -- until one partition key absorbs the Zipf tail. Adaptive capacity is triage, not architecture.",
    "Multi-tenant telemetry: partition design plus IAM ABAC / FGAC so tenant A never inherits a read path to tenant B's rows.",
    "Write sharding trades write heat for read fan-out -- model both before marketing turns the leaderboard knob.",
    "AWS partition key design: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html",
    `${blogPostUrl("dynamodb-hot-partitions")}  --  hot keys, buffers, load tests that are not uniform-random fiction.`,
    "What was your hottest partition key in prod?",
  ],
  diagramBrief: {
    title: "Hot partition → sharded writes",
    elements: [
      "Single partition key with fire icon; throttling lightning to client retries.",
      "Sharded write paths (suffix buckets) merging in aggregator job -- bottleneck on aggregator if undersized.",
      "Kinesis buffer absorbing 5 - 20s burst before writes hit table.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Identify top keys by consumed WCU/RCU; add skew to load tests.",
      "Prototype write shard + aggregation read path on staging.",
      "Define SLO for throttle rate and user-visible error budget.",
    ],
    month1: [
      "Roll out sharding for hottest season/key; monitor p99 and error budget.",
      "Tune buffer sizes; autoscale consumers ahead of marketing spikes.",
      "Document read fan-out limits for client teams.",
    ],
    scale: [
      "Seasonal key rotation playbook; pre-warm shards where predictable.",
      "Cross-region considerations for global counters -- sometimes another service owns the problem.",
      "Continuous skew monitoring in CI perf tests.",
    ],
  },
  interview30Sec:
    "I watch consumed capacity per key, not just table aggregates. When skew appears I shard writes, buffer bursts, and accept read fan-out with explicit SLOs -- not global capacity bumps as wallpaper.",
  cto1Min:
    "Week one I instrument skew and fix load tests to be Zipf-shaped. Month one I implement sharding with aggregation jobs and buffered ingress, with leadership-visible throttle SLOs. At scale I plan seasonal events and question whether Dynamo should own certain counter patterns at all.",
};
