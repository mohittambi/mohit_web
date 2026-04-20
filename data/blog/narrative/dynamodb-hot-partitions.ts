import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite (scale architect lane): viral 'global leaderboard' style feature backing a consumer app with **Senseahead**-style multi-tenant telemetry -- partition heat plus **ABAC** (IAM principal/session attributes + resource tags, DynamoDB FGAC) so tenant isolation is not only 'correct PK prefix in app code'; single partition key per season; ~12k writes/sec peak synthetic test before marketing turned the knob in prod.",
    broke:
      "Throttling cascaded -- client retries multiplied attempted writes; p99 user-facing latency >2s on reads colocated on hot partitions.",
    wrong_first:
      "We raised RCUs/WCUs globally -- expensive and did not fix skew; some partitions still screamed while others idled.",
    solution:
      "Write sharding with synthetic suffix bucket + aggregation job; Kinesis buffer in front for spikes; explicit load test that models Zipf popularity; ABAC-style IAM + resource tags so tenant A never gets a policy path to tenant B's keys -- even when someone ships a new reader Lambda.",
    tradeoff:
      "We accepted O(k) read fan-out on season rollups versus single-key elegance.",
  },
  whatNot: [
    "I would not treat adaptive capacity as a design strategy -- it is triage, not architecture.",
    "I would not shard writes without modelling the read path -- you are trading write heat for application complexity; own that explicitly.",
    "I would not grow ABAC tag matrices without a written attribute taxonomy -- pretty soon every engineer invents a new 'tenant-ish' tag and policies become undebuggable.",
  ],
  numbers: [
    "Skew: top 1% of keys drove ~40 - 65% of write throughput in our simulations -- YMMV, but order-of-magnitude is common on leaderboards.",
    "Buffer + stream: absorbing ~5 - 20s bursts at the queue saved the table from minutes-long throttle storms.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "Retrieval indexes and dedupe tables share the same skew discipline." },
    { slug: "lambda-to-ecs-when-serverless-stops", title: postTitleBySlug["lambda-to-ecs-when-serverless-stops"], why: "Throttling and retries amplify across serverless boundaries." },
    { slug: "idempotent-webhooks-outboxes-dlq", title: postTitleBySlug["idempotent-webhooks-outboxes-dlq"], why: "Dedupe and outbox rows are classic Dynamo hot-key sources." },
  ],
};
