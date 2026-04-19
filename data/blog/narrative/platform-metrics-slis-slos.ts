import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: B2B API; leadership dashboard showed 99.95% “uptime”; customers reported “constant timeouts.”",
    broke:
      "SLI measured load-balancer success only—~18% of client pain was >2s tail on app paths LB considered healthy; error budget never burned when trust did.",
    wrong_first:
      "We added more internal metrics pages—more charts, same wrong SLI; teams optimised what was easy to measure.",
    solution:
      "Redefine SLI from edge + representative tenants; multi-window burn; tie launches to budget policy; publish SLI definitions in git.",
    tradeoff:
      "We accepted harder conversations with product—some launches paused when burn was multi-week bad luck vs real regressions (we learned to separate).",
  },
  whatNot: [
    "I would not let “exclude bad bots” be an informal spreadsheet filter—write the policy or you are lying with extra steps.",
    "I would not pick SLO targets from competitor marketing pages—pick targets you can fund with error budget policy.",
  ],
  numbers: [
    "Tail: moving SLI from p99 ~800ms to ~350ms target changed roadmap pressure more than raising availability ninths.",
    "Review cadence: quarterly deep dive ~90 min with product+eng+finance stopped metric rot better than monthly vanity readouts.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "opentelemetry-sampling-cost", title: postTitleBySlug["opentelemetry-sampling-cost"], why: "SLIs and traces should agree; sampling policy is part of the contract." },
    { slug: "lambda-to-ecs-when-serverless-stops", title: postTitleBySlug["lambda-to-ecs-when-serverless-stops"], why: "Latency SLO misses often start at architecture boundaries." },
    { slug: "idp-without-boiling-ocean", title: postTitleBySlug["idp-without-boiling-ocean"], why: "Platform SLOs for golden paths beat per-team snowflakes." },
  ],
};
