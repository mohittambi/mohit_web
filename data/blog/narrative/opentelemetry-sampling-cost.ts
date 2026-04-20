import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: ~220 microservices, Jaeger backend, aggressive 100% 'dev parity' sampling leaking toward prod.",
    broke:
      "Trace storage bill jumped ~2.4× quarter-on-quarter; trace queries p95 beyond ~8s during incidents -- exactly when people needed speed.",
    wrong_first:
      "We blanket-dropped spans in the UI instead of fixing cardinality -- teams stopped trusting traces during outages.",
    solution:
      "Collector-first drops and attribute trims for cost; modest SDK head sampling where export volume hurt CPU; consistent 10% head baseline, tail sampling on error + >500ms service time, aggressive drop rules for health checks and static assets.",
    tradeoff:
      "We accepted blind spots on 'green' traces -- debugging rare heisenbugs sometimes needs a temporary sampling bump with an expiry tag.",
  },
  whatNot: [
    "I would not chase 100% traces in prod for systems with fan-out >~40 child spans per request unless someone is paying for storage and query SRE time.",
    "I would not let high-cardinality attributes (raw URLs with ids) ship unguarded -- that is how vendors fund their yachts.",
    "I would not fix cost only in the SDK while ignoring collector pipelines -- you still pay for egress, fan-in, and tail buffers you never sized.",
  ],
  numbers: [
    "Cardinality: a single bad attribute exploded unique series from ~80k to >600k in one release week (order-of-magnitude).",
    "Tail sampling buffers: plan for ~5 - 15s additional export delay at the collector under load -- if your alerting assumes instant tails, you will lie to yourself.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "platform-metrics-slis-slos", title: postTitleBySlug["platform-metrics-slis-slos"], why: "Sampling policy and SLO burn should tell the same story." },
    { slug: "lambda-to-ecs-when-serverless-stops", title: postTitleBySlug["lambda-to-ecs-when-serverless-stops"], why: "Cold paths and ENI issues show up in traces first." },
    { slug: "idp-without-boiling-ocean", title: postTitleBySlug["idp-without-boiling-ocean"], why: "Platform teams standardise OTel -- golden paths beat mandate sprawl." },
  ],
};
